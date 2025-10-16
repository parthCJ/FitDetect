# Goal Completion Rate Mechanism - FitDetect

## 📊 Overview

The **Completion Rate** shows what percentage of your goals you've successfully completed. It's automatically calculated based on your goal statuses in MongoDB.

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USER SETS GOALS                           │
│  Dashboard → Goal Calendar → Select dates & exercises → Save   │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
                    ┌────────────────┐
                    │   MongoDB      │
                    │  goals: [      │
                    │   {            │
                    │     date: "...",│
                    │     target: 50,│
                    │     completed: 0│
                    │     status: "pending"  ←── Initial status
                    │   }            │
                    │  ]             │
                    └────────┬───────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 2. USER DOES EXERCISE                           │
│  Exercise Page → Start Camera → Count reps → Stop Exercise     │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
                    ┌────────────────┐
                    │  Update Goal   │
                    │  PUT /api/goals/{id}
                    │  {             │
                    │   completed_count: 25
                    │  }             │
                    └────────┬───────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              3. BACKEND AUTO-UPDATES STATUS                     │
│                                                                 │
│  IF completed_count >= target_count:                           │
│     status = "completed"      ✅                               │
│  ELSE IF completed_count > 0:                                  │
│     status = "in_progress"    🔄                               │
│  ELSE:                                                          │
│     status = "pending"        ⏳                               │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
                    ┌────────────────┐
                    │   MongoDB      │
                    │  goals: [      │
                    │   {            │
                    │     date: "...",│
                    │     target: 50,│
                    │     completed: 25│
                    │     status: "in_progress"  ←── Updated!
                    │   }            │
                    │  ]             │
                    └────────┬───────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           4. DASHBOARD CALCULATES COMPLETION RATE               │
│  GET /api/goals/stats/summary                                  │
│                                                                 │
│  completion_rate = (completed_goals / total_goals) × 100       │
│                  = (2 / 10) × 100 = 20%                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Goal Status Lifecycle

### **Status Transitions:**

```
pending → in_progress → completed
   ⏳         🔄            ✅
```

### **Status Rules:**

| Status | Condition | Example |
|--------|-----------|---------|
| **pending** | `completed_count == 0` | Target: 50, Completed: 0 |
| **in_progress** | `0 < completed_count < target_count` | Target: 50, Completed: 25 |
| **completed** | `completed_count >= target_count` | Target: 50, Completed: 50+ |

### **Backend Auto-Update Logic:**

```python
# In goals.py - PUT /api/goals/{goal_id}

if "completed_count" in update_data:
    if update_data["completed_count"] >= existing_goal["target_count"]:
        update_data["status"] = "completed"  # ✅ Goal achieved!
    else:
        update_data["status"] = "in_progress"  # 🔄 Still working on it
```

## 📐 Completion Rate Formula

### **Basic Formula:**

```
Completion Rate = (Number of Completed Goals / Total Goals) × 100
```

### **Backend Implementation:**

```python
# In goals.py - GET /api/goals/stats/summary

# Count all goals for user
total_goals = await goals_collection.count_documents({
    "user_id": current_user["id"]
})

# Count only completed goals
completed_goals = await goals_collection.count_documents({
    "user_id": current_user["id"],
    "status": "completed"  # ✅ Only count completed
})

# Calculate percentage
completion_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
```

## 📊 Real-World Examples

### **Example 1: Just Started**
```javascript
Goals in MongoDB:
[
  { date: "2025-10-16", exercise: "pushup", target: 50, completed: 0, status: "pending" },
  { date: "2025-10-17", exercise: "squat", target: 40, completed: 0, status: "pending" },
  { date: "2025-10-18", exercise: "pushup", target: 50, completed: 0, status: "pending" }
]

Calculation:
total_goals = 3
completed_goals = 0  (status == "completed")
completion_rate = (0 / 3) × 100 = 0%
```

### **Example 2: In Progress**
```javascript
User does 30 push-ups on Oct 16:

Goals in MongoDB:
[
  { date: "2025-10-16", exercise: "pushup", target: 50, completed: 30, status: "in_progress" },
  { date: "2025-10-17", exercise: "squat", target: 40, completed: 0, status: "pending" },
  { date: "2025-10-18", exercise: "pushup", target: 50, completed: 0, status: "pending" }
]

Calculation:
total_goals = 3
completed_goals = 0  (still none fully completed)
completion_rate = (0 / 3) × 100 = 0%

❗ Note: In-progress doesn't count as completed!
```

### **Example 3: Some Completed**
```javascript
User completes goals on Oct 16 & 17:

Goals in MongoDB:
[
  { date: "2025-10-16", exercise: "pushup", target: 50, completed: 55, status: "completed" },
  { date: "2025-10-17", exercise: "squat", target: 40, completed: 42, status: "completed" },
  { date: "2025-10-18", exercise: "pushup", target: 50, completed: 20, status: "in_progress" }
]

Calculation:
total_goals = 3
completed_goals = 2  (Oct 16 & 17 are completed ✅)
completion_rate = (2 / 3) × 100 = 66.67%
```

### **Example 4: All Completed**
```javascript
Goals in MongoDB:
[
  { date: "2025-10-16", exercise: "pushup", target: 50, completed: 60, status: "completed" },
  { date: "2025-10-17", exercise: "squat", target: 40, completed: 45, status: "completed" },
  { date: "2025-10-18", exercise: "pushup", target: 50, completed: 50, status: "completed" }
]

Calculation:
total_goals = 3
completed_goals = 3  (all completed ✅)
completion_rate = (3 / 3) × 100 = 100%
```

## 🔧 How Goals Get Updated

### **Step 1: User Completes Exercise**

