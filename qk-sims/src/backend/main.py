from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_odds_string(odds_str: str):
    if "/" in odds_str:
        # Split by "/" and convert to floats (two separate odds)
        parts = odds_str.split("/")
        if len(parts) == 2:
            try:
                odds1 = float(parts[0].strip())
                odds2 = float(parts[1].strip())
                return {"type": "odds", "odds1": odds1, "odds2": odds2}
            except ValueError:
                return None
        else:
            return None
    else:
        # Single number treated as probability (percentage)
        try:
            num = float(odds_str.strip())
            return {"type": "probability", "value": num}
        except ValueError:
            return None

def implied_prob(odds: float):
    if odds > 0:
        return 100 / (odds + 100)
    else:
        odds = abs(odds)
        return odds / (odds + 100)

def multiplicative_devig(odds1: float, odds2: float):
    total_implied_prob = implied_prob(odds1) + implied_prob(odds2)
    return implied_prob(odds1) / total_implied_prob

@app.get("/")
def read_root():
    return {"message": "Hello, world!"}

@app.get("/square/{x}")
def square(x: int):
    return {"input": x, "output": x * x}

@app.get("/parse-odds/{odds_str}")
def parse_odds(odds_str: str):
    result = parse_odds_string(odds_str)
    if result is None:
        return {"error": "Invalid odds format", "input": odds_str}
    
    result["input"] = odds_str
    return result


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
