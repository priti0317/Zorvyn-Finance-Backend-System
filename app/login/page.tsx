"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #07080f;
          color: #e8e6f0;
          overflow: hidden;
          position: relative;
        }

        /* Ambient background */
        .login-root::before {
          content: '';
          position: absolute;
          top: -20%;
          right: -10%;
          width: 650px;
          height: 650px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-root::after {
          content: '';
          position: absolute;
          bottom: -15%;
          left: -5%;
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Grid texture overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Left panel */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 56px 64px;
          border-right: 1px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 1;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-mark {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-mark svg {
          width: 20px;
          height: 20px;
        }

        .brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          letter-spacing: 0.01em;
          color: #f0ede8;
        }

        .hero-text {
          max-width: 420px;
        }

        .hero-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #a78bfa;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hero-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #a78bfa;
        }

        .hero-headline {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.1;
          color: #f0eeff;
          margin-bottom: 24px;
        }

        .hero-headline em {
          font-style: italic;
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 15px;
          font-weight: 300;
          color: rgba(224,220,255,0.45);
          line-height: 1.7;
          max-width: 340px;
        }

        .stats-row {
          display: flex;
          gap: 40px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-value {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #f0eeff;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 300;
          color: rgba(224,220,255,0.35);
          letter-spacing: 0.05em;
        }

        /* Right panel */
        .right-panel {
          width: 480px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 56px;
          position: relative;
          z-index: 1;
        }

        .form-header {
          margin-bottom: 44px;
        }

        .form-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(167,139,250,0.5);
          margin-bottom: 10px;
        }

        .form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #f0eeff;
          line-height: 1.15;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 32px;
        }

        .field {
          position: relative;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(224,220,255,0.4);
          margin-bottom: 10px;
          transition: color 0.2s;
        }

        .field.is-focused .field-label {
          color: #a78bfa;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #f0eeff;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }

        .field-input::placeholder {
          color: rgba(224,220,255,0.15);
        }

        .field-input:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.05);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }

        .field-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d0d1f inset;
          -webkit-text-fill-color: #f0eeff;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 28px;
        }

        .forgot-link {
          font-size: 13px;
          font-weight: 300;
          color: rgba(224,220,255,0.3);
          text-decoration: none;
          transition: color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
        }

        .forgot-link:hover {
          color: #a78bfa;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #ffffff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(139,92,246,0.3);
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(139,92,246,0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: -2px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .security-note {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 300;
          color: rgba(224,220,255,0.22);
        }

        .security-note svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          opacity: 0.4;
        }

        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; padding: 40px 32px; }
        }
      `}</style>

      <div className="login-root">
        <div className="grid-overlay" />

        {/* Left panel */}
        <div className="left-panel">
          <div className="brand">
            <div className="brand-mark">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 14L7 9L10.5 12L14 6L17 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="10" r="1.5" fill="white"/>
              </svg>
            </div>
            <span className="brand-name">Verdant</span>
          </div>

          <div className="hero-text">
            <div className="hero-label">Finance Intelligence Platform</div>
            <h1 className="hero-headline">
              Secure access to<br /><em>financial data</em><br />that moves fast.
            </h1>
            <p className="hero-sub">
              Role-based access control, real-time processing, and enterprise-grade audit trails — all in one unified backend.
            </p>
          </div>

          <div className=" ">
            
          </div>
        </div>

        {/* Right panel */}
        <div className="right-panel">
          <div className="form-header">
            <div className="form-eyebrow">Secure Portal</div>
            <div className="form-title">Sign in to<br />your account</div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <div className={`field ${focused === "email" ? "is-focused" : ""}`}>
                <label className="field-label">Work Email</label>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>

              <div className={`field ${focused === "password" ? "is-focused" : ""}`}>
                <label className="field-label">Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

            {/* <div className="form-footer">
              <button type="button" className="forgot-link">Forgot password?</button>
            </div> */}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Authenticating…" : "Sign In"}
            </button>
          </form>

          <div className="security-note">
            <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1L2 3V7C2 9.76 4.24 12.36 7 13C9.76 12.36 12 9.76 12 7V3L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
           
          </div>
        </div>
      </div>
    </>
  );
}