import { Router } from "express";
import { pool } from "../db";
import { authMiddleware } from "../middleware/auth";
import { allowRoles } from "../middleware/roles";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const { kegiatan_id } = req.query as Record<string, string>;
  const params: Array<string | number> = [];
  let query =
    "SELECT p.*, k.judul AS kegiatan FROM peserta p JOIN kegiatan k ON p.kegiatan_id = k.id";

  if (kegiatan_id) {
    query += " WHERE p.kegiatan_id = ?";
    params.push(kegiatan_id);
  }

  query += " ORDER BY p.created_at DESC";
  const [rows] = await pool.execute<any[]>(query, params);
  res.json(rows);
});

router.post("/", allowRoles("admin", "operator"), async (req, res) => {
  const { kegiatan_id, nama, email, no_hp } = req.body;
  if (!kegiatan_id || !nama || !email || !no_hp) {
    return res.status(400).json({ message: "Field peserta tidak lengkap" });
  }

  await pool.execute(
    "INSERT INTO peserta (kegiatan_id, nama, email, no_hp, created_at) VALUES (?, ?, ?, ?, NOW())",
    [kegiatan_id, nama, email, no_hp],
  );
  res.status(201).json({ message: "Peserta berhasil ditambahkan" });
});

router.put("/:id", allowRoles("admin", "operator"), async (req, res) => {
  const { id } = req.params;
  const { nama, email, no_hp } = req.body;
  await pool.execute(
    "UPDATE peserta SET nama = ?, email = ?, no_hp = ? WHERE id = ?",
    [nama, email, no_hp, id],
  );
  res.json({ message: "Peserta berhasil diperbarui" });
});

router.delete("/:id", allowRoles("admin", "operator"), async (req, res) => {
  const { id } = req.params;
  await pool.execute("DELETE FROM peserta WHERE id = ?", [id]);
  res.json({ message: "Peserta berhasil dihapus" });
});

export default router;
