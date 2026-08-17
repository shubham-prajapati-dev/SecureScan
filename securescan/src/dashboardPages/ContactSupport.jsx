import React, { useState } from "react";
import "./ContactSupport.css";

const SUPPORT_TICKETS_KEY = "securescan_support_tickets";

function ContactSupport({ onBack }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const ticket = { id: `ticket-${Date.now()}`, ...form, status: "Open", createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem(SUPPORT_TICKETS_KEY) || "[]");
    localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify([ticket, ...(Array.isArray(existing) ? existing : [])]));
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="support-page">
      <button className="support-back" onClick={onBack}>← Back to Help & Support</button>
      <div className="support-header"><span>SECURESCAN SUPPORT</span><h2>Contact Support</h2><p>Tell us what you need help with and keep your support request in one place.</p></div>
      <div className="support-layout">
        <div className="support-info">
          <div className="support-info-icon">💬</div><h3>We're here to help</h3><p>Use the form to report a problem, ask a question, or share feedback about SecureScan.</p>
          <div className="support-tip"><strong>Before contacting us</strong><span>Include the file name, scan status, error message, and steps that caused the issue. Never include passwords or private keys.</span></div>
          <div className="support-status"><i></i><div><strong>Support request</strong><span>Requests are saved locally in this browser.</span></div></div>
        </div>
        <form className="support-form" onSubmit={submit}>
          <div className="support-form-title"><h3>Send a request</h3><span>We'll use the details below to understand your issue.</span></div>
          {submitted && <div className="support-success">✓ Your support request has been recorded successfully.</div>}
          <div className="support-fields-two"><label>Name<input name="name" value={form.name} onChange={update} required placeholder="Your name" /></label><label>Email<input type="email" name="email" value={form.email} onChange={update} required placeholder="you@example.com" /></label></div>
          <label>Subject<input name="subject" value={form.subject} onChange={update} required placeholder="What can we help you with?" /></label>
          <label>Message<textarea name="message" value={form.message} onChange={update} required rows="7" placeholder="Describe your issue or question..."></textarea></label>
          <button className="support-submit" type="submit">Send Support Request →</button>
        </form>
      </div>
    </div>
  );
}

export default ContactSupport;
