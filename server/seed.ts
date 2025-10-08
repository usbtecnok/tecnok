import { db } from "./db";
import { drivers } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if drivers already exist
  const existingDrivers = await db.select().from(drivers);
  if (existingDrivers.length > 0) {
    console.log("✅ Database already seeded");
    return;
  }

  // Create mock drivers
  const mockDrivers = [
    {
      name: "João Silva",
      phone: "+5521999123456",
      vehicleModel: "Civic 2020",
      vehiclePlate: "ABC-1234",
      isOnline: 1,
      latitude: "-22.9068",
      longitude: "-43.1729"
    },
    {
      name: "Maria Santos",
      phone: "+5521999234567",
      vehicleModel: "Corolla 2019",
      vehiclePlate: "DEF-5678",
      isOnline: 1,
      latitude: "-22.9128",
      longitude: "-43.1819"
    },
    {
      name: "Pedro Costa",
      phone: "+5521999345678",
      vehicleModel: "HB20 2021",
      vehiclePlate: "GHI-9012",
      isOnline: 0,
      latitude: "-22.9088",
      longitude: "-43.1759"
    }
  ];

  for (const driver of mockDrivers) {
    await db.insert(drivers).values(driver);
  }

  console.log("✅ Database seeded successfully with 3 drivers");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
