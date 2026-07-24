import { Router } from "express";
import { pool } from "../db";
import { authMiddleware } from "../middleware/auth";
import { allowRoles } from "../middleware/roles";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const [rows] = await pool.execute<any[]>(
    "SELECT * FROM jenis_kegiatan ORDER BY id",
  );
  res.json(rows);
});

router.post("/", allowRoles("admin", "operator"), async (req, res) => {
  const { nama } = req.body;
  if (!nama) {
    return res.status(400).json({ message: "Nama jenis kegiatan wajib diisi" });
  }
  await pool.execute(
    "INSERT INTO jenis_kegiatan (nama, created_at, updated_at) VALUES (?, NOW(), NOW())",
    [nama],
  );
  res.status(201).json({ message: "Jenis kegiatan berhasil dibuat" });
});

router.put("/:id", allowRoles("admin", "operator"), async (req, res) => {
  const { id } = req.params;
  const { nama } = req.body;
  await pool.execute(
    "UPDATE jenis_kegiatan SET nama = ?, updated_at = NOW() WHERE id = ?",
    [nama, id],
  );
  res.json({ message: "Jenis kegiatan diperbarui" });
});

router.delete("/:id", allowRoles("admin", "operator"), async (req, res) => {
  const { id } = req.params;
  await pool.execute("DELETE FROM jenis_kegiatan WHERE id = ?", [id]);
  res.json({ message: "Jenis kegiatan dihapus" });
});

export default router;
