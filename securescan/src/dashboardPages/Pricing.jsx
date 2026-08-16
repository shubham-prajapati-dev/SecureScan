import React, { useMemo, useState } from "react";
import "./Pricing.css";

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

function Pricing({ onBack }) {
  const [billing, setBilling] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(localStorage.getItem("securescan_plan") || "Premium");
  const plans = useMemo(() => PLANS[billing], [billing]);

  const choosePlan = (plan) => {
    localStorage.setItem("securescan_plan", plan.name);
    localStorage.setItem("securescan_billing", billing);
    setSelectedPlan(plan.name);
    window.dispatchEvent(new Event("securescan-plan-updated"));
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
            <button className="pricing-buy" onClick={() => choosePlan(plan)}>{selectedPlan === plan.name ? "Current Plan" : "Choose Plan"}</button>
            <div className="pricing-divider" />
            <ul>
              {plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}
            </ul>
          </article>
        ))}
      </div>

      <div className="pricing-note">
        <div><strong>Current plan: {selectedPlan}</strong><span>Plan selection is saved to this browser.</span></div>
        <button onClick={onBack}>← Back to Dashboard</button>
      </div>
    </section>
  );
}

export default Pricing;
