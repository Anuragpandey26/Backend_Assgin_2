import { prisma } from "./db.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.blacklistedToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const commonPassword = await bcrypt.hash("password123", saltRounds);

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: commonPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Analyst User",
      email: "analyst@example.com",
      password: commonPassword,
      role: "ANALYST",
      status: "ACTIVE",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Viewer User",
      email: "viewer@example.com",
      password: commonPassword,
      role: "VIEWER",
      status: "ACTIVE",
    },
  });

  const activeAnalyst = await prisma.user.create({
    data: {
      name: "Active Analyst",
      email: "active.analyst@example.com",
      password: commonPassword,
      role: "ANALYST",
      status: "ACTIVE",
    },
  });

  const inactiveAnalyst = await prisma.user.create({
    data: {
      name: "Retired Analyst",
      email: "retired.analyst@example.com",
      password: commonPassword,
      role: "ANALYST",
      status: "INACTIVE",
    },
  });

  console.log("Users created (Admin, Viewer, and multiple Analysts).");

  // 3. Create Budgets for active Analysts
  const categories = ["Groceries", "Entertainment", "Rent", "Utilities", "Travel", "Health"];
  const analysts = [analyst, activeAnalyst];

  for (const a of analysts) {
    for (const category of categories) {
      await prisma.budget.create({
        data: {
          userId: a.id,
          category,
          limit: Math.floor(Math.random() * 1000) + 500,
          period: "MONTHLY",
        },
      });
    }
  }

  console.log("Budgets created for analysts.");

  // 4. Create Financial Records across Analysts
  const types = ["INCOME", "EXPENSE"];
  const paymentMethods = ["Cash", "Credit Card", "Bank Transfer", "PayPal"];

  for (const a of analysts) {
    for (let i = 0; i < 15; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      await prisma.financialRecord.create({
        data: {
          userId: a.id,
          amount: Math.floor(Math.random() * 200) + 10,
          type: type,
          category: category,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
          notes: `Sample ${type.toLowerCase()} for ${category}`,
        },
      });
    }
  }

  console.log("Financial records created.");

  // 5. Create Audit Logs
  const auditActions = ["LOGIN", "SIGNUP", "LOGOUT", "CREATE_RECORD", "UPDATE_RECORD", "DELETE_RECORD"];
  const allUsers = [admin, viewer, analyst, activeAnalyst, inactiveAnalyst];

  for (const u of allUsers) {
    // Each user has 5-10 random audit logs
    const logCount = Math.floor(Math.random() * 5) + 5;
    for (let i = 0; i < logCount; i++) {
      await prisma.auditLog.create({
        data: {
          userId: u.id,
          action: auditActions[Math.floor(Math.random() * auditActions.length)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 500000000)),
          metadata: { ip: "127.0.0.1", userAgent: "Node.js Seeder" }
        },
      });
    }
  }

  console.log("Audit logs created.");
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
