import { useLocation } from "react-router-dom"; 
import { useState, useRef, useEffect } from "react";
import chatbotIcon from "./image/homeicon.png";
import "./ChatbotResponse.css"; 

const ChatbotResponse = () => {
  const location = useLocation();
  const initialMessage = location.state?.userMessage || "";
  const [messages, setMessages] = useState([{ text: initialMessage, sender: "user" }]);
  const [input, setInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const chatWindowRef = useRef(null);

  const handleSend = () => {
    if (!input.trim() || isBotResponding) return;

    setMessages((prevMessages) => [...prevMessages, { text: input, sender: "user" }]);
    setInput("");
    setIsBotResponding(true);

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "This is a bot response.", sender: "bot" },
      ]);
      setIsBotResponding(false);
    }, 1000);
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      setTimeout(() => {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }, 0);
    }
  }, [messages]);

  return (
    <div className="chatbot-response-container">
      <div className="top-left-navbar">
        <img src={chatbotIcon} alt="Chatbot Icon" className="top-left-icon" />
        <span className="top-left-text">Chatbot UI</span>
      </div>

      <div className="chat-content-wrapper">
        <div className="chat-content" ref={chatWindowRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`response-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
      </div>

      <div className="chatbox-container">
        <div className="response-chat-input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isBotResponding ? "Waiting for response..." : "Type a message..."}
            className="response-chat-input"
            disabled={isBotResponding}
          />
          <button className="response-chat-send-btn" onClick={handleSend} disabled={isBotResponding}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotResponse;
