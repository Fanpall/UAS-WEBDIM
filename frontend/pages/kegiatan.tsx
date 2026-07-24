import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authFetch } from "../lib/api";
import { getStoredUser, clearAuth, type UserState } from "../lib/auth";

interface Jenis {
  id: number;
  nama: string;
}

interface KegiatanItem {
  id: number;
  judul: string;
  jenis_kegiatan: string;
  tanggal: string;
  lokasi: string;
  status: string;
  poster: string | null;
}

export default function KegiatanPage() {
  const router = useRouter();
  const [kegiatan, setKegiatan] = useState<KegiatanItem[]>([]);
  const [jenis, setJenis] = useState<Jenis[]>([]);
  const [judul, setJudul] = useState("");
  const [jenisId, setJenisId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [status, setStatus] = useState("Terjadwal");
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    fetchData();
    fetchJenis();
  }, [router, page, search, filterJenis, filterStatus]);

  const fetchData = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (filterJenis) query.set("jenis", filterJenis);
      if (filterStatus) query.set("status", filterStatus);
      query.set("page", String(page));
      query.set("limit", "10");
      const data = await authFetch(`/kegiatan?${query.toString()}`);
      setKegiatan(data.data);
      setTotal(data.total);
    } catch (err: any) {
      setMessage(err.message);
      if (err.message.includes("Token")) {
        clearAuth();
        router.replace("/");
      }
    }
  };

  const fetchJenis = async () => {
    try {
      const data = await authFetch("/jenis-kegiatan");
      setJenis(data);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("/kegiatan", {
        method: "POST",
        body: JSON.stringify({
          judul,
          jenis_kegiatan_id: jenisId,
          tanggal,
          lokasi,
          status,
        }),
      });
      setMessage("Kegiatan berhasil dibuat");
      setJudul("");
      setJenisId("");
      setTanggal("");
      setLokasi("");
      fetchData();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !file) {
      setMessage("Pilih kegiatan dan file poster terlebih dahulu");
      return;
    }
    try {
      const form = new FormData();
      form.append("poster", file);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"}/kegiatan/${selectedId}/upload`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Upload gagal");
      setMessage("Poster berhasil diunggah");
      setFile(null);
      fetchData();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await authFetch(`/kegiatan/${id}`, { method: "DELETE" });
      setMessage("Kegiatan dihapus");
      fetchData();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  if (!user) return null;

  return (
    <div className="container">
      <div className="card">
        <h1>Kegiatan</h1>
        <button
          className="button secondary"
          onClick={() => router.push("/dashboard")}
        >
          Kembali
        </button>
        {message && <div className="alert">{message}</div>}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2>Tambah Kegiatan</h2>
            <form onSubmit={handleCreate}>
              <label>Judul</label>
              <input value={judul} onChange={(e) => setJudul(e.target.value)} />
              <label>Jenis Kegiatan</label>
              <select
                value={jenisId}
                onChange={(e) => setJenisId(e.target.value)}
              >
                <option value="">Pilih jenis</option>
                {jenis.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.nama}
                  </option>
                ))}
              </select>
              <label>Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
              <label>Lokasi</label>
              <input
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
              />
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Terjadwal</option>
                <option>Selesai</option>
                <option>Batal</option>
              </select>
              <button className="button" type="submit">
                Simpan
              </button>
            </form>
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            <h2>Upload Poster</h2>
            <form onSubmit={handleUpload}>
              <label>Pilih Kegiatan</label>
              <select
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(Number(e.target.value) || null)}
              >
                <option value="">Pilih kegiatan</option>
                {kegiatan.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.judul}
                  </option>
                ))}
              </select>
              <label>File poster (jpg/png)</label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button className="button" type="submit">
                Upload
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <h2>Daftar Kegiatan</h2>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <input
              placeholder="Search judul"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="">Semua jenis</option>
              {jenis.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.nama}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua status</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Selesai">Selesai</option>
              <option value="Batal">Batal</option>
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Judul</th>
                <th>Jenis</th>
                <th>Tanggal</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Poster</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kegiatan.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.judul}</td>
                  <td>{item.jenis_kegiatan}</td>
                  <td>{item.tanggal}</td>
                  <td>{item.lokasi}</td>
                  <td>{item.status}</td>
                  <td>
                    {item.poster ? (
                      <img
                        src={`http://localhost:3000/uploads/${item.poster}`}
                        alt="poster"
                        style={{ maxWidth: 120 }}
                      />
                    ) : (
                      "Belum"
                    )}
                  </td>
                  <td>
                    {user?.role !== "viewer" && (
                      <button
                        className="button secondary"
                        onClick={() => handleDelete(item.id)}
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <button
              className="button secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </button>
            <span style={{ margin: "0 12px" }}>
              Halaman {page} dari {totalPages}
            </span>
            <button
              className="button secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
