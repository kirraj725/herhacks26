"""
Payment Plan Optimization Engine

Recommends installment plans based on risk category.
  Low  → 2 installments
  Medium → 3–6 months
  High → 6–12 months with lower initial installment
"""


def recommend_plan(risk_score: float, risk_category: str, balance: float) -> dict:
    """Generate an optimized payment plan recommendation."""
    if balance <= 0:
        return {
            "plan_length_months": 0,
            "monthly_payment": 0,
            "first_payment": 0,
            "expected_collection_probability": 100.0,
            "projected_revenue": 0,
        }

    if risk_category == "Low":
        months = 2
        first_pct = 0.50
        collection_prob = 95.0
    elif risk_category == "Medium":
        months = max(3, min(int(risk_score / 10), 6))
        first_pct = 0.30
        collection_prob = 75.0
    else:  # High
        months = max(6, min(int(risk_score / 8), 12))
        first_pct = 0.15
        collection_prob = 50.0

    first_payment = round(balance * first_pct, 2)
    remaining = balance - first_payment
    monthly_payment = round(remaining / max(months - 1, 1), 2)
    projected_revenue = round(balance * (collection_prob / 100), 2)

    return {
        "plan_length_months": months,
        "monthly_payment": monthly_payment,
        "first_payment": first_payment,
        "expected_collection_probability": collection_prob,
        "projected_revenue": projected_revenue,
    }


def recommend_plans_for_all(risk_scores: list[dict]) -> list[dict]:
    """Generate payment plan recommendations for all scored accounts."""
    results = []
    for acct in risk_scores:
        plan = recommend_plan(
            acct["risk_score"], acct["risk_category"], acct.get("patient_balance", 0)
        )
        results.append({
            "account_id": acct["account_id"],
            "risk_score": acct["risk_score"],
            "risk_category": acct["risk_category"],
            "patient_balance": acct.get("patient_balance", 0),
            **plan,
        })
    return results
