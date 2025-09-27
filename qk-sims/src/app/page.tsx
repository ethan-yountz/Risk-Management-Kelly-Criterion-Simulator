"use client";
import "./globals.css";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string>("");
  
  // Temporary URL - change this to your Render URL when deployed
  const API_URL = "http://localhost:8000";

  const handleClick = async () => {
    try {
      const response = await fetch(`${API_URL}/square/5`);
      const data = await response.json();
      setResult(`API Response: ${data.input} squared = ${data.output}`);
    } catch (error) {
      setResult("Error: Could not connect to API");
    }
  };
  
  return (
    <div>
      <header>
        <h1>Hello World</h1>
      </header>
      <button onClick={handleClick} className="runbutton"> 
        Click me 
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}
