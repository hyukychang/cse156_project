import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import chatbotIcon from "./image/homeicon.png";
import "./ChatbotResponse.css";

const API_URL = "https://129a-34-125-102-213.ngrok-free.app";

const ChatbotResponse = () => {
  const location = useLocation();
  const initialMessage = location.state?.userMessage || "";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const chatWindowRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (chatWindowRef.current) {
      setTimeout(() => {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }, 0);
    }
  }, [messages]);

  useEffect(() => {
    if (isFirstRender.current && initialMessage) {
      isFirstRender.current = false;
      handleBotResponse(initialMessage);
    }
  }, [initialMessage]);

  const handleBotResponse = async (userInput) => {
    setIsBotResponding(true);
    setMessages((prevMessages) => [...prevMessages, { text: userInput, sender: "user" }]);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      if (!res.ok) throw new Error(`Server response error: ${res.status}`);

      const data = await res.json();
      console.log("📌 Server response data:", data);

      const responseData = data.response || data;

      if (!responseData.User || !responseData.Time || !responseData.Intent || !responseData.Task || !responseData.Date) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "⚠️ The server response is invalid. Please try again.", sender: "bot" },
        ]);
        setIsBotResponding(false);
        return;
      }

      const formattedResponse = `
      **User:** ${responseData.User}
      **Time:** ${responseData.Time}
      **Intent:** ${responseData.Intent}
      **Task:** ${responseData.Task}
      **Date:** ${responseData.Date}
      `;

      setMessages((prevMessages) => [...prevMessages, { text: formattedResponse, sender: "bot" }]);
    } catch (error) {
      console.error("API request failed:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "⚠️ Server connection failed.", sender: "bot" },
      ]);
    } finally {
      setIsBotResponding(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isBotResponding) return;
    handleBotResponse(input);
    setInput("");
  };

  return (
    <div className="chatbot-response-container">
      <div className="top-left-navbar">
        <img src={chatbotIcon} alt="Chatbot Icon" className="top-left-icon" />
        <span className="top-left-text">Chatbot UI</span>
      </div>

      <div className="chat-content-wrapper">
        <div className="chat-content" ref={chatWindowRef}>
          {messages.length === 0 ? (
            <p className="empty-chat">No messages yet. Start a conversation!</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`response-message ${msg.sender}`}>
                <pre>{msg.text}</pre>
              </div>
            ))
          )}
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
