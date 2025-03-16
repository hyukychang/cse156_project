import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import chatbotIcon from "./image/homeicon.png";
import userIcon from "./image/user.png";
import "./ChatbotResponse.css";

const API_URL = "http://127.0.0.1:5000"; 

const ChatbotResponse = () => {
  const location = useLocation();
  const initialMessage = location.state?.userMessage || "";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const chatWindowRef = useRef(null);
  const lastMessageRef = useRef(null);
  const inputRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const chatbotElement = document.getElementById("chatbot-response");
    if (chatbotElement) chatbotElement.style.background = "white";
    return () => {
      if (chatbotElement) chatbotElement.style.background = "";
    };
  }, []);

  const formatBotResponse = (data) => {
    if (!data || !data.User || !data.Date || !data.Time || !data.Intent) {
      return "⚠️ The server response is invalid. Please try again.";
    }
    return Boolean(data.Result)
      ? `🎉 Your request has been confirmed!\n\n` +
          `👤 Name: ${data.User}\n` +
          `📅 Date: ${formatDate(data.Date)}\n` +
          `⏰ Time: ${data.Time}\n` +
          `📌 Service: ${data.Task}\n` +
          `📝 Request Type: ${data.Intent}`
      : `❌ Reservation failed. Please check your details:\n\n` +
          `👤 Name: ${data.User}\n` +
          `📅 Date: ${formatDate(data.Date)}\n` +
          `⏰ Time: ${data.Time}\n` +
          `📌 Service: ${data.Task}\n` +
          `📝 Request Type: ${data.Intent}`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString + "T00:00:00");
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const handleBotResponse = useCallback(async (userInput) => {
    setIsBotResponding(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userInput, sender: "user" },
      { text: "", sender: "bot", isLoading: true }, // 로딩 애니메이션을 위한 메시지 추가
    ]);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      if (!res.ok) throw new Error(`Server response error: ${res.status}`);

      const data = await res.json();
      const responseData = data.response || data;

      setMessages((prevMessages) =>
        prevMessages
          .filter((msg) => !msg.isLoading) // 기존 로딩 메시지 제거
          .concat({ text: formatBotResponse(responseData), sender: "bot" }) // 응답 추가
      );
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages
          .filter((msg) => !msg.isLoading)
          .concat({ text: "⚠️ Missing Information: Make sure you have both date and time.", sender: "bot" })
      );
    } finally {
      setIsBotResponding(false);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current && initialMessage) {
      isFirstRender.current = false;
      handleBotResponse(initialMessage);
    }
  }, [initialMessage, handleBotResponse]);

  useEffect(() => {
    requestAnimationFrame(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages]);

  useEffect(() => {
    if (!isBotResponding) {
      inputRef.current?.focus();
    }
  }, [isBotResponding]);

  const handleSend = () => {
    if (!input.trim() || isBotResponding) return;
    handleBotResponse(input);
    setInput("");
  };

  return (
    <div id="chatbot-response" className="chatbot-response-container">
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
              <div key={index} className={`message-container ${msg.sender}`}>
                <img
                  src={msg.sender === "user" ? userIcon : chatbotIcon}
                  alt={`${msg.sender} avatar`}
                  className="chat-avatar"
                />
                <div
                  className={`response-message ${msg.sender} ${msg.isLoading ? "loading" : ""}`}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                >
                  {msg.isLoading ? <span className="loading-dots"></span> : <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chatbox-container">
        <div className="response-chat-input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            autoFocus
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
