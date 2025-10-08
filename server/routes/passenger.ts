import { Router } from "express";
import { storage } from "../storage";
import { insertRideSchema, insertPassengerSchema } from "@shared/schema";

const router = Router();

function normalizeRoute(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

router.post("/rides", async (req, res) => {
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
      estimatedPrice = `R$ ${matchedRoute.price}`;
    } else {
      estimatedPrice = `R$ ${(15 + Math.random() * 20).toFixed(2)}`;
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

router.get("/rides", async (req, res) => {
  try {
    const rides = await storage.getAllRides();
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rides" });
  }
});

router.post("/", async (req, res) => {
  try {
    const passengerData = insertPassengerSchema.parse(req.body);
    const passenger = await storage.createPassenger(passengerData);
    res.json(passenger);
  } catch (error) {
    res.status(400).json({ error: "Invalid passenger data" });
  }
});

router.get("/route-prices", async (req, res) => {
  try {
    const routePrices = await storage.getAllRoutePrices();
    res.json(routePrices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch route prices" });
  }
});

export default router;
