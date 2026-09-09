import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../api/axios";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", {
        fullName: {
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
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
        navigate("/login");
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 400) {
        setError(msg || "An account with this email already exists.");
      } else {
        setError("Something went wrong. Please try again.");
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

        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Join us and start chatting with AI</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* First / Last name — side-by-side on tablet+, stacked on mobile */}
          <div className="auth-name-row">
            <div className="auth-input-group">
              <label htmlFor="firstName" className="auth-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="lastName" className="auth-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
          </div>

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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          {/* Error banner */}
          {error && (
            <div className="auth-error-banner">
              <span>⚠ {error}</span>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
