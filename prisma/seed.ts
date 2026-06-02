import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const DEFAULT_PASSWORD = "Password123";

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.$transaction([
    prisma.logTransfer.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.user.deleteMany(),
    prisma.location.deleteMany(),
    prisma.owner.deleteMany(),
    prisma.truck.deleteMany(),
  ]);

  const locations = [
    {
      id: randomUUID(),
      name: "Malang",
      sugar_price: 14500,
      account_balance: 500000000,
    },
    {
      id: randomUUID(),
      name: "Blitar",
      sugar_price: 14200,
      account_balance: 300000000,
    },
    {
      id: randomUUID(),
      name: "Kediri 1",
      sugar_price: 14300,
      account_balance: 250000000,
    },
    {
      id: randomUUID(),
      name: "Kediri 2",
      sugar_price: 14300,
      account_balance: 200000000,
    },
  ];

  await prisma.location.createMany({
    data: locations,
  });

  const locationMap = new Map(locations.map((location) => [location.name, location.id]));

  await prisma.user.createMany({
    data: [
      {
        name: "Admin Cabang",
        email: "branch@example.com",
        password: passwordHash,
        role: "operator",
        location_id: locationMap.get("Malang") as string,
      },
      {
        name: "Admin Keuangan",
        email: "finance@example.com",
        password: passwordHash,
        role: "finance",
        location_id: locationMap.get("Blitar") as string,
      },
      {
        name: "Manager",
        email: "manager@example.com",
        password: passwordHash,
        role: "manager",
        location_id: locationMap.get("Kediri 1") as string,
      },
    ],
  });

  console.log("Seed completed: locations and 3 users created.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });