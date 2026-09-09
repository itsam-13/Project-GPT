import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotFound(false);
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        navigate("/");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setNotFound(true);
        setError("Invalid email or password.");
      } else {
        setError(err?.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />
      <div className="auth-orb auth-orb--3" />

      <div className="auth-card">
        {/* Branding */}
        <div className="auth-logo-row">
          <span className="auth-logo-icon">✦</span>
          <h1 className="auth-logo-name">GPT Clone</h1>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div className="auth-forgot-row">
            <a href="#" className="auth-forgot-link">
              Forgot password?
            </a>
          </div>

          {/* Error banner */}
          {error && (
            <div className="auth-error-banner">
              <span>⚠ {error}</span>
              {notFound && (
                <Link to="/register" className="auth-error-register-link">
                  Create an account →
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch-text">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-switch-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