```typescript
// In exercise/[type]/page.tsx

const stopExercise = async () => {
  // User just did 30 push-ups
  const newCompletedCount = todayGoal.completed_count + repCount
  //                       = 0 + 30 = 30
  
  // Update the goal
  await fetch(`/api/goals/${todayGoal.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      completed_count: 30
    })
  })
}
```

### **Step 2: Backend Updates Goal**

```python
# Backend receives: { completed_count: 30 }
# Existing goal: { target_count: 50, completed_count: 0 }

update_data = { "completed_count": 30 }

# Auto-determine status
if 30 >= 50:  # False
    update_data["status"] = "completed"
else:
    update_data["status"] = "in_progress"  # ✅ This one!

# Update in MongoDB
await goals_collection.update_one(
    {"_id": goal_id},
    {"$set": update_data}
)
```

### **Step 3: User Does More Reps**

```typescript
// User does another 25 push-ups
const newCompletedCount = 30 + 25 = 55

await fetch(`/api/goals/${todayGoal.id}`, {
  method: 'PUT',
  body: JSON.stringify({
    completed_count: 55
  })
})
```

### **Step 4: Backend Marks as Completed**

```python
# Backend receives: { completed_count: 55 }
# Existing goal: { target_count: 50 }

update_data = { "completed_count": 55 }

# Auto-determine status
if 55 >= 50:  # True ✅
    update_data["status"] = "completed"  # Goal achieved!

# Update in MongoDB
await goals_collection.update_one(
    {"_id": goal_id},
    {"$set": update_data}
)
```

### **Step 5: Completion Rate Updates**

```python
# GET /api/goals/stats/summary

# Before: 0 completed out of 3 = 0%
# After: 1 completed out of 3 = 33.33%

return {
    "total_goals": 3,
    "completed_goals": 1,
    "completion_rate": 33.33
}
```

## 🎨 Frontend Display

### **Dashboard Code:**

```typescript
// In dashboard/page.tsx

const [goalStats, setGoalStats] = useState({
  total_goals: 0,
  completed_goals: 0,
  pending_goals: 0,
  in_progress_goals: 0,
  completion_rate: 0
})

// Fetch stats from backend
const fetchGoalStats = async () => {
  const response = await fetch('/api/goals/stats/summary')
  const data = await response.json()
  setGoalStats(data)
}

// Display
<div className="text-2xl font-bold">
  {goalStats.completion_rate}%
</div>
```

### **Visual Breakdown:**

```
┌─────────────────────────────────────┐
│         Monthly Goals               │
│                                     │
│  Completion Rate: 66.67%   [Set Goals]
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Total Goals: 10              │  │
│  │ Completed: 2 ✅              │  │
│  │ Remaining: 8                 │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔄 Real-Time Updates

### **When Completion Rate Changes:**

1. **User completes exercise** → `PUT /api/goals/{id}` → Status updated
2. **User returns to dashboard** → `GET /api/goals/stats/summary` → Fresh calculation
3. **Display updates** → New completion rate shown

### **Automatic Refresh:**

```typescript
// Dashboard refreshes stats when:
useEffect(() => {
  if (session) {
    fetchGoalStats()  // On page load
    fetchGoals()      // On page load
  }
}, [session])

const handleSaveGoals = async (goals) => {
  await saveGoals(goals)
  await fetchGoalStats()  // After saving new goals
  await fetchGoals()      // Refresh goal list
}
```

## 📈 Statistics Breakdown

### **What the Backend Returns:**

```json
{
  "total_goals": 10,
  "completed_goals": 2,
  "pending_goals": 6,
  "in_progress_goals": 2,
  "completion_rate": 20
}
```

### **Meaning:**

- **total_goals**: All goals ever set
- **completed_goals**: Goals where `completed_count >= target_count`
- **pending_goals**: Goals where `completed_count == 0`
- **in_progress_goals**: Goals where `0 < completed_count < target_count`
- **completion_rate**: `(completed / total) × 100`

## 🎯 Key Points

### **✅ What Counts as "Completed":**
- Goal must have `status: "completed"`
- This happens when `completed_count >= target_count`
- Automatically set by backend when updating goal

### **❌ What Doesn't Count:**
- Goals with `status: "pending"` (not started)
- Goals with `status: "in_progress"` (started but not finished)
- Only fully completed goals count toward completion rate

### **🔄 Automatic Status Updates:**
```python
# Backend automatically updates status based on completed_count
# You don't need to manually set the status!

if completed_count >= target_count:
    status = "completed"     # ✅ Counts toward completion rate
elif completed_count > 0:
    status = "in_progress"   # ❌ Doesn't count
else:
    status = "pending"       # ❌ Doesn't count
```

## 🎓 Summary

**Completion Rate Mechanism:**

1. **Goals Created** → All start with `status: "pending"`, `completed_count: 0`

2. **User Exercises** → Frontend sends `PUT /api/goals/{id}` with new `completed_count`

3. **Backend Auto-Updates Status:**
   - `completed_count >= target` → `status: "completed"` ✅
   - `completed_count > 0` → `status: "in_progress"` 🔄
   - `completed_count == 0` → `status: "pending"` ⏳

4. **Completion Rate Calculated:**
   - Count goals where `status == "completed"`
   - Divide by total goals
   - Multiply by 100 for percentage

5. **Dashboard Displays:**
   - Fetches stats from `/api/goals/stats/summary`
   - Shows real-time completion rate
   - Updates when goals are completed

**Formula:**
```
Completion Rate = (Completed Goals / Total Goals) × 100
```

**Example:**
- 10 total goals
- 3 completed
- Completion Rate = (3 / 10) × 100 = 30%
