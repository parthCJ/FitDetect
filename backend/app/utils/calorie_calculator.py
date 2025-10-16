"""
Calorie Calculation Module
Provides accurate calorie estimates based on exercise type, reps, duration, and user weight
"""

from typing import Literal

# MET (Metabolic Equivalent of Task) values for exercises
# Source: Compendium of Physical Activities (Ainsworth et al.)
MET_VALUES = {
    "pushup": {
        "vigorous": 8.0,    # > 20 reps/min
        "moderate": 3.8,    # 10-20 reps/min
        "light": 3.5        # < 10 reps/min
    },
    "squat": {
        "vigorous": 8.0,    # > 25 reps/min
        "moderate": 5.0,    # 15-25 reps/min
        "light": 3.5        # < 15 reps/min
    }
}

# Average body weight if user doesn't provide (in kg)
DEFAULT_BODY_WEIGHT = 70  # 70 kg ≈ 154 lbs

def calculate_intensity(
    reps: int,
    duration_seconds: float,
    exercise_type: Literal["pushup", "squat"]
) -> Literal["vigorous", "moderate", "light"]:
    """
    Determine exercise intensity based on reps per minute
    
    Args:
        reps: Total number of repetitions
        duration_seconds: Total duration in seconds
        exercise_type: Type of exercise ("pushup" or "squat")
    
    Returns:
        Intensity level: "vigorous", "moderate", or "light"
    """
    if duration_seconds == 0:
        return "moderate"
    
    reps_per_minute = (reps / duration_seconds) * 60
    
    if exercise_type == "pushup":
        if reps_per_minute > 20:
            return "vigorous"
        elif reps_per_minute >= 10:
            return "moderate"
        else:
            return "light"
    
    elif exercise_type == "squat":
        if reps_per_minute > 25:
            return "vigorous"
        elif reps_per_minute >= 15:
            return "moderate"
        else:
            return "light"
    
    return "moderate"


def calculate_calories(
    reps: int,
    duration_seconds: float,
    exercise_type: Literal["pushup", "squat"],
    body_weight_kg: float = DEFAULT_BODY_WEIGHT
) -> float:
    """
    Calculate calories burned during exercise
    
    Formula: Calories = MET × body_weight_kg × duration_hours
    
    Args:
        reps: Total number of repetitions completed
        duration_seconds: Total exercise duration in seconds
        exercise_type: Type of exercise ("pushup" or "squat")
        body_weight_kg: User's body weight in kilograms (default: 70kg)
    
    Returns:
        Estimated calories burned (float)
    
    Example:
        >>> calculate_calories(reps=30, duration_seconds=120, exercise_type="pushup", body_weight_kg=75)
        7.6  # 30 push-ups in 2 minutes at 75kg burns ~7.6 calories
    """
    if duration_seconds == 0 or reps == 0:
        return 0.0
    
    # Determine intensity level
    intensity = calculate_intensity(reps, duration_seconds, exercise_type)
    
    # Get MET value for exercise and intensity
    met_value = MET_VALUES.get(exercise_type, {}).get(intensity, 3.5)
    
    # Convert duration to hours
    duration_hours = duration_seconds / 3600
    
    # Calculate calories using MET formula
    calories = met_value * body_weight_kg * duration_hours
    
    return round(calories, 2)


def calculate_calories_simple(
    reps: int,
    exercise_type: Literal["pushup", "squat"]
) -> float:
    """
    Simplified calorie calculation based on reps only
    Useful when duration is not available
    
    Based on average calorie expenditure per rep:
    - Push-ups: ~0.29 calories per rep (for 70kg person)
    - Squats: ~0.32 calories per rep (for 70kg person)
    
    Args:
        reps: Total number of repetitions
        exercise_type: Type of exercise
    
    Returns:
        Estimated calories burned
    """
    calories_per_rep = {
        "pushup": 0.29,
        "squat": 0.32
    }
    
    cal_per_rep = calories_per_rep.get(exercise_type, 0.3)
    return round(reps * cal_per_rep, 2)


# Example usage and testing
if __name__ == "__main__":
    print("=== Calorie Calculator Examples ===\n")
    
    # Example 1: 30 push-ups in 2 minutes (70kg person)
    cals1 = calculate_calories(30, 120, "pushup", 70)
    print(f"30 push-ups in 2 min (70kg): {cals1} calories")
    
    # Example 2: 50 squats in 3 minutes (75kg person)
    cals2 = calculate_calories(50, 180, "squat", 75)
    print(f"50 squats in 3 min (75kg): {cals2} calories")
    
    # Example 3: High intensity - 40 push-ups in 1 minute
    cals3 = calculate_calories(40, 60, "pushup", 70)
    print(f"40 push-ups in 1 min (vigorous, 70kg): {cals3} calories")
    
    # Example 4: Low intensity - 15 squats in 2 minutes
    cals4 = calculate_calories(15, 120, "squat", 70)
    print(f"15 squats in 2 min (light, 70kg): {cals4} calories")
    
    print("\n=== Simple Calculation (reps only) ===\n")
    print(f"20 push-ups: {calculate_calories_simple(20, 'pushup')} calories")
    print(f"30 squats: {calculate_calories_simple(30, 'squat')} calories")
