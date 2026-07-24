import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import jenisRoutes from "./routes/jenisKegiatan";
import kegiatanRoutes from "./routes/kegiatan";
import pesertaRoutes from "./routes/peserta";
import { config } from "./config";

const app = express();
fs.mkdirSync(path.resolve(__dirname, "../uploads"), { recursive: true });

const allowedOrigins = [
  config.frontendUrl,
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3002",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jenis-kegiatan", jenisRoutes);
app.use("/api/kegiatan", kegiatanRoutes);
app.use("/api/peserta", pesertaRoutes);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  },
);

app.listen(config.port, () => {
  console.log(`Backend running on port ${config.port}`);
});
