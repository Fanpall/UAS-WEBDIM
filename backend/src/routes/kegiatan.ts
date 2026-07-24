import { Router } from "express";
import multer from "multer";
import path from "path";
import { pool } from "../db";
import { authMiddleware } from "../middleware/auth";
import { allowRoles } from "../middleware/roles";

const router = Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const {
    search = "",
    jenis = "",
    status = "",
    page = "1",
    limit = "10",
  } = req.query as Record<string, string>;
  const offset = (Number(page) - 1) * Number(limit);

  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (search) {
    conditions.push("judul LIKE ?");
    params.push(`%${search}%`);
  }
  if (jenis) {
    conditions.push("jenis_kegiatan_id = ?");
    params.push(jenis);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const [rows] = await pool.execute<any[]>(
    `SELECT k.*, j.nama AS jenis_kegiatan FROM kegiatan k JOIN jenis_kegiatan j ON k.jenis_kegiatan_id = j.id ${whereClause} ORDER BY k.tanggal DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );

  const [countRows] = await pool.execute<any[]>(
    `SELECT COUNT(*) AS total FROM kegiatan ${whereClause}`,
    params,
  );
  res.json({ data: rows, total: countRows[0].total });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.execute<any[]>(
    "SELECT k.*, j.nama AS jenis_kegiatan FROM kegiatan k JOIN jenis_kegiatan j ON k.jenis_kegiatan_id = j.id WHERE k.id = ?",
    [id],
  );
  const activity = rows[0];
  if (!activity) {
    return res.status(404).json({ message: "Kegiatan tidak ditemukan" });
  }
  res.json(activity);
});

router.post("/", allowRoles("admin", "operator"), async (req, res) => {
  const { judul, jenis_kegiatan_id, tanggal, lokasi, status } = req.body;
  if (!judul || !jenis_kegiatan_id || !tanggal || !lokasi || !status) {
    return res.status(400).json({ message: "Field kegiatan tidak lengkap" });
  }

  await pool.execute(
    "INSERT INTO kegiatan (judul, jenis_kegiatan_id, tanggal, lokasi, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
    [judul, jenis_kegiatan_id, tanggal, lokasi, status],
  );
  res.status(201).json({ message: "Kegiatan berhasil dibuat" });
});

router.put("/:id", allowRoles("admin", "operator"), async (req, res) => {
  const { id } = req.params;
  const { judul, jenis_kegiatan_id, tanggal, lokasi, status } = req.body;
  await pool.execute(
    "UPDATE kegiatan SET judul = ?, jenis_kegiatan_id = ?, tanggal = ?, lokasi = ?, status = ?, updated_at = NOW() WHERE id = ?",
    [judul, jenis_kegiatan_id, tanggal, lokasi, status, id],
  );
  res.json({ message: "Kegiatan berhasil diperbarui" });
});

router.delete("/:id", allowRoles("admin", "operator"), async (req, res) => {
  const { id } = req.params;
  await pool.execute("DELETE FROM kegiatan WHERE id = ?", [id]);
  res.json({ message: "Kegiatan berhasil dihapus" });
});

router.post(
  "/:id/upload",
  allowRoles("admin", "operator"),
  upload.single("poster"),
  async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "File poster tidak ditemukan" });
    }
    const filename = path.basename(req.file.path);
    await pool.execute(
      "UPDATE kegiatan SET poster = ?, updated_at = NOW() WHERE id = ?",
      [filename, id],
    );
    res.json({ message: "Poster berhasil diunggah", poster: filename });
  },
);

export default router;
