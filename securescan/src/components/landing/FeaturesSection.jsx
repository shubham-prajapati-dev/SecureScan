import React from "react";

function FeaturesSection() {

  const features = [
    {
      icon: "🔍",
      title: "Deep File Scanning",
      text: "Analyze files for malicious code, viruses, Trojans and suspicious behavior.",
    },
    {
      icon: "🧬",
      title: "Threat Detection",
      text: "Identify malware signatures and potentially dangerous file activity.",
    },
    {
      icon: "⚡",
      title: "Fast Analysis",
      text: "Get detailed security results quickly without complicated configuration.",
    },
    {
      icon: "🗃️",
      title: "Safe Quarantine",
      text: "Isolate dangerous files so they cannot harm your system.",
    },
  ];

  return (
    <section
      className="landing-info"
      id="features"
    >

      <div className="landing-title">

        <span>
          POWERFUL SECURITY
        </span>

        <h2>
          Everything you need to stay protected
        </h2>

        <p>
          Powerful security tools designed to
          keep your files and data safe.
        </p>

      </div>


      <div className="landing-feature-grid">

        {features.map((feature) => (

          <div
            className="landing-feature"
            key={feature.title}
          >

            <div className="feature-icon">
              {feature.icon}
            </div>

            <h3>
              {feature.title}
            </h3>

            <p>
              {feature.text}
            </p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default FeaturesSection;