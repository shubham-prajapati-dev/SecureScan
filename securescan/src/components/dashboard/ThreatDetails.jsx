import React from "react";

function ThreatDetails() {

  return (
    <div className="threat-details">

      <h2>
        Threat Details
      </h2>


      <div className="threat-name">
        ⚠️ Trojan:Win32/Agent.XZ
      </div>


      <div className="severity">
        Severity:
        <span>● ● ● ●</span>
      </div>


      <p>
        <strong>
          Infected File:
        </strong>

        <br />

        setup_new_v2.3.exe
      </p>


      <p>
        <strong>
          Location:
        </strong>

        <br />

        C:\Users\Anumat\Downloads\
        setup_new_v2.3.exe
      </p>


      <p>
        <strong>
          Description:
        </strong>

        <br />

        This Trojan is designed to steal
        sensitive data and gain unauthorized
        access.
      </p>


      <p>
        <strong>
          Recommended Action:
        </strong>

        <br />

        Quarantine and remove the file
        immediately.
      </p>


      <button className="quarantine-large">
        ♙ Quarantine File
      </button>

    </div>
  );
}

export default ThreatDetails;