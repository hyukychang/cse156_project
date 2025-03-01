import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import chatbotIcon from "./image/homeicon.png";
import userIcon from "./image/user.png";
import "./ChatbotResponse.css";

const API_URL = "http://127.0.0.1:5000";
// const API_URL = "https://0d76-34-16-164-181.ngrok-free.app";

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
    if (
      !data ||
      !data.User ||
      !data.Date ||
      !data.Time ||
      !data.Intent
      // !data.Result
    ) {
      return "⚠️ The server response is invalid. Please try again.";
    }
    var bool = Boolean(data.Result);
    return bool
      ? `Your request has been confirmed! 🎉\n\n` +
          `Here’s your confirmed appointment:\n\n` +
          `👤 Name: ${data.User}\n` +
          `📅 Date: ${formatDate(data.Date)}\n` +
          `⏰ Time: ${data.Time}\n` +
          `📌 Service: ${data.Task}\n` +
          `📝 Request Type: ${data.Intent}`
      : `Sorry, we fail to reserve your reservation. Here is your reservation details:\n\n` +
          `👤 Name: ${data.User}\n` +
          `📅 Date: ${formatDate(data.Date)}\n` +
          `⏰ Time: ${data.Time}\n` +
          `📌 Service: ${data.Task}\n` +
          `📝 Request Type: ${data.Intent}`;
  };

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString + "T00:00:00");
  //   return date.toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString + "T00:00:00");
      if (isNaN(date.getTime())) {
        // If the date is invalid, return the original dateString
        return dateString;
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      // In case of any unexpected errors, return the original dateString
      return dateString;
    }
  };

  const handleBotResponse = useCallback(async (userInput) => {
    setIsBotResponding(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userInput, sender: "user" },
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

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: formatBotResponse(responseData), sender: "bot" },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "⚠️ Server connection failed.", sender: "bot" },
      ]);
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
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
      }
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
      {/* ✅ navibar */}
      <div className="top-left-navbar">
        <img src={chatbotIcon} alt="Chatbot Icon" className="top-left-icon" />
        <span className="top-left-text">Chatbot UI</span>
      </div>

      {/* ✅ chat part */}
      <div className="chat-content-wrapper">
        <div className="chat-content" ref={chatWindowRef}>
          {messages.length === 0 ? (
            <p className="empty-chat">No messages yet. Start a conversation!</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message-container ${msg.sender}`}>
                {/* ✅ user icon  */}
                <img
                  src={msg.sender === "user" ? userIcon : chatbotIcon}
                  alt={`${msg.sender} avatar`}
                  className="chat-avatar"
                />
                <div
                  className={`response-message ${msg.sender}`}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                >
                  <div style={{ whiteSpace: "pre-line" }}> {msg.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ chatbox input */}
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
            placeholder={
              isBotResponding ? "Waiting for response..." : "Type a message..."
            }
            className="response-chat-input"
            disabled={isBotResponding}
          />
          <button
            className="response-chat-send-btn"
            onClick={handleSend}
            disabled={isBotResponding}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotResponse;
