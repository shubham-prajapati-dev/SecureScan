import React, { useState } from "react";
import "./Login.css";

function Login({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }
    localStorage.setItem("securescan_logged_in", "true");
    localStorage.setItem("securescan_user_email", email.trim());
    setMessage("Login successful. Welcome to SecureScan!");
  };

  const handleGoogle = () => {
    setMessage("Google login is ready to be connected to your authentication provider.");
  };

  return (
    <section className="login-page">
      <div className="login-brand-panel">
        <div className="login-brand-mark">🛡️</div>
        <div className="login-brand-name">SecureScan</div>
        <p>Advanced file security for a safer digital workspace.</p>
        <div className="login-security-points">
          <span>✓ Secure malware scanning</span>
          <span>✓ VirusTotal-powered analysis</span>
          <span>✓ Reports, history and quarantine</span>
        </div>
      </div>

      <div className="login-form-panel">
        <button className="login-back" type="button" onClick={onBack}>← Back to Dashboard</button>
        <div className="login-form-wrap">
          <span className="login-eyebrow">SECURESCAN ACCOUNT</span>
          <h1>Welcome back!</h1>
          <p className="login-subtitle">Sign in to manage your scans, reports and security settings.</p>

          <form onSubmit={handleSubmit}>
            <label>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />

            <div className="login-label-row">
              <label>Password</label>
              <button type="button" onClick={() => setMessage("Password reset can be connected to your email authentication service.")}>Forgot password?</button>
            </div>
            <div className="login-password-field">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
            </div>

            <button className="login-submit" type="submit">Login to SecureScan</button>
          </form>

          <div className="login-divider"><span>OR</span></div>
          <button className="login-google" type="button" onClick={handleGoogle}>G&nbsp;&nbsp; Continue with Google</button>

          {message && <div className="login-message" role="status">{message}</div>}
          <p className="login-signup">Don't have an account? <button type="button" onClick={() => setMessage("Account creation can be connected to your authentication provider.")}>Create one</button></p>
        </div>
      </div>
    </section>
  );
}

export default Login;
