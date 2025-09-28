"use client";
import "../globals.css";
import { useState } from "react";

interface Leg {
  id: number;
  fairProbability?: number;
  payoutOdds: number;
  edgePercent?: number;
}

interface SimulationResults {
  probabilityOfProfit: number;
  meanFinalBankroll: number;
  medianFinalBankroll: number;
  riskOfRuin: number;
  confidenceIntervals: {
    bottom1: number;
    bottom5: number;
    bottom10: number;
    top10: number;
    top5: number;
    top1: number;
  };
  simulations: number[];
}

export default function ScenarioSimulator() {
  const [startingBankroll, setStartingBankroll] = useState<string>("1000");
  const [kellyFraction, setKellyFraction] = useState<string>("0.25");
  const [sampleSize, setSampleSize] = useState<string>("100");
  const [mode, setMode] = useState<"A" | "B">("A");
  const [legs, setLegs] = useState<Leg[]>([
    { id: 1, fairProbability: 0.5, payoutOdds: 100 },
    { id: 2, fairProbability: 0.5, payoutOdds: 100 }
  ]);
  // Mode A inputs
  const [fairProbOneLeg, setFairProbOneLeg] = useState<string>("50");
  const [totalPayout, setTotalPayout] = useState<string>("120");
  const [numberOfLegs, setNumberOfLegs] = useState<string>("1");
  // Mode B inputs
  const [estimatedEdge, setEstimatedEdge] = useState<string>("5");
  const [payoutPerBet, setPayoutPerBet] = useState<string>("100");
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const addLeg = () => {
    const newId = Math.max(...legs.map(l => l.id), 0) + 1;
    if (mode === "A") {
      setLegs([...legs, { id: newId, fairProbability: 0.5, payoutOdds: 100 }]);
    } else {
      setLegs([...legs, { id: newId, edgePercent: 0, payoutOdds: 100 }]);
    }
  };

  const removeLeg = (id: number) => {
    if (legs.length > 1) {
      setLegs(legs.filter(leg => leg.id !== id));
    }
  };

  const updateLeg = (id: number, field: keyof Leg, value: number) => {
    setLegs(legs.map(leg => 
      leg.id === id ? { ...leg, [field]: value } : leg
    ));
  };

  const runSimulation = async () => {
    setIsRunning(true);
    try {
      const response = await fetch(`${API_URL}/monte-carlo-simulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          starting_bankroll: parseFloat(startingBankroll),
          kelly_fraction: parseFloat(kellyFraction),
          sample_size: parseFloat(sampleSize),
          legs: legs,
          mode: mode,
          fair_prob_one_leg: parseFloat(fairProbOneLeg),
          total_payout: parseFloat(totalPayout),
          number_of_legs: parseFloat(numberOfLegs),
          estimated_edge: parseFloat(estimatedEdge),
          payout_per_bet: parseFloat(payoutPerBet),
          num_simulations: 10000
        })
      });

      const data = await response.json();
      
      if (data.results) {
        setResults(data.results);
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Error: Could not connect to API");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#1a1a1a", color: "white", minHeight: "100vh" }}>
      <header>
        <h1 style={{ color: "white" }}>Scenario Simulator</h1>
        <p style={{ color: "#ccc", marginTop: "8px" }}>
          Monte Carlo Simulations for Betting Strategies
        </p>
      </header>

      <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
        <div style={{ flex: "1.3", minWidth: "600px" }}>
          <div style={{ marginBottom: "15px", padding: "12px", border: "1px solid #444", borderRadius: "8px", backgroundColor: "#2a2a2a" }}>
            <h2 style={{ marginBottom: "12px", color: "white" }}>Simulation Settings</h2>
            
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
                Starting Bankroll ($):
              </label>
              <input
                type="number"
                value={startingBankroll}
                onChange={(e) => setStartingBankroll(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "white",
                  backgroundColor: "black"
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
                Kelly Fraction:
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={kellyFraction}
                onChange={(e) => setKellyFraction(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "white",
                  backgroundColor: "black"
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
                Sample Size (Number of Bets):
              </label>
              <input
                type="number"
                min="1"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "white",
                  backgroundColor: "black"
                }}
              />
            </div>
          </div>

          {/* Mode Selection */}
          <div style={{ marginBottom: "15px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}>
              <h2 style={{ marginBottom: "12px", color: "white" }}>Mode Selection</h2>
            <div style={{ display: "flex", gap: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "white" }}>
                <input
                  type="radio"
                  name="mode"
                  value="A"
                  checked={mode === "A"}
                  onChange={(e) => setMode("A")}
                  style={{ marginRight: "8px" }}
                />
                <span>Mode A: Fair Probability</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "white" }}>
                <input
                  type="radio"
                  name="mode"
                  value="B"
                  checked={mode === "B"}
                  onChange={(e) => setMode("B")}
                  style={{ marginRight: "8px" }}
                />
                <span>Mode B: Edge % </span>
              </label>
            </div>
          </div>

          {/* Mode A Inputs */}
          {mode === "A" && (
            <div style={{ marginBottom: "15px", padding: "12px", border: "1px solid #444", borderRadius: "8px", backgroundColor: "#2a2a2a" }}>
              
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
                  Fair Prob of One Leg (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={fairProbOneLeg}
                  onChange={(e) => setFairProbOneLeg(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#000",
                    backgroundColor: "#fff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
                  Total Payout:
                </label>
                <input
                  type="number"
                  value={totalPayout}
                  onChange={(e) => setTotalPayout(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#000",
                    backgroundColor: "#fff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
                  Number of Legs:
                </label>
                <input
                  type="number"
                  min="1"
                  value={numberOfLegs}
                  onChange={(e) => setNumberOfLegs(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#000",
                    backgroundColor: "#fff"
                  }}
                />
              </div>
            </div>
          )}

          {/* Mode B Inputs */}
          {mode === "B" && (
            <div style={{ marginBottom: "15px", padding: "12px", border: "1px solid #444", borderRadius: "8px", backgroundColor: "#2a2a2a" }}>              
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
                  Estimated Edge (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={estimatedEdge}
                  onChange={(e) => setEstimatedEdge(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#000",
                    backgroundColor: "#fff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
                  Payout Per Bet:
                </label>
                <input
                  type="number"
                  value={payoutPerBet}
                  onChange={(e) => setPayoutPerBet(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#000",
                    backgroundColor: "#fff"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div style={{ flex: "1", minWidth: "500px" }}>
          <h2 style={{ marginBottom: "20px" }}>Simulation Results</h2>
          
          {results ? (
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
              color: "#000"
            }}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ marginBottom: "15px" }}>Summary Statistics</h3>
                <div style={{ fontFamily: "monospace", fontSize: "14px", lineHeight: "1.6" }}>
                  <div>Probability of Profit: {(results.probabilityOfProfit * 100).toFixed(1)}%</div>
                  <div>Mean Final Bankroll: ${results.meanFinalBankroll.toFixed(2)}</div>
                  <div>Median Final Bankroll: ${results.medianFinalBankroll.toFixed(2)}</div>
                  <div>Risk of Ruin: {(results.riskOfRuin * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ marginBottom: "15px" }}>Confidence Intervals</h3>
                <div style={{ fontFamily: "monospace", fontSize: "14px", lineHeight: "1.6" }}>
                  <div>Bottom 1%: ${results.confidenceIntervals.bottom1.toFixed(2)}</div>
                  <div>Bottom 5%: ${results.confidenceIntervals.bottom5.toFixed(2)}</div>
                  <div>Bottom 10%: ${results.confidenceIntervals.bottom10.toFixed(2)}</div>
                  <div>Top 10%: ${results.confidenceIntervals.top10.toFixed(2)}</div>
                  <div>Top 5%: ${results.confidenceIntervals.top5.toFixed(2)}</div>
                  <div>Top 1%: ${results.confidenceIntervals.top1.toFixed(2)}</div>
                </div>
              </div>


              <div>
                <h3 style={{ marginBottom: "15px" }}>Distribution Graph</h3>
                <div style={{ 
                  height: "200px", 
                  backgroundColor: "#fff", 
                  border: "1px solid #ddd", 
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666"
                }}>
                  Interactive Graph Coming Soon
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <p style={{ color: "#666", fontStyle: "italic", textAlign: "center" }}>
                Configure your betting strategy and run the simulation to see results here
              </p>
            </div>
          )}

          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="runbutton"
            style={{ 
              width: "100%", 
              padding: "12px", 
              fontSize: "16px",
              marginTop: "20px",
              opacity: isRunning ? 0.6 : 1,
              cursor: isRunning ? "not-allowed" : "pointer"
            }}
          >
            {isRunning ? "Running Simulation..." : "Run Monte Carlo Simulation"}
          </button>
        </div>
      </div>
    </div>
  );
}