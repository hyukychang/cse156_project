import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./Homepage";
import Chatbot from "./Chatbot";
import ChatbotResponse from "./ChatbotResponse";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/response" element={<ChatbotResponse />} />
      </Routes>
    </Router>
  );
};

export default App;
