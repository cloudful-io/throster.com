import "dotenv/config";
import { defineConfig } from "prisma/config";

// Read DB URLs from environment (set in .env or .env.local)
const databaseUrl = process.env.DATABASE_URL as string | undefined;
const directUrl = process.env.DIRECT_URL as string | undefined;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Please set it in .env or .env.local");
}

export default defineConfig({
  // Configure the datasource connection for Prisma CLI and client
  datasource: {
    url: databaseUrl,
  },
});
