import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chatbotIcon from "./image/homeicon.png"; 
import moonIcon from "./image/moon.png";  
import sunIcon from "./image/sun.png";  
import "./Homepage.css";

const texts = [
  "Book Your Appointment.",
  "Cancel Your Appointment.",
  "Check Your Availability.",
  "Reschedule Your Appointment.",
  "Chat With Your Assistant"
];

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState("fade-in");
  const [isDarkMode, setIsDarkMode] = useState(true); 

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/chatbot");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFade("fade-out");
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setFade("fade-in");
      }, 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
    document.body.classList.toggle("light-mode");
  };

  return (
    <div className={`homepage-container ${isDarkMode ? "dark" : "light"}`}>
      
      <div className="top-left-navbar">
        <img src={chatbotIcon} alt="Chatbot Icon" className="top-left-icon" />
        <span className="top-left-text">Chatbot UI</span>
      </div>

 
      <div className="homepage-content">
        <h1>Chat Bot</h1>
        <h2 className={`animated-text ${fade}`}>{texts[index]}</h2>
        <div className="button-container">
          <button onClick={handleLogin}>Start</button>
        </div>
      </div>

      <button className="theme-toggle-btn" onClick={toggleTheme}>
        <img 
          src={isDarkMode ? sunIcon : moonIcon} 
          alt="Toggle Theme" 
          className="theme-icon" 
        />
      </button>
    </div>
  );
};

export default Homepage;
