import "dotenv/config";
import { createRequire } from "module";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// RENAME 'require' to 'cjsRequire' to avoid conflict with global Node types
const cjsRequire = createRequire(import.meta.url);

// Use the renamed variable
const { PrismaClient, Prisma } = cjsRequire("@prisma/client");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

prisma.$connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Export the Runtime Values (Enums like ArticleStatus, runtime helpers)
export { Prisma };

/**
 * GRACEFUL SHUTDOWN
 * Ensure the Prisma connection pool is closed when the process is terminated.
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received: closing database connection...`);
  try {
    await prisma.$disconnect();
    console.log("Database connection closed gracefully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during database disconnection:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));