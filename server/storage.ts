import { type Driver, type Passenger, type Ride, type RoutePrice, type Payment, type CreditPurchase, type InsertDriver, type InsertPassenger, type InsertRide, type InsertRoutePrice, type InsertPayment, type InsertCreditPurchase, drivers, passengers, rides, routePrices, payments, creditPurchases } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql as drizzleSql } from "drizzle-orm";

export interface IStorage {
  // Driver methods
  getDriver(id: string): Promise<Driver | undefined>;
  getDriverById(id: string): Promise<Driver | undefined>;
  getDriverByPhone(phone: string): Promise<Driver | undefined>;
  getDriverByEmail(email: string): Promise<Driver | undefined>;
  getAllDrivers(): Promise<Driver[]>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriverStatus(id: string, isOnline: number): Promise<Driver | undefined>;
  getOnlineDrivers(): Promise<Driver[]>;
  updateDriverLocation(id: string, latitude: string, longitude: string): Promise<Driver | undefined>;
  approveDriver(id: string): Promise<Driver | undefined>;

  // Passenger methods
  getPassenger(id: string): Promise<Passenger | undefined>;
  getPassengerByPhone(phone: string): Promise<Passenger | undefined>;
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;

  // Ride methods
  getRide(id: string): Promise<Ride | undefined>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRideStatus(id: string, status: string, driverId?: string): Promise<Ride | undefined>;
  updateRidePaymentMethod(id: string, paymentMethod: string): Promise<Ride | undefined>;
  getPendingRides(): Promise<Ride[]>;
  getActiveRidesByDriver(driverId: string): Promise<Ride[]>;
  getRidesByDriver(driverId: string): Promise<Ride[]>;
  getRidesByPassenger(passengerId: string): Promise<Ride[]>;
  getAllRides(): Promise<Ride[]>;

  // Route price methods
  getAllRoutePrices(): Promise<RoutePrice[]>;
  getRoutePriceByRoute(route: string): Promise<RoutePrice | undefined>;
  createRoutePrice(routePrice: InsertRoutePrice): Promise<RoutePrice>;
  bulkCreateRoutePrices(routePrices: InsertRoutePrice[]): Promise<RoutePrice[]>;

  // Driver earnings
  getDriverEarnings(driverId: string): Promise<{
    completedRides: number;
    totalEarnings: number;
    platformFee: number;
    netEarnings: number;
    pixKey: string | null;
  }>;

  // Payment methods
  getDriverPayments(driverId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Credit methods
  updateDriverCredits(driverId: string, credits: number): Promise<Driver | undefined>;
  deductCredit(driverId: string): Promise<Driver | undefined>;
  getCreditPurchases(driverId: string): Promise<CreditPurchase[]>;
  createCreditPurchase(purchase: InsertCreditPurchase): Promise<CreditPurchase>;
  confirmCreditPurchase(purchaseId: string): Promise<CreditPurchase | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Driver methods
  async getDriver(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async getDriverById(id: string): Promise<Driver | undefined> {
    return this.getDriver(id);
  }

  async getDriverByPhone(phone: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.phone, phone));
    return driver || undefined;
  }

