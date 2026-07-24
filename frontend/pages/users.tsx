import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authFetch } from "../lib/api";
import { getStoredUser, clearAuth, type UserState } from "../lib/auth";

interface UserItem {
  id: number;
  nama: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      router.replace("/");
      return;
    }
    if (current.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setUser(current);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const data = await authFetch("/users");
      setUsers(data);
    } catch (err: any) {
      setMessage(err.message);
      if (err.message.includes("Token")) {
        clearAuth();
        router.replace("/");
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("/users", {
        method: "POST",
        body: JSON.stringify({ nama, email, password, role }),
      });
      setMessage("User berhasil dibuat");
      setNama("");
      setEmail("");
      setPassword("");
      setRole("viewer");
      fetchUsers();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div className="card">
        <h1>User Management</h1>
        <button
          className="button secondary"
          onClick={() => router.push("/dashboard")}
        >
          Kembali
        </button>
        {message && <div className="alert">{message}</div>}
        <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
          <label>Nama</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} />
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">admin</option>
            <option value="operator">operator</option>
            <option value="viewer">viewer</option>
          </select>
          <button className="button" type="submit">
            Buat User
          </button>
        </form>
        <div className="card" style={{ marginTop: 24 }}>
          <h2>Daftar User</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nama}</td>
                  <td>{item.email}</td>
                  <td>{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
