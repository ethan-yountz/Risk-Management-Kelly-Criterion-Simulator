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

def seperate_odd_list(input_str: str):
    parts = [part.strip() for part in input_str.split(",")]
    return parts

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

def input_to_odds(input_str: str):
    parts = seperate_odd_list(input_str)
    parsed_legs = []
    for part in parts:
        odds = parse_odds_string(part)
        parsed_legs.append(odds)
    return parsed_legs

def implied_prob(odds: float):
    if odds > 0:
        return 100 / (odds + 100)
    else:
        odds = abs(odds)
        return odds / (odds + 100)

def convert_to_implied_prob(odds_list: dict):
    implied_probs = []
    for odds in odds_list:
        if odds["type"] == "probability":
            implied_probs.append(odds["value"] / 100)
        elif odds["type"] == "odds":
            prob1 = implied_prob(odds["odds1"])
            prob2 = implied_prob(odds["odds2"])
            implied_probs.extend([prob1, prob2])
    return implied_probs
    
def multiplicative_devig(odds1: float, odds2: float):
    total_implied_prob = implied_prob(odds1) + implied_prob(odds2)
    return implied_prob(odds1) / total_implied_prob

def convert_to_fv(implied_probs: list):
    fv = []
    for legs in implied_probs:
        if legs["type"] == "odds":
            fv.append(multiplicative_devig(legs["odds1"], legs["odds2"]))
        elif legs["type"] == "probability":
            fv.append(legs["value"])
    return fv




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