  async getDriverByEmail(email: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.email, email));
    return driver || undefined;
  }

  async getAllDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db
      .insert(drivers)
      .values(insertDriver)
      .returning();
    return driver;
  }

  async updateDriverStatus(id: string, isOnline: number): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ isOnline })
      .where(eq(drivers.id, id))
      .returning();
    return driver || undefined;
  }

  async getOnlineDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.isOnline, 1));
  }

  async updateDriverLocation(id: string, latitude: string, longitude: string): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ latitude, longitude })
      .where(eq(drivers.id, id))
      .returning();
    return driver || undefined;
  }

  async approveDriver(id: string): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ isApproved: 1 })
      .where(eq(drivers.id, id))
      .returning();
    return driver || undefined;
  }

  // Passenger methods
  async getPassenger(id: string): Promise<Passenger | undefined> {
    const [passenger] = await db.select().from(passengers).where(eq(passengers.id, id));
    return passenger || undefined;
  }

  async getPassengerByPhone(phone: string): Promise<Passenger | undefined> {
    const [passenger] = await db.select().from(passengers).where(eq(passengers.phone, phone));
    return passenger || undefined;
  }

  async createPassenger(insertPassenger: InsertPassenger): Promise<Passenger> {
    const [passenger] = await db
      .insert(passengers)
      .values(insertPassenger)
      .returning();
    return passenger;
  }

  // Ride methods
  async getRide(id: string): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride || undefined;
  }

  async createRide(insertRide: InsertRide): Promise<Ride> {
    const [ride] = await db
      .insert(rides)
      .values(insertRide)
      .returning();
    return ride;
  }

  async updateRideStatus(id: string, status: string, driverId?: string): Promise<Ride | undefined> {
    const updateData: any = { status };
    
    if (driverId) {
      updateData.driverId = driverId;
    }
    
    if (status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const [ride] = await db
      .update(rides)
      .set(updateData)
      .where(eq(rides.id, id))
      .returning();
    return ride || undefined;
  }

  async updateRidePaymentMethod(id: string, paymentMethod: string): Promise<Ride | undefined> {
    const [ride] = await db
      .update(rides)
      .set({ paymentMethod })
      .where(eq(rides.id, id))
      .returning();
    return ride || undefined;
  }

  async getPendingRides(): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.status, 'pending'));
  }

  async getActiveRidesByDriver(driverId: string): Promise<Ride[]> {
    const allRides = await db.select().from(rides).where(eq(rides.driverId, driverId));
    return allRides.filter(ride => ride.status === 'accepted' || ride.status === 'in_progress');
  }

  async getRidesByDriver(driverId: string): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.driverId, driverId));
  }

  async getRidesByPassenger(passengerId: string): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.passengerId, passengerId));
  }

  async getAllRides(): Promise<Ride[]> {
    return await db.select().from(rides);
  }

  // Route price methods
  async getAllRoutePrices(): Promise<RoutePrice[]> {
    return await db.select().from(routePrices);
  }

  async getRoutePriceByRoute(route: string): Promise<RoutePrice | undefined> {
    const [routePrice] = await db.select().from(routePrices).where(eq(routePrices.route, route));
    return routePrice || undefined;
  }

  async createRoutePrice(insertRoutePrice: InsertRoutePrice): Promise<RoutePrice> {
    const [routePrice] = await db
      .insert(routePrices)
      .values(insertRoutePrice)
      .returning();
    return routePrice;
  }

  async bulkCreateRoutePrices(insertRoutePrices: InsertRoutePrice[]): Promise<RoutePrice[]> {
    const createdPrices = await db
      .insert(routePrices)
      .values(insertRoutePrices)
      .returning();
    return createdPrices;
  }

  async getDriverEarnings(driverId: string): Promise<{
    completedRides: number;
    totalEarnings: number;
    platformFee: number;
    netEarnings: number;
    pixKey: string | null;
  }> {
    const driver = await this.getDriver(driverId);
    const allRides = await db
      .select()
      .from(rides)
      .where(eq(rides.driverId, driverId));
    
    const completed = allRides.filter(ride => ride.status === 'completed');
    const completedCount = completed.length;
    
    const totalEarnings = completed.reduce((sum, ride) => {
      const priceStr = ride.estimatedPrice?.replace('R$', '').replace(/\s/g, '').replace(',', '.').trim() || '0';
      const price = parseFloat(priceStr);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    const platformFee = completedCount * 1.00;
    const netEarnings = totalEarnings - platformFee;
    
    return {
      completedRides: completedCount,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      netEarnings: Math.round(netEarnings * 100) / 100,
      pixKey: driver?.pixKey || null,
    };
  }

  async getDriverPayments(driverId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.driverId, driverId))
      .orderBy(desc(payments.paidAt));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  // Credit methods
  async updateDriverCredits(driverId: string, credits: number): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ credits })
      .where(eq(drivers.id, driverId))
      .returning();
    return driver || undefined;
  }

  async deductCredit(driverId: string): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ credits: drizzleSql`${drivers.credits} - 1` })
      .where(drizzleSql`${drivers.id} = ${driverId} AND ${drivers.credits} > 0`)
      .returning();
    return driver || undefined;
  }

  async getCreditPurchases(driverId: string): Promise<CreditPurchase[]> {
    return await db
      .select()
      .from(creditPurchases)
      .where(eq(creditPurchases.driverId, driverId))
      .orderBy(desc(creditPurchases.purchasedAt));
  }

  async createCreditPurchase(insertPurchase: InsertCreditPurchase): Promise<CreditPurchase> {
    const [purchase] = await db
      .insert(creditPurchases)
      .values(insertPurchase)
      .returning();
    return purchase;
  }

  async confirmCreditPurchase(purchaseId: string): Promise<CreditPurchase | undefined> {
    const [purchase] = await db
      .select()
      .from(creditPurchases)
      .where(eq(creditPurchases.id, purchaseId));
    
    if (!purchase) return undefined;

    const [confirmedPurchase] = await db
      .update(creditPurchases)
      .set({ status: 'confirmed' })
      .where(eq(creditPurchases.id, purchaseId))
      .returning();

    await db
      .update(drivers)
      .set({ credits: drizzleSql`${drivers.credits} + ${purchase.credits}` })
      .where(eq(drivers.id, purchase.driverId));

    return confirmedPurchase || undefined;
  }
}

export const storage = new DatabaseStorage();
