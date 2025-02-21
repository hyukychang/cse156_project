import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Asynchronous function to fetch a response from the backend (currently mocked for UI improvement)
  const fetchResponse = async (userInput) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Your request has been processed!");
      }, 3000); // Respond after 3 seconds
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Add processing message
    const processingMessage = { sender: "bot", text: "Processing..." };
    setMessages((prev) => [...prev, processingMessage]);

    // Wait for 3 seconds before receiving the actual response
    const botReply = await fetchResponse(userMessage.text);
    
    // Remove processing message and add actual response
    setMessages((prev) => prev.slice(0, -1).concat({ sender: "bot", text: botReply }));
  };

  // Send message on Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  // Auto-scroll chat window to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">AI Chatbot</div>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
