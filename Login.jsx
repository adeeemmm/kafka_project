import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const data = await login(username, password);

    if (data.token) {
      navigate("/chat");
    } else {
      setError(data.error || "Login failed");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleLogin}>
        <h1>Login</h1>

        {error && <p className="error">{error}</p>}

        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
