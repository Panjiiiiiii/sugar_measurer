import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function testConnection() {
  console.log("🔌 Testing Supabase connection...\n");

  try {
    // Test basic query
    const userCount = await prisma.user.count();
    const ownerCount = await prisma.owner.count();
    const truckCount = await prisma.truck.count();
    const locationCount = await prisma.location.count();

    console.log("✅ Connected to Supabase successfully!");
    console.log(`✅ Found ${userCount} users`);
    console.log(`✅ Found ${ownerCount} owners`);
    console.log(`✅ Found ${truckCount} trucks`);
    console.log(`✅ Found ${locationCount} locations\n`);

    // Test a complex query with relations
    const recentTransaction = await prisma.transaction.findFirst({
      include: {
        user: { select: { name: true, email: true } },
        truck: { select: { license_plate: true } },
        owner: { select: { name: true } },
        location: { select: { name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    if (recentTransaction) {
      console.log("✅ Complex query with relations works:");
      console.log(`   Transaction ID: ${recentTransaction.id.substring(0, 8)}...`);
      console.log(`   User: ${recentTransaction.user.name} (${recentTransaction.user.email})`);
      console.log(`   Truck: ${recentTransaction.truck.license_plate}`);
      console.log(`   Owner: ${recentTransaction.owner?.name || "N/A"}`);
      console.log(`   Location: ${recentTransaction.location.name}`);
      console.log(`   Status: ${recentTransaction.status}`);
    }

    console.log("\n✅ All database operations working correctly with Supabase!");

  } catch (error) {
    console.error("❌ Connection test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
