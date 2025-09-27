"use client";
import "./globals.css";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string>("");
  const [inputString, setInputString] = useState<string>("-113/-113, -113/-113");
  
  // Temporary URL - change this to your Render URL when deployed
  const API_URL = "http://localhost:8000";

  const handleClick = async () => {
    try {
      const response = await fetch(`${API_URL}/calculate-bet?input_str=${encodeURIComponent(inputString)}&final_odds=324&bankroll=100&kelly_fraction=0.25`);
      const data = await response.json();
      
      if (data.output) {
        alert(data.output.join('\n'));
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert("No output received");
      }
    } catch (error) {
      alert("Error: Could not connect to API");
    }
  };
  
  return (
    <div>
      <header>
        <h1>Betting Calculator</h1>
      </header>
      
      <div style={{ margin: "20px 0" }}>
        <label htmlFor="odds-input" style={{ display: "block", marginBottom: "10px" }}>
          Enter odds (comma-separated):
        </label>
        <input
          id="odds-input"
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          placeholder="-113/-113, -113/-113"
          style={{
            width: "300px",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px"
          }}
        />
      </div>
      
      <button onClick={handleClick} className="runbutton"> 
        Calculate Bet
      </button>
      
      {result && <p>{result}</p>}
    </div>
  );
}
