import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { pool } from "../db";
import { authMiddleware } from "../middleware/auth";
import { allowRoles } from "../middleware/roles";
import { config } from "../config";

const router = Router();

router.use(authMiddleware, allowRoles("admin"));

router.get("/", async (req, res) => {
  const [rows] = await pool.execute<any[]>(
    "SELECT id, nama, email, role, created_at, updated_at FROM users ORDER BY id DESC",
  );
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { nama, email, password, role = "viewer" } = req.body;
  if (!nama || !email || !password || !role) {
    return res.status(400).json({ message: "Field user tidak lengkap" });
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
    [nama, email, hashedPassword, role],
  );
  res.status(201).json({ message: "User berhasil dibuat" });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nama, email, role } = req.body;
  await pool.execute(
    "UPDATE users SET nama = ?, email = ?, role = ?, updated_at = NOW() WHERE id = ?",
    [nama, email, role, id],
  );
  res.json({ message: "User berhasil diperbarui" });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  res.json({ message: "User berhasil dihapus" });
});

router.post("/:id/reset-password", async (req, res) => {
  const { id } = req.params;
  const resetToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 3600 * 1000);

  await pool.execute(
    "UPDATE users SET reset_token = ?, reset_token_expired_at = ?, updated_at = NOW() WHERE id = ?",
    [resetToken, expiresAt, id],
  );

  if (config.smtp.email && config.smtp.password) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.smtp.email,
        pass: config.smtp.password,
      },
    });

    await transporter.sendMail({
      from: config.smtp.email,
      to: req.body.email,
      subject: "Reset Password Webdin",
      text: `Token reset password Anda: ${resetToken}`,
    });
  }

  res.json({
    message:
      "Token reset password dibuat. Silakan cek email atau gunakan token yang diberikan.",
  });
});

export default router;
