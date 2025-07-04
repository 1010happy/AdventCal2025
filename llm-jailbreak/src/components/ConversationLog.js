import React, { useEffect, useRef } from "react";
import santaImage from "../assets/santa.jpg"; // Santa's profile picture
import userImage from "../assets/user.jpg"; // User's profile picture

const ConversationLog = ({ log }) => {
  const logEndRef = useRef(null);

  // Auto-scroll to the bottom whenever the log changes
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div className="conversation-log">
      {log.map((entry, index) => {
        const isSanta = entry.startsWith("Santa:");
        const message = isSanta
          ? entry.replace("Santa:", "").trim()
          : entry.trim();

        return (
          <div
            key={index}
            className={`message-container ${isSanta ? "santa-message" : "user-message"}`}
          >
            <img
              src={isSanta ? santaImage : userImage}
              alt={isSanta ? "Santa" : "User"}
              className="profile-pic"
            />
            <p className={`message-text ${isSanta ? "santa-text" : "user-text"}`}>
              {message}
            </p>
          </div>
        );
      })}
      {/* This empty div ensures the scroll happens */}
      <div ref={logEndRef} />
    </div>
  );
};

export default ConversationLog;