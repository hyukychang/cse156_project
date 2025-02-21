import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/chatbot");
  };

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <h1>Welcome to AI Chatbot</h1>
        <p className="subtitle">Sign in to start chatting with our AI-powered assistant</p>
        <div className="button-container">
          <button onClick={handleLogin}>Start</button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
