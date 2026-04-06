"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "User already exists");
      router.push("/login");
      return;
    }

    alert("Registered successfully ✅");
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0b0d14;
          font-family: 'DM Sans', sans-serif;
          color: #e8eaf0;
          min-height: 100vh;
        }

        .page {
          display: flex;
          min-height: 100vh;
        }

        /* ── LEFT PANEL ── */
        .left {
          flex: 1.1;
          background: #0b0d14;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 64px 48px 64px;
          position: relative;
          overflow: hidden;
        }

        .left::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .left::after {
          content: '';
          position: absolute;
          bottom: -80px;
          right: 60px;
          width: 340px;
          height: 340px;
          background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: #f0f1f5;
          z-index: 1;
        }

        .logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon svg {
          width: 20px;
          height: 20px;
          fill: white;
        }

        .left-body {
          z-index: 1;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .eyebrow-line {
          width: 32px;
          height: 2px;
          background: #6366f1;
        }

        .eyebrow-text {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          color: #6366f1;
          text-transform: uppercase;
        }

        .headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 54px);
          line-height: 1.12;
          color: #f0f1f5;
          margin-bottom: 24px;
        }

        .headline em {
          font-style: italic;
          color: #818cf8;
        }

        .subtext {
          font-size: 15px;
          font-weight: 300;
          color: #6b7280;
          line-height: 1.7;
          max-width: 360px;
        }

        .stats {
          display: flex;
          gap: 40px;
          z-index: 1;
        }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #f0f1f5;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 12px;
          color: #4b5563;
          font-weight: 400;
          margin-top: 2px;
          letter-spacing: 0.02em;
        }

        /* ── RIGHT PANEL ── */
        .right {
          width: 420px;
          min-width: 380px;
          background: #11131e;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 48px;
          position: relative;
        }

        .right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
        }

        .portal-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          color: #4b5563;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          line-height: 1.2;
          color: #f0f1f5;
          margin-bottom: 36px;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          color: #4b5563;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .field input,
        .field select {
          width: 100%;
          background: #0b0d14;
          border: 1px solid #1e2130;
          border-radius: 8px;
          padding: 13px 16px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #c9cdd8;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }

        .field input::placeholder {
          color: #2e3347;
        }

        .field input:focus,
        .field select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .field select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234b5563' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }

        .field select option {
          background: #11131e;
          color: #c9cdd8;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          color: white;
          cursor: pointer;
          margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }

        .submit-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .login-redirect {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #4b5563;
        }

        .login-redirect span {
          color: #818cf8;
          cursor: pointer;
          transition: color 0.2s;
        }

        .login-redirect span:hover {
          color: #a5b4fc;
        }

        .security-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #1e2130;
        }

        .security-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4b5563;
          flex-shrink: 0;
        }

        .security-text {
          font-size: 11px;
          color: #374151;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .left { display: none; }
          .right { width: 100%; min-width: unset; padding: 48px 28px; }
        }
      `}</style>

      <div className="page">
        {/* ── LEFT ── */}
        <div className="left">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24"><path d="M3 17l4-8 4 4 4-6 4 10H3z"/></svg>
            </div>
            Verdant
          </div>

          <div className="left-body">
            <div className="eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Finance Intelligence Platform</span>
            </div>
            <h1 className="headline">
              Join the platform<br />built for <em>serious</em><br />finance teams.
            </h1>
            <p className="subtext">
              Role-based access control, real-time processing, and enterprise-grade audit trails — all in one unified backend.
            </p>
          </div>

          <div className=" ">
            
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <p className="portal-label">Secure Portal</p>
          <h2 className="form-title">Create your<br />account</h2>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Work Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="············"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="VIEWER">Viewer</option>
                <option value="ANALYST">Analyst</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>

          <p className="login-redirect">
            Already have an account?{" "}
            <span onClick={() => router.push("/login")}>Sign in</span>
          </p>

          <div className="security-note">
            <div className="" />
            
          </div>
        </div>
      </div>
    </>
  );
}