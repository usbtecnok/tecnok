import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRideSchema, insertPassengerSchema, insertDriverSchema } from "@shared/schema";
import passengerRoutes from "./routes/passenger";
import driverRoutes from "./routes/driver";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { z } from "zod";
import { ensureAdmin, ensureDriver } from "./middleware/admin-auth";

function normalizeRoute(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export async function registerRoutes(app: Express): Promise<Server> {
  const PgStore = connectPgSimple(session);
  
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required but not set. Please configure it before starting the application.");
  }
  
  app.use(
    session({
      store: new PgStore({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );
  
  app.use("/api/passenger", passengerRoutes);
  app.use("/api/driver", driverRoutes);

  app.post("/api/rides", async (req, res) => {
    try {
      const { passengerName, passengerPhone, ...rideFields } = req.body;
      
      let passenger = await storage.getPassengerByPhone(passengerPhone);
      if (!passenger) {
        passenger = await storage.createPassenger({
          name: passengerName || "Passageiro",
          phone: passengerPhone
        });
      }

      const routeKey = `${rideFields.origin} - ${rideFields.destination}`;
      const normalizedInput = normalizeRoute(routeKey);
      
      const allRoutePrices = await storage.getAllRoutePrices();
      const matchedRoute = allRoutePrices.find(rp => 
        normalizeRoute(rp.route) === normalizedInput
      );
      
      let estimatedPrice: string;
      if (matchedRoute) {
        // Usa preço fixo da tabela
        estimatedPrice = `R$ ${matchedRoute.price}`;
      } else {
        // Cálculo estilo Uber: R$ 5 (base) + R$ 2/km estimado
        // Estimativa inicial: 10km média para rotas não cadastradas
        const baseUber = 5.00;
        const estimatedKm = 10; // será substituído pelo Mapbox depois
        const ratePerKm = 2.00;
        const calculatedPrice = baseUber + (estimatedKm * ratePerKm);
        estimatedPrice = `R$ ${calculatedPrice.toFixed(2)} *`;
      }

      const rideData = insertRideSchema.parse({
        origin: rideFields.origin,
        destination: rideFields.destination,
        passengerCount: rideFields.passengerCount,
        passengerId: passenger.id,
        status: "pending",
        estimatedPrice,
        driverId: null
      });

      const ride = await storage.createRide(rideData);
      res.json(ride);
    } catch (error) {
      res.status(400).json({ error: "Invalid ride data" });
    }
  });

  app.get("/api/rides", ensureAdmin, async (req, res) => {
    try {
      const rides = await storage.getAllRides();
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rides" });
    }
  });

  app.post("/api/rides/by-phone", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      const passenger = await storage.getPassengerByPhone(phone);
      if (!passenger) {
        return res.json([]);
      }
      
      const rides = await storage.getRidesByPassenger(passenger.id);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rides" });
    }
  });

  app.get("/api/rides/pending", async (req, res) => {
    try {
      const pendingRides = await storage.getPendingRides();
      res.json(pendingRides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending rides" });
    }
  });

  app.patch("/api/rides/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, driverId } = req.body;
      
      console.log("🚕 Atualizando status da corrida:", { id, status, driverId });
      
      // Prevent accepting rides via this generic endpoint (use dedicated accept endpoint)
      if (status === "accepted") {
        return res.status(400).json({ 
          error: "Use dedicated accept endpoint", 
          message: "Use POST /api/driver/rides/:id/accept para aceitar corridas" 
        });
      }

      // Prevent assigning driverId via this endpoint
      if (driverId) {
        return res.status(400).json({
          error: "Cannot assign driver via this endpoint",
          message: "Não é possível atribuir motorista por esta rota"
        });
      }

      // Get current ride to validate transitions
      const currentRide = await storage.getRide(id);
      if (!currentRide) {
        return res.status(404).json({ error: "Ride not found" });
      }

      // Validate state transitions
      const validTransitions: Record<string, string[]> = {
        pending: ["cancelled"],  // Passenger can cancel
        accepted: ["in_progress", "cancelled"],  // Driver can start or cancel
        in_progress: ["completed", "cancelled"],  // Driver can complete or cancel
        completed: [],  // Final state
        cancelled: []  // Final state
      };

      if (!validTransitions[currentRide.status]?.includes(status)) {
        return res.status(400).json({
          error: "Invalid state transition",
          message: `Não é possível mudar de ${currentRide.status} para ${status}`
        });
      }
      
      const updatedRide = await storage.updateRideStatus(id, status);
      if (!updatedRide) {
        console.error("❌ Corrida não encontrada:", id);
        return res.status(404).json({ error: "Ride not found" });
      }
      
      console.log("✅ Corrida atualizada com sucesso:", updatedRide);
      res.json(updatedRide);
    } catch (error) {
      console.error("❌ Erro ao atualizar status da corrida:", error);
      res.status(500).json({ error: "Failed to update ride status" });
    }
  });

  app.patch("/api/rides/:id/payment-method", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;
      
      if (!paymentMethod || !['pix', 'cash'].includes(paymentMethod)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }
      
      const updatedRide = await storage.updateRidePaymentMethod(id, paymentMethod);
      if (!updatedRide) {
        return res.status(404).json({ error: "Ride not found" });
      }
      
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment method" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const driverData = insertDriverSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(driverData.password, 10);
      const driver = await storage.createDriver({
        ...driverData,
        password: hashedPassword,
      });
      const { password, ...driverWithoutPassword } = driver;
      res.json(driverWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Invalid driver data" });
    }
  });

  // Driver login endpoint
  app.post("/api/driver/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const driver = await storage.getDriverByEmail(email);
      if (!driver) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if driver is approved
      if (driver.isApproved !== 1) {
        return res.status(403).json({ 
          error: "Account pending approval",
          message: "Sua conta está aguardando aprovação do administrador" 
        });
      }

      const validPassword = await bcrypt.compare(password, driver.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ error: "Login failed" });
        }

        // Create driver session
        req.session.driverId = driver.id;
        req.session.isDriver = true;

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ error: "Login failed" });
          }

          res.json({ 
            id: driver.id, 
            name: driver.name, 
            email: driver.email,
            credits: driver.credits 
          });
        });
      });
    } catch (error) {
      console.error("Driver login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Driver logout endpoint
  app.post("/api/driver/logout", ensureDriver, async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Driver get current user endpoint
  app.get("/api/driver/me", ensureDriver, async (req, res) => {
    try {
      const driver = await storage.getDriver(req.session.driverId!);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      const { password, ...driverWithoutPassword } = driver;
      res.json(driverWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver" });
    }
  });

  app.get("/api/drivers", ensureAdmin, async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      const driversWithoutPassword = drivers.map(({ password, ...driver }) => driver);
      res.json(driversWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/all", ensureAdmin, async (req, res) => {
    try {
      const allDrivers = await storage.getAllDrivers();
      const driversWithoutPassword = allDrivers.map(({ password, ...driver }) => driver);
      res.json(driversWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all drivers" });
    }
  });

  app.patch("/api/drivers/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { isOnline } = req.body;
      
      const updatedDriver = await storage.updateDriverStatus(id, isOnline);
      if (!updatedDriver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      
      const { password, ...driverWithoutPassword } = updatedDriver;
      res.json(driverWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver status" });
    }
  });

  app.patch("/api/drivers/:id/location", async (req, res) => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;
      
      const updatedDriver = await storage.updateDriverLocation(id, latitude, longitude);
      if (!updatedDriver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      
      const { password, ...driverWithoutPassword } = updatedDriver;
      res.json(driverWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver location" });
    }
  });

  app.post("/api/passengers", async (req, res) => {
    try {
      const passengerData = insertPassengerSchema.parse(req.body);
      const passenger = await storage.createPassenger(passengerData);
      res.json(passenger);
    } catch (error) {
      res.status(400).json({ error: "Invalid passenger data" });
    }
  });

  app.get("/api/route-prices", async (req, res) => {
    try {
      const routePrices = await storage.getAllRoutePrices();
      res.json(routePrices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch route prices" });
    }
  });

  function generatePixPayload(pixKey: string, merchantName: string, amount: string, city: string = "Brasil", description: string = ""): string {
    function crc16(str: string): string {
      let crc = 0xFFFF;
      for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          if (crc & 0x8000) {
            crc = (crc << 1) ^ 0x1021;
          } else {
            crc = crc << 1;
          }
        }
      }
      return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    }

    function generateTxId(input: string): string {
      const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const txid = clean.slice(0, 25);
      return txid.length > 0 ? txid : "tecnok";
    }

    const payloadFormatIndicator = "000201";
    
    let merchantAccountInfo = `0014BR.GOV.BCB.PIX01${String(pixKey.length).padStart(2, '0')}${pixKey}`;
    if (description) {
      const descTag = `02${String(description.length).padStart(2, '0')}${description}`;
      merchantAccountInfo += descTag;
    }
    
    const merchantCategoryCode = "52040000";
    const transactionCurrency = "5303986";
    const transactionAmount = amount ? `54${String(amount.length).padStart(2, '0')}${amount}` : "";
    const countryCode = "5802BR";
    const merchantNameTag = `59${String(merchantName.length).padStart(2, '0')}${merchantName}`;
    const merchantCityTag = `60${String(city.length).padStart(2, '0')}${city}`;
    
    const txid = generateTxId(description || "tecnok");
    const additionalDataField = `62${String(4 + txid.length).padStart(2, '0')}05${String(txid.length).padStart(2, '0')}${txid}`;
    
    const payload = `${payloadFormatIndicator}26${String(merchantAccountInfo.length).padStart(2, '0')}${merchantAccountInfo}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantNameTag}${merchantCityTag}${additionalDataField}6304`;
    
    return payload + crc16(payload);
  }

  const pixQrCodeSchema = z.object({
    amount: z.string().refine((val) => {
      const num = parseFloat(val.replace(',', '.'));
      return !isNaN(num) && num >= 0;
    }, { message: "Valor inválido" }),
    description: z.string().max(50).optional()
  });

  app.post("/api/payments/pix-qrcode", async (req, res) => {
    try {
      const validated = pixQrCodeSchema.parse(req.body);
      
      const amountValue = parseFloat(validated.amount.replace(',', '.')).toFixed(2);
      const description = validated.description?.slice(0, 50) || "";
      
      const pixKey = "07217640881";
      const merchantName = "Aparecido de Goes";
      const city = "Brasil";
      
      const pixPayload = generatePixPayload(pixKey, merchantName, amountValue, city, description);
      const qrCodeDataURL = await QRCode.toDataURL(pixPayload);
      
      res.json({
        pixPayload,
        qrCode: qrCodeDataURL,
        pixKey,
        amount: amountValue,
        merchantName
      });
    } catch (error) {
      console.error("Error generating Pix QR Code:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate Pix QR Code" });
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", (req, res) => {
    const { email, senha } = req.body;
    
    if (email === "admin@tecnok.com.br" && senha === "admin123") {
      req.session.isAdmin = true;
      return res.json({ success: true });
    }
    
    res.status(401).json({ error: "Credenciais inválidas" });
  });

  app.post("/api/admin/logout", async (req, res) => {
    if (req.session) {
      req.session.isAdmin = false;
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao fazer logout" });
        }
        res.json({ message: "Logout realizado com sucesso" });
      });
    } else {
      res.json({ message: "Nenhuma sessão ativa" });
    }
  });

  app.get("/api/admin/check", async (req, res) => {
    const isAuthenticated = req.session?.isAdmin === true;
    res.json({ authenticated: isAuthenticated });
  });

  // Driver accepts ride (secure endpoint with credit check and authentication)
  app.post("/api/driver/rides/:rideId/accept", ensureDriver, async (req, res) => {
    try {
      const { rideId } = req.params;
      const driverId = req.session.driverId!; // Get from authenticated session

      console.log("🚀 Motorista tentando aceitar corrida:", { rideId, driverId });

      // Get ride and verify it's pending
      const ride = await storage.getRide(rideId);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }

      if (ride.status !== 'pending') {
        return res.status(400).json({ error: "Ride is not available", message: "Esta corrida não está mais disponível" });
      }

      // Get driver and check credits
      const driver = await storage.getDriver(driverId);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }

      if ((driver.credits || 0) <= 0) {
        console.log("❌ Motorista sem créditos:", driverId);
        return res.status(402).json({ 
          error: "Insufficient credits", 
          message: "Você precisa comprar créditos para aceitar corridas" 
        });
      }

      // Deduct credit atomically (only succeeds if credits > 0)
      const updatedDriver = await storage.deductCredit(driverId);
      if (!updatedDriver) {
        console.log("❌ Falha ao descontar crédito (race condition ou sem créditos)");
        return res.status(402).json({ 
          error: "Insufficient credits", 
          message: "Não foi possível descontar crédito. Verifique seu saldo." 
        });
      }

      console.log("💳 Crédito descontado. Novo saldo:", updatedDriver.credits);

      // Update ride status to accepted
      const updatedRide = await storage.updateRideStatus(rideId, "accepted", driverId);
      if (!updatedRide) {
        // Rollback credit if ride update fails
        await storage.updateDriverCredits(driverId, (updatedDriver.credits || 0) + 1);
        console.log("❌ Falha ao aceitar corrida, crédito devolvido");
        return res.status(500).json({ error: "Failed to accept ride" });
      }

      console.log("✅ Corrida aceita com sucesso:", updatedRide);
      res.json(updatedRide);
    } catch (error) {
      console.error("❌ Erro ao aceitar corrida:", error);
      res.status(500).json({ error: "Failed to accept ride" });
    }
  });

  // Credit system routes
  app.get("/api/driver/:driverId/credits", ensureDriver, async (req, res) => {
    try {
      const { driverId } = req.params;
      
      // Verify ownership
      if (req.session.driverId !== driverId) {
        return res.status(403).json({ error: "Forbidden: Cannot access another driver's credits" });
      }
      
      const driver = await storage.getDriver(driverId);
      
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      
      res.json({ credits: driver.credits || 0 });
    } catch (error) {
      console.error("Error fetching driver credits:", error);
      res.status(500).json({ error: "Failed to fetch credits" });
    }
  });

  app.get("/api/driver/:driverId/credit-purchases", ensureDriver, async (req, res) => {
    try {
      const { driverId } = req.params;
      
      // Verify ownership
      if (req.session.driverId !== driverId) {
        return res.status(403).json({ error: "Forbidden: Cannot access another driver's purchases" });
      }
      
      const purchases = await storage.getCreditPurchases(driverId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching credit purchases:", error);
      res.status(500).json({ error: "Failed to fetch credit purchases" });
    }
  });

  app.post("/api/driver/:driverId/credit-purchase", ensureDriver, async (req, res) => {
    try {
      const { driverId } = req.params;
      
      // Verify ownership
      if (req.session.driverId !== driverId) {
        return res.status(403).json({ error: "Forbidden: Cannot purchase for another driver" });
      }
      
      const { credits, amount } = req.body;

      if (!credits || !amount) {
        return res.status(400).json({ error: "Credits and amount are required" });
      }

      const purchase = await storage.createCreditPurchase({
        driverId,
        credits: parseInt(credits),
        amount: amount.toString(),
        status: "pending"
      });

      res.json(purchase);
    } catch (error) {
      console.error("Error creating credit purchase:", error);
      res.status(500).json({ error: "Failed to create credit purchase" });
    }
  });

  app.post("/api/admin/credit-purchase/:purchaseId/confirm", ensureAdmin, async (req, res) => {
    try {
      const { purchaseId } = req.params;
      const confirmedPurchase = await storage.confirmCreditPurchase(purchaseId);
      
      if (!confirmedPurchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      res.json(confirmedPurchase);
    } catch (error) {
      console.error("Error confirming credit purchase:", error);
      res.status(500).json({ error: "Failed to confirm credit purchase" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
