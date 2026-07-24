import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { config } from "../config";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password, role = "viewer" } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  const [existing] = await pool.execute<any[]>(
    "SELECT id FROM users WHERE email = ?",
    [email],
  );
  if (existing.length > 0) {
    return res.status(409).json({ message: "Email sudah terdaftar" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.execute(
    "INSERT INTO users (nama, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
    [name, email, hashedPassword, role],
  );

  return res.status(201).json({ message: "Registrasi berhasil" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  const [rows] = await pool.execute<any[]>(
    "SELECT id, nama, email, password, role FROM users WHERE email = ?",
    [email],
  );
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ message: "Email atau password salah" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Email atau password salah" });
  }

  const token = jwt.sign(
    { id: user.id, name: user.nama, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: "12h" },
  );

  res.json({
    token,
    user: { id: user.id, name: user.nama, email: user.email, role: user.role },
  });
});

router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

router.post("/logout", authMiddleware, (req: AuthRequest, res) => {
  return res.json({ message: "Logout berhasil" });
});

export default router;
