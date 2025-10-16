# Calorie Calculation System - FitDetect

## 📊 Overview

FitDetect uses a **science-based calorie calculation** system based on MET (Metabolic Equivalent of Task) values from the **Compendium of Physical Activities** (Ainsworth et al.).

## 🔬 The Science

### **MET (Metabolic Equivalent of Task)**

MET is a standard unit that estimates the energy cost of physical activities. One MET is the rate of energy expenditure while sitting at rest.

**Formula:**
```
Calories Burned = MET × Body Weight (kg) × Duration (hours)
```

### **MET Values by Exercise & Intensity**

#### **Push-ups**
| Intensity | Reps/Min | MET Value | Description |
|-----------|----------|-----------|-------------|
| **Vigorous** | > 20 | 8.0 | Fast pace, high effort |
| **Moderate** | 10-20 | 3.8 | Steady pace, controlled |
| **Light** | < 10 | 3.5 | Slow pace, beginner |

#### **Squats**
| Intensity | Reps/Min | MET Value | Description |
|-----------|----------|-----------|-------------|
| **Vigorous** | > 25 | 8.0 | Fast pace, deep squats |
| **Moderate** | 15-25 | 5.0 | Steady pace, controlled |
| **Light** | < 15 | 3.5 | Slow pace, partial range |

## 💡 How It Works

### **1. Exercise Session Started**
User clicks "Start Camera" → Session created in MongoDB with `reps: 0`

### **2. During Exercise**
- Reps are counted in real-time
- Duration is tracked (seconds)
- Frontend shows **estimated** calories: `reps × 0.29` (push-ups) or `reps × 0.32` (squats)

### **3. Exercise Completed**
User clicks "Stop Exercise" → Backend calculates **accurate** calories:

```python
# Step 1: Calculate intensity
reps_per_minute = (total_reps / duration_seconds) * 60

if exercise == "pushup":
    if reps_per_minute > 20:
        intensity = "vigorous"  # MET = 8.0
    elif reps_per_minute >= 10:
        intensity = "moderate"  # MET = 3.8
    else:
        intensity = "light"     # MET = 3.5

# Step 2: Calculate calories
duration_hours = duration_seconds / 3600
calories = MET × body_weight_kg × duration_hours
```

### **4. Session Saved**
Session updated in MongoDB with:
- Final rep count
- Total duration
- **Calculated calories** (based on MET formula)
- Completion status

## 📈 Examples

### **Example 1: Moderate Intensity Push-ups**
```python
User: 70 kg person
Exercise: 30 push-ups in 2 minutes (120 seconds)
Reps/min: (30 / 120) × 60 = 15 reps/min → MODERATE
MET: 3.8
Duration: 120s = 0.0333 hours

Calories = 3.8 × 70 × 0.0333 = 8.85 calories
```

### **Example 2: Vigorous Squats**
```python
User: 75 kg person
Exercise: 50 squats in 90 seconds
Reps/min: (50 / 90) × 60 = 33.3 reps/min → VIGOROUS
MET: 8.0
Duration: 90s = 0.025 hours

Calories = 8.0 × 75 × 0.025 = 15.0 calories
```

### **Example 3: Light Push-ups**
```python
User: 65 kg person
Exercise: 15 push-ups in 3 minutes (180 seconds)
Reps/min: (15 / 180) × 60 = 5 reps/min → LIGHT
MET: 3.5
Duration: 180s = 0.05 hours

Calories = 3.5 × 65 × 0.05 = 11.38 calories
```

## 🎯 Parameters Used

### **Required Parameters:**
1. **Reps** (int): Total number of repetitions completed
2. **Duration** (float): Total time in seconds
3. **Exercise Type** (str): "pushup" or "squat"

### **Optional Parameters:**
4. **Body Weight** (float): User's weight in kg
   - Default: 70 kg (154 lbs)
   - Can be customized per user
   - More accurate with real user weight

### **Calculated Parameters:**
5. **Intensity** (str): Automatically determined from reps/minute
   - "vigorous", "moderate", or "light"
6. **MET Value** (float): Selected based on exercise type and intensity

## 🔧 Implementation

### **Backend: `/api/sessions/{id}` (PUT)**

```python
from app.utils.calorie_calculator import calculate_calories

# When updating session with reps and duration
update_data = {
    "reps": 30,
    "duration": 120,
    "completed": True
}

# Auto-calculate calories
calories = calculate_calories(
    reps=30,
    duration_seconds=120,
    exercise_type="pushup",
    body_weight_kg=70  # From user profile
)

update_data["calories_burned"] = calories  # 8.85
```

### **Frontend: Exercise Page**

