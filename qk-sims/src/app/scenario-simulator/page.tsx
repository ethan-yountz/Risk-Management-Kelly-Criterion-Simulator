"use client";
import "../globals.css";

export default function ScenarioSimulator() {
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <header>
        <h1>Scenario Simulator</h1>
        <p style={{ color: "#666", marginTop: "8px" }}>
          Monte Carlo simulation for betting scenarios
        </p>
      </header>
      
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "20px", 
        borderRadius: "8px", 
        marginTop: "20px",
        border: "1px solid #e9ecef"
      }}>
        <h2>Coming Soon</h2>
        <p style={{ color: "#666", marginTop: "8px" }}>
          This page will contain Monte Carlo simulation tools for analyzing betting scenarios.
        </p>
        
        <div style={{ marginTop: "20px" }}>
          <h3>Planned Features:</h3>
          <ul style={{ color: "#666", paddingLeft: "20px" }}>
            <li>Starting bankroll and Kelly fraction inputs</li>
            <li>10,000 Monte Carlo simulations</li>
            <li>Legs table with fair probability + payout odds</li>
            <li>Edge % + payout odds analysis</li>
            <li>Probability of profit calculations</li>
            <li>Mean/median final bankrolls</li>
            <li>Risk of ruin analysis</li>
            <li>Confidence intervals for bankroll results</li>
            <li>Interactive graphs showing simulation results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
