import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function verifyRLS() {
  console.log("🔒 Verifying Row Level Security status...\n");

  try {
    // Query the PostgreSQL system catalog to check RLS status
    const result = await prisma.$queryRaw<Array<{ tablename: string; rowsecurity: boolean }>>`
      SELECT 
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN (
          'users', 'owner', 'location', 'truck', 
          'transaction', 'logTransfer', 'notification', 'push_subscription'
        )
      ORDER BY tablename;
    `;

    console.log("=" .repeat(60));
    console.log("Table                              | RLS Status");
    console.log("-".repeat(60));

    let allEnabled = true;
    for (const table of result) {
      const status = table.rowsecurity ? "✅ ENABLED" : "❌ DISABLED";
      if (!table.rowsecurity) allEnabled = false;
      console.log(`${table.tablename.padEnd(35)}| ${status}`);
    }

    console.log("=" .repeat(60));

    if (allEnabled) {
      console.log("\n✅ Row Level Security is ENABLED on all application tables!");
      console.log("   The anon/public API cannot read or write data.");
      console.log("   Prisma connections bypass RLS and work normally.\n");
    } else {
      console.log("\n⚠️  Some tables do not have RLS enabled!");
    }

    return allEnabled;

  } catch (error) {
    console.error("❌ RLS verification failed:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

verifyRLS().then((success) => {
  process.exit(success ? 0 : 1);
});
