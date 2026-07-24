import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { loginRequest } from "../lib/api";
import { getStoredUser, setStoredUser } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (getStoredUser()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const data = await loginRequest(email, password);
      setStoredUser(data.user, data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login gagal");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: 80 }}>
      <div className="card">
        <h1>Login Webdin</h1>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          <button className="button" type="submit">
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
