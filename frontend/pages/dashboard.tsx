import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { clearAuth, getStoredUser, type UserState } from "../lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      router.replace("/");
    } else {
      setUser(current);
    }
  }, [router]);

  if (!user) return null;

  const logout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Dashboard</h1>
        <p>
          Selamat datang, <strong>{user.name}</strong> ({user.role})
        </p>
        <nav>
          <a href="/jenis-kegiatan">Jenis Kegiatan</a>
          <a href="/kegiatan">Kegiatan</a>
          <a href="/peserta">Peserta</a>
          {user.role === "admin" && <a href="/users">User Management</a>}
          <button className="button secondary" onClick={logout}>
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}
