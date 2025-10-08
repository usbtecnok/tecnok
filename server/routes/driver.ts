import { Router } from "express";
import { storage } from "../storage";
import { insertDriverSchema, driverLoginSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { ensureAdmin } from "../middleware/admin-auth";

const router = Router();

router.post("/", async (req, res) => {
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = driverLoginSchema.parse(req.body);
    const driver = await storage.getDriverByEmail(email);
    
    if (!driver) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }
    
    const isValidPassword = await bcrypt.compare(password, driver.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }
    
    if (driver.isApproved !== 1) {
      return res.status(403).json({ error: "Cadastro ainda não aprovado. Aguarde a aprovação do administrador." });
    }
    
    if (!req.session) {
      return res.status(500).json({ error: "Session not configured" });
    }
    
    req.session.driverId = driver.id;
    
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Erro ao salvar sessão" });
      }
      
      const { password: _, ...driverWithoutPassword } = driver;
      res.json(driverWithoutPassword);
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: "Dados de login inválidos" });
  }
});

router.post("/logout", async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  } else {
    res.json({ message: "Nenhuma sessão ativa" });
  }
});

router.get("/me", async (req, res) => {
  try {
    if (!req.session?.driverId) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    const driver = await storage.getDriverById(req.session.driverId);
    if (!driver) {
      return res.status(404).json({ error: "Motorista não encontrado" });
    }
    
    const { password, ...driverWithoutPassword } = driver;
    res.json(driverWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados do motorista" });
  }
});

router.get("/", async (req, res) => {
  try {
    const drivers = await storage.getAllDrivers();
    const driversWithoutPassword = drivers.map(({ password, ...driver }) => driver);
    res.json(driversWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const allDrivers = await storage.getAllDrivers();
    const driversWithoutPassword = allDrivers.map(({ password, ...driver }) => driver);
    res.json(driversWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all drivers" });
  }
});

router.patch("/:id/status", async (req, res) => {
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

router.patch("/:id/location", async (req, res) => {
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

router.get("/pending", ensureAdmin, async (req, res) => {
  try {
    const allDrivers = await storage.getAllDrivers();
    const pendingDrivers = allDrivers
      .filter(driver => driver.isApproved === 0)
      .map(({ password, ...driver }) => driver);
    res.json(pendingDrivers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending drivers" });
  }
});

router.patch("/:id/approve", ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDriver = await storage.approveDriver(id);
    
    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    
    const { password, ...driverWithoutPassword } = updatedDriver;
    res.json(driverWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve driver" });
  }
});

router.get("/rides/pending", async (req, res) => {
  try {
    const pendingRides = await storage.getPendingRides();
    res.json(pendingRides);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending rides" });
  }
});

router.get("/rides/active", async (req, res) => {
  try {
    const { driverId } = req.query;
    if (!driverId) {
      return res.status(400).json({ error: "driverId is required" });
    }
    const activeRides = await storage.getActiveRidesByDriver(driverId as string);
    res.json(activeRides);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active rides" });
  }
});

router.patch("/rides/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;
    
    const updatedRide = await storage.updateRideStatus(id, status, driverId);
    if (!updatedRide) {
      return res.status(404).json({ error: "Ride not found" });
    }
    
    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ error: "Failed to update ride status" });
  }
});

router.get("/earnings/:driverId", async (req, res) => {
  try {
    if (!req.session?.driverId) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    const { driverId } = req.params;
    
    if (req.session.driverId !== driverId) {
      return res.status(403).json({ error: "Não autorizado a acessar esses dados" });
    }
    
    const earnings = await storage.getDriverEarnings(driverId);
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch driver earnings" });
  }
});

router.get("/payments/:driverId", async (req, res) => {
  try {
    if (!req.session?.driverId) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    const { driverId } = req.params;
    
    if (req.session.driverId !== driverId) {
      return res.status(403).json({ error: "Não autorizado a acessar esses dados" });
    }
    
    const payments = await storage.getDriverPayments(driverId);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch driver payments" });
  }
});

export default router;