```typescript
// During exercise: Show estimate
const estimatedCalories = repCount * 0.29  // Simple estimate

// After stopping: Get accurate value from backend
const response = await fetch(`/api/sessions/${sessionId}`, {
  method: 'PUT',
  body: JSON.stringify({
    reps: repCount,
    duration: duration,
    completed: true
  })
})

const session = await response.json()
setCalories(session.calories_burned)  // Accurate MET-based value
```

## 📊 Comparison: Old vs New

| Aspect | **Old System** | **New System** |
|--------|---------------|---------------|
| **Formula** | `reps × 0.5` | MET-based formula |
| **Accuracy** | ❌ Very inaccurate | ✅ Science-backed |
| **Considers Duration** | ❌ No | ✅ Yes |
| **Considers Intensity** | ❌ No | ✅ Yes (vigorous/moderate/light) |
| **Considers Body Weight** | ❌ No | ✅ Yes (default 70kg) |
| **Same for All Exercises** | ❌ Yes | ✅ No (different MET values) |
| **Saved to Database** | ❌ No | ✅ Yes |
| **Example (30 push-ups, 2 min)** | 15 cal | 8.85 cal |

## 🎓 Scientific Sources

1. **Compendium of Physical Activities**
   - Ainsworth et al. (2011)
   - Updated MET values for physical activities
   - https://sites.google.com/site/compendiumofphysicalactivities/

2. **MET Definition**
   - 1 MET = 1 kcal/kg/hour
   - 1 MET = 3.5 ml O₂/kg/min

3. **Exercise-Specific Research**
   - Push-ups: Moderate intensity = 3.8 MET, Vigorous = 8.0 MET
   - Squats: Moderate intensity = 5.0 MET, Vigorous = 8.0 MET

## 🔮 Future Enhancements

### **Phase 1: User Profiles** (Recommended Next)
```python
# Add to User model
class User(BaseModel):
    body_weight_kg: Optional[float] = 70
    age: Optional[int] = None
    height_cm: Optional[int] = None
```

Then use actual user weight:
```python
user = await get_current_user()
calories = calculate_calories(
    reps=reps,
    duration=duration,
    exercise_type=exercise_type,
    body_weight_kg=user.get("body_weight_kg", 70)
)
```

### **Phase 2: Advanced Factors**
- **Age Factor**: Metabolism slows with age
- **Gender Factor**: Different BMR (Basal Metabolic Rate)
- **Fitness Level**: Trained individuals burn fewer calories for same work
- **Heart Rate**: More accurate than MET alone

### **Phase 3: Real-time Calculation**
```python
# Calculate calories per rep in real-time
def calculate_per_rep_calories(
    exercise_type: str,
    avg_time_per_rep: float,
    body_weight_kg: float
) -> float:
    """Calculate calories for each individual rep"""
    pass
```

## 🧪 Testing

### **Run Calculator Tests**
```bash
cd backend
python app/utils/calorie_calculator.py
```

### **Expected Output**
```
=== Calorie Calculator Examples ===

30 push-ups in 2 min (70kg): 8.85 calories
50 squats in 3 min (75kg): 18.75 calories
40 push-ups in 1 min (vigorous, 70kg): 9.33 calories
15 squats in 2 min (light, 70kg): 8.17 calories

=== Simple Calculation (reps only) ===

20 push-ups: 5.8 calories
30 squats: 9.6 calories
```

## 📱 User Experience

### **Before Exercise:**
- "Start Camera" → Session created

### **During Exercise:**
- Real-time rep counting
- **Estimated calories** shown (simple formula)
- Duration timer running

### **After Exercise:**
- "Stop Exercise" clicked
- Backend calculates **accurate calories** using MET formula
- Display updates with real value
- Session saved with accurate data

### **In Dashboard:**
- View exercise history with accurate calorie counts
- Total calories burned across all sessions
- Progress tracking over time

## 🎯 Summary

**Current Implementation:**
- ✅ MET-based calorie calculation
- ✅ Intensity-aware (vigorous/moderate/light)
- ✅ Exercise-specific MET values
- ✅ Duration-based calculation
- ✅ Default body weight (70kg)
- ✅ Automatically calculated on session completion
- ✅ Saved to MongoDB

**Parameters Used:**
1. **Reps** - Number of repetitions
2. **Duration** - Time in seconds
3. **Exercise Type** - Push-up or squat
4. **Body Weight** - Default 70kg (can be customized)
5. **Intensity** - Auto-calculated from reps/minute

**Formula:**
```
Calories = MET × Body Weight (kg) × Duration (hours)
```

This provides **scientifically accurate** calorie estimates that are far more reliable than the simple `reps × 0.5` approach!
