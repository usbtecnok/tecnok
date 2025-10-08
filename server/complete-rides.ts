import { db } from "./db";
import { rides } from "@shared/schema";
import { eq } from "drizzle-orm";

async function completeRides() {
  console.log("Marcando corridas como concluídas...");

  const allRides = await db.select().from(rides);
  
  if (allRides.length === 0) {
    console.log("Nenhuma corrida encontrada");
    return;
  }

  // Mark first ride as completed
  if (allRides.length > 0) {
    await db.update(rides)
      .set({ 
        status: 'completed',
        completedAt: new Date()
      })
      .where(eq(rides.id, allRides[0].id));
    console.log(`Corrida ${allRides[0].id.slice(0,8)} marcada como concluída`);
  }

  console.log("Concluído!");
  process.exit(0);
}

completeRides().catch((error) => {
  console.error("Erro:", error);
  process.exit(1);
});
