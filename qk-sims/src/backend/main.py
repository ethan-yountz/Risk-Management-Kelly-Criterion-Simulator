from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://*.vercel.app"    # All Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def implied_prob(odds: float):
    if odds > 0:
        return 100 / (odds + 100)
    else:
        odds = abs(odds)
        return odds / (odds + 100)

def multiplicative_devig(odds1: float, odds2: float):
    """
    Multiplicative devigging method - applies multiplicative margin equally to each outcome
    """
    total_implied_prob = implied_prob(odds1) + implied_prob(odds2)
    return implied_prob(odds1) / total_implied_prob

def additive_devig(odds1: float, odds2: float):
    """
    Additive devigging method - subtracts flat margin equally from each outcome
    """
    q1 = implied_prob(odds1)
    q2 = implied_prob(odds2)
    S = q1 + q2
    overround = S - 1
    
    k = overround / 2
    
    p1 = q1 - k
    p2 = q2 - k
    
    return p1

def power_devig(odds1: float, odds2: float):
    """
    Power devigging method - applies multiplicative margin proportional to probability size
    """
    import math
    
    # Calculate implied probabilities
    q1 = implied_prob(odds1)
    q2 = implied_prob(odds2)
    
    # Total overround
    S = q1 + q2
    overround = S - 1
    
    # For power method, we need to solve for alpha such that:
    # (q1^alpha + q2^alpha) / (q1^alpha + q2^alpha) = 1
    # But we want to remove the overround, so we solve:
    # (q1^alpha + q2^alpha) = 1
    
    # Use Newton-Raphson to solve for alpha
    alpha = 1.0  # Initial guess
    
    for _ in range(20):  # Max iterations
        # Calculate current sum
        q1_alpha = q1 ** alpha
        q2_alpha = q2 ** alpha
        sum_powered = q1_alpha + q2_alpha
        
        # Error: we want sum_powered = 1
        error = sum_powered - 1
        
        if abs(error) < 1e-8:
            break
            
        # Derivative of sum_powered with respect to alpha
        # d/dalpha(q1^alpha + q2^alpha) = q1^alpha * ln(q1) + q2^alpha * ln(q2)
        derivative = q1_alpha * math.log(q1) + q2_alpha * math.log(q2)
        
        if abs(derivative) < 1e-10:  # Avoid division by zero
            break
            
        # Newton-Raphson update
        alpha = alpha - error / derivative
        
        # Ensure alpha stays positive
        alpha = max(alpha, 0.01)
    
    # Apply power transform
    q1_powered = q1 ** alpha
    q2_powered = q2 ** alpha
    
    # Normalize
    total_powered = q1_powered + q2_powered
    p1 = q1_powered / total_powered
    
    # Return the fair probability for odds1
    return p1

def worst_case_devig(odds1: float, odds2: float):
    """
    Worst case devigging - takes the lowest implied probability from all methods
    Returns tuple: (probability, method_name)
    """
    # Calculate all devig methods
    methods = {
        "multiplicative": multiplicative_devig(odds1, odds2),
        "additive": additive_devig(odds1, odds2),
        "power": power_devig(odds1, odds2)
    }
    
    # Find the method with the lowest probability
    min_method = min(methods.items(), key=lambda x: x[1])
    
    # Return tuple: (probability, method_name)
    return min_method[1], min_method[0]

def prob_to_american_odds(prob):
    if prob > 0.5:
        return -int((prob / (1 - prob)) * 100)
    else:
        return int(((1 - prob) / prob) * 100)

def calculate_market_juice(original_prob, fair_prob):
    return (original_prob - fair_prob) / original_prob * 100

def calculate_kelly_wager(fair_prob, payout_odds, bankroll, kelly_fraction):
    """Calculate Kelly wager based on fair probability and payout odds"""
    payout_prob = implied_prob(payout_odds)
    
    # Calculate edge (EV%)
    edge = (fair_prob - payout_prob) / payout_prob * 100
    
    # Kelly formula: f = (bp - q) / b
    # where b = payout odds (as decimal), p = win probability, q = loss probability
    if payout_odds > 0:
        b = payout_odds / 100  
    else:
        b = 100 / abs(payout_odds)  
    
    p = fair_prob
    q = 1 - fair_prob
    
    kelly_percentage = (b * p - q) / b
    
    # Apply Kelly fraction and bankroll
    kelly_wager = bankroll * kelly_fraction * kelly_percentage
    
    return {
        "edge_percent": edge,
        "kelly_percentage": kelly_percentage * 100,
        "kelly_wager": kelly_wager,
        "full_kelly": 100 * kelly_percentage,
        "half_kelly": 100 * kelly_percentage / 2,
        "quarter_kelly": 100 * kelly_percentage / 4,
        "is_profitable": kelly_percentage > 0
    }

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

