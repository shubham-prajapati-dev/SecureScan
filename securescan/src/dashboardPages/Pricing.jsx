import React, { useMemo, useState } from "react";
import "./Pricing.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PLANS = {
  monthly: [
    { name: "Starter", price: 4, description: "For individuals and early experimentation", features: ["Perfect for beginners", "Unlock core security features", "Essential file scanning", "Basic scan reports"] },
    { name: "Pro", price: 14, description: "For professionals and growing teams", features: ["Higher usage limits", "Faster scan processing", "Advanced threat detection", "Priority security analysis"], featured: true },
    { name: "Enterprise", price: 34, description: "For organizations that need to scale", features: ["Advanced usage limits", "Enterprise-grade support", "Advanced security controls", "Integrated team workflow"] },
  ],
  annually: [
    { name: "Starter", price: 40, description: "For individuals and early experimentation", features: ["Perfect for beginners", "Unlock core security features", "Essential file scanning", "Basic scan reports"] },
    { name: "Pro", price: 140, description: "For professionals and growing teams", features: ["Higher usage limits", "Faster scan processing", "Advanced threat detection", "Priority security analysis"], featured: true },
    { name: "Enterprise", price: 340, description: "For organizations that need to scale", features: ["Advanced usage limits", "Enterprise-grade support", "Advanced security controls", "Integrated team workflow"] },
  ],
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Pricing({ onBack }) {
  const [billing, setBilling] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(localStorage.getItem("securescan_plan") || "Premium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const plans = useMemo(() => PLANS[billing], [billing]);

  const choosePlan = async (plan) => {
    if (plan.name !== "Pro") {
      setMessage("Razorpay checkout is currently enabled for the Pro plan.");
      return;
    }

    if (selectedPlan === "Pro") return;

    setLoading(true);
    setMessage("");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Unable to load Razorpay Checkout.");

      const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, { method: "POST" });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || "Unable to create payment order.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SecureScan",
        description: "SecureScan Pro",
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${API_URL}/api/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed.");
            }
            localStorage.setItem("securescan_plan", "Pro");
            localStorage.setItem("securescan_billing", billing);
            localStorage.setItem("securescan_payment_id", response.razorpay_payment_id);
            window.dispatchEvent(new Event("securescan-plan-updated"));
            setSelectedPlan("Pro");
            setMessage("Payment successful! SecureScan Pro is now active.");
          } catch (error) {
            setMessage(error.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#4f46e5" },
      });

      razorpay.open();
    } catch (error) {
      setMessage(error.message || "Unable to start payment.");
      setLoading(false);
    }
  };

  return (
    <section className="pricing-page">
      <div className="pricing-hero">
        <span className="pricing-eyebrow">SECURESCAN PLANS</span>
        <h1>Security that scales with you</h1>
        <p>Choose a plan that fits your scanning needs. Upgrade whenever your security requirements grow.</p>
        <div className="billing-toggle" role="tablist" aria-label="Billing period">
          <button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>Monthly</button>
          <button className={billing === "annually" ? "active" : ""} onClick={() => setBilling("annually")}>Annually <span>Save</span></button>
        </div>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article className={`pricing-card ${plan.featured ? "featured" : ""}`} key={plan.name}>
            {plan.featured && <div className="pricing-popular">MOST POPULAR</div>}
            <div className="pricing-plan-name">{plan.name}</div>
            <div className="pricing-price"><span>$</span>{plan.price}<small>{billing === "monthly" ? "per month" : "per year"}</small></div>
            <p className="pricing-description">{plan.description}</p>
            <button className="pricing-buy" disabled={loading && plan.name === "Pro"} onClick={() => choosePlan(plan)}>
              {selectedPlan === plan.name ? "Current Plan" : plan.name === "Pro" && loading ? "Opening payment..." : plan.name === "Pro" ? "Pay with Razorpay" : "Choose Plan"}
            </button>
            <div className="pricing-divider" />
            <ul>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
          </article>
        ))}
      </div>

      {message && <div className="pricing-note"><div><strong>{message}</strong></div></div>}

      <div className="pricing-note">
        <div><strong>Current plan: {selectedPlan}</strong><span>Pro access is activated after Razorpay payment verification.</span></div>
        <button onClick={onBack}>← Back to Dashboard</button>
      </div>
    </section>
  );
}

export default Pricing;
