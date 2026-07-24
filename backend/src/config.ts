import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "webdin",
  },
  jwtSecret: process.env.JWT_SECRET ?? "secret",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3001",
  smtp: {
    email: process.env.SMTP_EMAIL ?? "",
    password: process.env.SMTP_PASSWORD ?? "",
  },
};
