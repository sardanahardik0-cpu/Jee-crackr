import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import MockTest from "./MockTest";
import Pyq from "./Pyq";

// Home page component
function Home() {
  return (
    <div className="App">
      <h1>JEE Crackr</h1>
      <p>Boost your JEE prep with Mock Tests & Previous Year Questions</p>
      <div className="buttons">
        <Link to="/mocktest" className="btn">📚 Mock Test</Link>
        <Link to="/pyq" className="btn">📜 PYQ</Link>
      </div>
    </div>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mocktest" element={<MockTest />} />
        <Route path="/pyq" element={<Pyq />} />
      </Routes>
    </Router>
  );
}

export default App;
