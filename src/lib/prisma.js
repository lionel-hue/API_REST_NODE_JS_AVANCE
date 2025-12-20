import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaBetterSqlite3({ url: connectionString }***REMOVED***;
const prisma = new PrismaClient({ adapter }***REMOVED***;

export default prisma;
