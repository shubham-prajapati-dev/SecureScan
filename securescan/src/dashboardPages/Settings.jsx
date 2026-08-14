import React, { useState } from "react";

function Settings() {

  const [protection, setProtection] =
    useState(true);

  const [notifications, setNotifications] =
    useState(true);

  return (
    <div className="individual-page">

      <h2>Settings</h2>

      <p>
        Configure your SecureScan preferences.
      </p>


      <div className="simple-page-card">

        <div className="setting-row">

          <div>
            <strong>
              Real-time Protection
            </strong>

            <p>
              Continuously monitor files.
            </p>
          </div>

          <button
            onClick={() =>
              setProtection(!protection)
            }
          >
            {protection
              ? "Enabled"
              : "Disabled"}
          </button>

        </div>


        <div className="setting-row">

          <div>
            <strong>
              Notifications
            </strong>

            <p>
              Receive security alerts.
            </p>
          </div>

          <button
            onClick={() =>
              setNotifications(!notifications)
            }
          >
            {notifications
              ? "Enabled"
              : "Disabled"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;