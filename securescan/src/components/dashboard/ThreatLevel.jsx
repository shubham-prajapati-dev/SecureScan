import React from "react";

function ThreatLevel() {

  return (
    <div className="threat-level card">

      <h2>
        Threat Level
      </h2>


      <div className="threat-content">

        <div className="risk-ring">

          <div>

            <strong>
              High
            </strong>

            <span>
              Risk Detected
            </span>

          </div>

        </div>


        <div className="threat-message">

          <p>
            Potential threats were found in
            <strong> 2 files.</strong>
          </p>

          <p>
            We recommend immediate action.
          </p>

          <button>
            View Details
          </button>

        </div>

      </div>

    </div>
  );
}

export default ThreatLevel;