def generate_leg_output(leg, leg_number):
    """Generate output for a single leg with internal fair value calculation"""
    if leg is None:
        raise ValueError(f"Invalid leg data for leg {leg_number}")
    
    if leg["type"] == "odds":
        # Calculate fair value using multiplicative devig
        fair_value = multiplicative_devig(leg["odds1"], leg["odds2"])
        
        # Calculate market juice
        original_prob = implied_prob(leg["odds1"])
        market_juice = calculate_market_juice(original_prob, fair_value)
        
        # Convert fair value to American odds
        fair_odds = prob_to_american_odds(fair_value)
        fair_percent = fair_value * 100
        
        return f"Leg#{leg_number} ({leg['odds1']}); Market Juice = {market_juice:.1f}%; Fair Value = {fair_odds:+} ({fair_percent:.1f}%)"
    
    else:  # probability type
        # For probability input, fair value is just the input value
        fair_value = leg["value"] / 100
        fair_odds = prob_to_american_odds(fair_value)
        fair_percent = fair_value * 100
        
        return f"Leg#{leg_number} ({leg['value']}%); Fair Value = {fair_odds:+} ({fair_percent:.1f}%)"

def generate_complete_output(parsed_legs, final_odds, bankroll, kelly_fraction, devig_method="worst_case"):
    output = []
    actual_method_used = devig_method  # Track which method was actually used
    
    for i, leg in enumerate(parsed_legs):
        leg_output = generate_leg_output(leg, i + 1)
        output.append(leg_output)
    
    total_fv = 1
    for i, leg in enumerate(parsed_legs):
        if leg["type"] == "odds":
            # Use the selected devig method
            if devig_method == "multiplicative":
                fair_value = multiplicative_devig(leg["odds1"], leg["odds2"])
            elif devig_method == "additive":
                fair_value = additive_devig(leg["odds1"], leg["odds2"])
            elif devig_method == "power":
                fair_value = power_devig(leg["odds1"], leg["odds2"])
            elif devig_method == "worst_case":
                fair_value, actual_method_used = worst_case_devig(leg["odds1"], leg["odds2"])
            else:  # default fallback
                fair_value = multiplicative_devig(leg["odds1"], leg["odds2"])
        else:
            fair_value = leg["value"] / 100
        total_fv *= fair_value

    # Calculate Kelly wager using the helper function
    kelly_data = calculate_kelly_wager(total_fv, final_odds, bankroll, kelly_fraction)
    
    # Add devig method to output header - show actual method used for worst_case
    if devig_method == "worst_case":
        method_display = {
            "multiplicative": "Worst-case (Multiplicative)",
            "additive": "Worst-case (Additive)", 
            "power": "Worst-case (Power)"
        }.get(actual_method_used, "Worst-case")
    else:
        method_display = {
            "multiplicative": "Multiplicative",
            "additive": "Additive",
            "power": "Power"
        }.get(devig_method, "Worst-case")
    
    output.insert(0, f"{method_display}")
    output.append(f"Final Odds: {final_odds}; Fair Value = {prob_to_american_odds(total_fv)} ({total_fv * 100:.1f}%)")
    
    # Only show Kelly wager if it's profitable (positive)
    if kelly_data['is_profitable']:
        output.append(f"Summary: EV% = {kelly_data['edge_percent']:.1f}%, Kelly Wager = ${kelly_data['kelly_wager']:.2f} (Full={kelly_data['full_kelly']:.2f}u, 1/2={kelly_data['half_kelly']:.2f}u, 1/4={kelly_data['quarter_kelly']:.2f}u)")
    else:
        output.append(f"Summary: EV% = {kelly_data['edge_percent']:.1f}% - No profitable Kelly wager (negative edge)")
    
    return output


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

@app.get("/calculate-bet")
def calculate_bet(input_str: str, final_odds: int, bankroll: float, kelly_fraction: float, devig_method: str = "worst_case"):
    """Calculate the complete betting analysis"""
    try:
        parsed_legs = input_to_odds(input_str)
        output = generate_complete_output(parsed_legs, final_odds, bankroll, kelly_fraction, devig_method)
        return {"output": output, "parsed_legs": parsed_legs}
    except Exception as e:
        return {"error": str(e), "input": input_str}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
