import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authFetch } from "../lib/api";
import { getStoredUser, clearAuth, type UserState } from "../lib/auth";

interface Peserta {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  kegiatan: string;
}

interface Kegiatan {
  id: number;
  judul: string;
}

export default function PesertaPage() {
  const router = useRouter();
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    fetchPeserta();
    fetchKegiatan();
  }, [router]);

  const fetchPeserta = async () => {
    try {
      const params = selectedKegiatan ? `?kegiatan_id=${selectedKegiatan}` : "";
      const data = await authFetch(`/peserta${params}`);
      setPeserta(data);
    } catch (err: any) {
      setMessage(err.message);
      if (err.message.includes("Token")) {
        clearAuth();
        router.replace("/");
      }
    }
  };

  const fetchKegiatan = async () => {
    try {
      const data = await authFetch("/kegiatan?page=1&limit=50");
      setKegiatan(data.data);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("/peserta", {
        method: "POST",
        body: JSON.stringify({
          kegiatan_id: selectedKegiatan,
          nama,
          email,
          no_hp: noHp,
        }),
      });
      setMessage("Peserta berhasil ditambahkan");
      setNama("");
      setEmail("");
      setNoHp("");
      fetchPeserta();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div className="card">
        <h1>Peserta Kegiatan</h1>
        <button
          className="button secondary"
          onClick={() => router.push("/dashboard")}
        >
          Kembali
        </button>
        {message && <div className="alert">{message}</div>}
        <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
          <label>Pilih Kegiatan</label>
          <select
            value={selectedKegiatan}
            onChange={(e) => setSelectedKegiatan(e.target.value)}
          >
            <option value="">Pilih kegiatan</option>
            {kegiatan.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.judul}
              </option>
            ))}
          </select>
          <label>Nama</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} />
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <label>No HP</label>
          <input value={noHp} onChange={(e) => setNoHp(e.target.value)} />
          <button className="button" type="submit">
            Tambah Peserta
          </button>
        </form>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Daftar Peserta</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>No HP</th>
                <th>Kegiatan</th>
              </tr>
            </thead>
            <tbody>
              {peserta.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nama}</td>
                  <td>{item.email}</td>
                  <td>{item.no_hp}</td>
                  <td>{item.kegiatan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
