import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authFetch } from "../lib/api";
import { getStoredUser, clearAuth, type UserState } from "../lib/auth";

interface Jenis {
  id: number;
  nama: string;
}

export default function JenisKegiatanPage() {
  const router = useRouter();
  const [jenis, setJenis] = useState<Jenis[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    fetchJenis();
  }, [router]);

  const fetchJenis = async () => {
    try {
      const data = await authFetch("/jenis-kegiatan");
      setJenis(data);
    } catch (err: any) {
      if (err.message.includes("Token")) {
        clearAuth();
        router.replace("/");
      }
      setError(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("/jenis-kegiatan", {
        method: "POST",
        body: JSON.stringify({ nama: name }),
      });
      setSuccess("Jenis kegiatan berhasil dibuat");
      setName("");
      fetchJenis();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await authFetch(`/jenis-kegiatan/${id}`, { method: "DELETE" });
      fetchJenis();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div className="card">
        <h1>Jenis Kegiatan</h1>
        <p>Role: {user?.role}</p>
        <button
          className="button secondary"
          onClick={() => router.push("/dashboard")}
        >
          Kembali
        </button>
        {(error || success) && <div className="alert">{error || success}</div>}
        {user?.role !== "viewer" && (
          <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
            <label>Nama Jenis Kegiatan</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button className="button" type="submit">
              Tambah
            </button>
          </form>
        )}
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jenis.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nama}</td>
                <td>
                  {user?.role !== "viewer" ? (
                    <button
                      className="button secondary"
                      onClick={() => handleDelete(item.id)}
                    >
                      Hapus
                    </button>
                  ) : (
                    "Tidak ada aksi"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
