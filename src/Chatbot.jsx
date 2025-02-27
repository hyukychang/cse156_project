import { useState, useRef } from "react";
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
  const [service, setService] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null); 

  const handleSend = () => {
    if (!input.trim()) return;
    navigate("/response", { state: { userMessage: input } });
  };

  const handleSuggestionClick = (appointmentType) => {
    setSelectedAppointment(appointmentType);
    updateInput(appointmentType, selectedDate, selectedHour, selectedMinute, name, service);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    updateInput(selectedAppointment, date, selectedHour, selectedMinute, name, service);
  };

  const handleHourChange = (event) => {
    setSelectedHour(event.target.value);
    updateInput(selectedAppointment, selectedDate, event.target.value, selectedMinute, name, service);
  };

  const handleMinuteChange = (event) => {
    setSelectedMinute(event.target.value);
    updateInput(selectedAppointment, selectedDate, selectedHour, event.target.value, name, service);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
    updateInput(selectedAppointment, selectedDate, selectedHour, selectedMinute, event.target.value, service);
  };

  const handleServiceChange = (event) => {
    setService(event.target.value);
    updateInput(selectedAppointment, selectedDate, selectedHour, selectedMinute, name, event.target.value);
  };

 
  const updateInput = (appointment, date, hour, minute, userName, userService) => {
    if (appointment && date && hour && minute && userName) {
      const formattedDate = date.toISOString().split("T")[0];
      const formattedTime = `${hour.split(/AM|PM/)[0]}:${minute} ${hour.includes("AM") ? "AM" : "PM"}`;

      let message;
      if (appointment === "check availability") {
        message = `My name is ${userName}, and I'd like to check my availability at ${formattedTime} on ${formattedDate}.`;
      } else {
        message = `My name is ${userName}, and I'd like to ${appointment.toLowerCase()} a ${userService} appointment at ${formattedTime} on ${formattedDate}.`;
      }

      setInput(message);
      setTimeout(() => inputRef.current?.focus(), 0); 
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

            {/* ✅ Enter your service button */}
            <input
              type="text"
              placeholder="Enter your service"
              className="name-input"
              value={service}
              onChange={handleServiceChange}
              disabled={selectedAppointment === "check availability"}
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
                    <option key={`${h + 1}AM`} value={`${h + 1}AM`}>{h + 1} AM</option>
                    <option key={`${h + 1}PM`} value={`${h + 1}PM`}>{h + 1} PM</option>
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
              <button className="chat-suggestion" onClick={() => handleSuggestionClick("book")}>
                Book an appointment
              </button>
              <button className="chat-suggestion" onClick={() => handleSuggestionClick("cancel")}>
                Cancel an appointment
              </button>
              <button className="chat-suggestion" onClick={() => handleSuggestionClick("reschedule")}>
                Reschedule an appointment
              </button>
              <button className="chat-suggestion" onClick={() => handleSuggestionClick("check availability")}>
                Check my availability
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        <textarea
          ref={inputRef} 
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
