import React, { useState } from "react";

function DashboardHeader({ activePage }) {
  const [showNotifications, setShowNotifications] =
    useState(false);

  const notifications = [
    {
      id: 1,
      icon: "⚠️",
      title: "Threat Detected",
      message: "A malicious file was detected.",
      time: "2 min ago",
      type: "danger",
    },
    {
      id: 2,
      icon: "🛡️",
      title: "Scan Completed",
      message: "Your file scan has completed.",
      time: "18 min ago",
      type: "success",
    },
    {
      id: 3,
      icon: "📄",
      title: "New Report",
      message: "Your security report is ready.",
      time: "1 hour ago",
      type: "info",
    },
  ];

  return (
    <header className="dashboard-header">

      {/* LEFT SIDE */}
      <div className="dashboard-header-info">
        <h1>{activePage}</h1>

        <p>
          Stay safe by scanning your files
          for malicious threats.
        </p>
      </div>


      {/* RIGHT SIDE */}
      <div className="header-actions">

        {/* Notification */}
        <div className="notification-wrapper">

          <button
            className={`notification-button ${
              showNotifications
                ? "notification-active"
                : ""
            }`}
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
            aria-label="Notifications"
          >

            <svg
              className="bell-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M18 8a6 6 0 0 0-12 0
                c0 7-3 7-3 9h18c0-2-3-2-3-9"
              />

              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {/* Unread badge */}
            <span className="notification-badge">
              3
            </span>

            {/* Pulse */}
            <span className="notification-pulse"></span>

          </button>


          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="notification-dropdown">

              <div className="notification-dropdown-header">

                <div>
                  <h3>
                    Notifications
                  </h3>

                  <span>
                    3 unread notifications
                  </span>
                </div>

                <button>
                  Mark all read
                </button>

              </div>


              <div className="notification-list">

                {notifications.map(
                  (notification) => (

                    <div
                      className="notification-item"
                      key={notification.id}
                    >

                      <div
                        className={`notification-item-icon ${notification.type}`}
                      >
                        {notification.icon}
                      </div>

                      <div className="notification-item-content">

                        <strong>
                          {notification.title}
                        </strong>

                        <p>
                          {notification.message}
                        </p>

                        <span>
                          {notification.time}
                        </span>

                      </div>

                      <span className="unread-dot"></span>

                    </div>

                  )
                )}

              </div>


              <button className="view-all-notifications">
                View all →
              </button>

            </div>
          )}

        </div>


        {/* Theme / Profile Action */}
        <button
          className="header-theme-button"
          aria-label="Toggle theme"
        >
          ◐
        </button>

      </div>

    </header>
  );
}

export default DashboardHeader;