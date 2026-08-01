import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function createUser(e) {
    e.preventDefault();
    setError("");

    const data = await register(username, password);

    if (data.status) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setError(data.error || "Registration failed");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={createUser}>
        <h1>Register</h1>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">Account created, redirecting to login…</p>}

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

        <button type="submit">Create account</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
