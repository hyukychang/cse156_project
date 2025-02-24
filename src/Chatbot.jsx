import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import chatbotIcon from "./image/homeicon.png";
import "./Chatbot.css";

const Chatbot = () => {
  const [input, setInput] = useState(""); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [name, setName] = useState("");
  const [showOptions, setShowOptions] = useState(false); 
  const navigate = useNavigate();

  const handleSend = () => {
    if (!input.trim()) return; 
    navigate("/response", { state: { userMessage: input } });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleSuggestionClick = (appointmentType) => {
    setSelectedAppointment(appointmentType);
    updateInput(appointmentType, selectedDate, selectedHour, selectedMinute, name);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    updateInput(selectedAppointment, date, selectedHour, selectedMinute, name);
  };

  const handleHourChange = (event) => {
    const hourValue = event.target.value;
    setSelectedHour(hourValue);
    updateInput(selectedAppointment, selectedDate, hourValue, selectedMinute, name);
  };

  const handleMinuteChange = (event) => {
    const minuteValue = event.target.value;
    setSelectedMinute(minuteValue);
    updateInput(selectedAppointment, selectedDate, selectedHour, minuteValue, name);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
    updateInput(selectedAppointment, selectedDate, selectedHour, selectedMinute, event.target.value);
  };

  const updateInput = (appointment, date, hour, minute, userName) => {
    if (appointment && date && hour && minute && userName) {
      const formattedDate = date.toISOString().split("T")[0]; 
      const formattedTime = `${hour.split(/AM|PM/)[0]}:${minute} ${hour.includes("AM") ? "AM" : "PM"}`;
      setInput(`My name is ${userName}. I'd like to ${appointment.toLowerCase()} at ${formattedTime} on ${formattedDate}.`);
    }
  };

  return (
    <div className="chat-container">
      {/* Navigation */}
      <div className="top-left-navbar">
        <img src={chatbotIcon} alt="Chatbot Icon" className="top-left-icon" />
        <span className="top-left-text">Chatbot UI</span>
      </div>

      {/* Chatbot Title */}
      <div className="chat-intro">
        <img src={chatbotIcon} alt="Chatbot Main Icon" className="chat-main-icon" />
        <h1 className="chat-title">How can I help you?</h1>

        {/* Autogenerate Button */}
        {!showOptions && (
          <button className="autogenerate-btn" onClick={() => setShowOptions(true)}>
            Autogenerate
          </button>
        )}

        {/* Options (Animated) */}
        {showOptions && (
          <div className="options-container fade-in">
            <input 
              type="text" 
              placeholder="Enter your name" 
              className="name-input"
              value={name}
              onChange={handleNameChange}
            />

            <div className="date-time-picker">
              <DatePicker 
                selected={selectedDate} 
                onChange={handleDateChange} 
                dateFormat="yyyy-MM-dd" 
                placeholderText="Select a date"
                className="date-picker"
                popperPlacement="bottom-start"
              />
              
              <select className="time-picker" value={selectedHour} onChange={handleHourChange}>
                <option value="">Select hour</option>
                {[...Array(12).keys()].map((h) => (
                  <>
                    <option key={`${h+1}AM`} value={`${h+1}AM`}>{h+1} AM</option>
                    <option key={`${h+1}PM`} value={`${h+1}PM`}>{h+1} PM</option>
                  </>
                ))}
              </select>

              <select className="minute-picker" value={selectedMinute} onChange={handleMinuteChange}>
                <option value="">Select minute</option>
                {[...Array(60).keys()].map((m) => (
                  <option key={m} value={m < 10 ? `0${m}` : m}>
                    {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="chat-suggestions">
              <button className="chat-suggestion" onClick={() => handleSuggestionClick("book an appointment")}>
                Book an appointment
              </button>
              <button className="chat-suggestion" onClick={() => handleSuggestionClick("cancel an appointment")}>
                Cancel an appointment
              </button>
              <button className="chat-suggestion" onClick={() => handleSuggestionClick("reschedule an appointment")}>
                Reschedule an appointment
              </button>
              <button className="chat-suggestion" onClick={() => handleSuggestionClick("check my availability")}>
                Check my availability
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); 
            handleSend();
          }
        }}
        placeholder="Type a message..."
        className="chat-input"
      />
      <button className="chat-send-btn" onClick={handleSend}>➤</button>
    </div>
    </div>
  );
};

export default Chatbot;
