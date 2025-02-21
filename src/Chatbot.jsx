import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [input, setInput] = useState(""); // Stores user input
  const [inputStorage, setInputStorage] = useState(""); // Saves the last user input

  const chatEndRef = useRef(null);

  const saveInput = async () => {
    if (!input.trim()) return; // Ignore empty input

    // Save user input
    setInputStorage(input);
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput(""); // Clear input field

    // Display processing message
    setMessages((prev) => [...prev, { sender: "bot", text: "Processing..." }]);

    // Simulate backend response after 3 seconds
    setTimeout(() => {
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove "Processing..." message
        { sender: "bot", text: "Your request has been processed!" },
      ]);
    }, 3000);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      saveInput();
    }
  };

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
        <button onClick={saveInput}>Send</button>
      </div>

      <div className="saved-input">
        <strong>Saved Input(temporalUI):</strong> {inputStorage}
      </div>
    </div>
  );
};

export default Chatbot;
