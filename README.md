# Betting Calculator

**Live at:** https://risk-management-kelly-criterion-sim.vercel.app/

A comprehensive betting analysis tool featuring Quarter Kelly Criterion calculations and Monte Carlo simulations for betting strategy evaluation.

## Pages

### QK Calculator
The Quarter Kelly & Devig Calculator analyzes betting opportunities using various devigging methods to determine fair value and optimal Kelly wager sizes. Features include:

- **Odds Parsing**: Handles both single probabilities (e.g., "60.5") and odds pairs (e.g., "-113/-113")
- **Devig Methods**: Multiplicative, Additive, Power, and Worst Case devigging
- **Kelly Criterion**: Calculates optimal wager sizes with customizable Kelly fractions
- **Market Analysis**: Shows market juice, fair value, and expected value percentages

### Scenario Simulator
The Monte Carlo Simulator runs thousands of betting simulations to analyze strategy performance over time. Features include:

- **Two Simulation Modes**:
  - **Mode A**: Fair probability + payout odds (parlay betting)
  - **Mode B**: Estimated edge % + payout odds (individual betting)
- **Comprehensive Statistics**: Probability of profit, mean/median bankroll, risk of ruin
- **Confidence Intervals**: Shows best/worst case scenarios (1%, 5%, 10%, 90%, 95%, 99%)
- **Realistic Modeling**: Uses fixed Kelly wagers and handles negative EV scenarios
