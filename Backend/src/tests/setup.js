// src/tests/setup.js
// Set environment variables for testing before any modules are loaded
process.env.JWT_SECRET = "test-secret-key-at-least-32-characters-long-for-security";
process.env.ACCESS_TOKEN_EXPIRY = "15m";
process.env.REFRESH_TOKEN_EXPIRY = "30d";
process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";
process.env.NODE_ENV = "test";
