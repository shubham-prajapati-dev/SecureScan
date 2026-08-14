import React from "react";

function SecuritySection() {

  return (
    <section
      className="landing-security"
      id="security"
    >

      <div>

        <span>
          ADVANCED PROTECTION
        </span>

        <h2>
          Security you can trust.
        </h2>

        <p>
          Multiple layers of analysis help
          identify potential threats before
          they become a problem.
        </p>


        <div className="security-list">

          <div>
            ✓ SHA-256 file identification
          </div>

          <div>
            ✓ Malware signature analysis
          </div>

          <div>
            ✓ Threat risk scoring
          </div>

          <div>
            ✓ Detailed security reports
          </div>

        </div>

      </div>


      <div className="landing-security-icon">
        🛡️
      </div>

    </section>
  );
}

export default SecuritySection;