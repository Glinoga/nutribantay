# AI Recommender System - Documentation

## Date: April 13, 2026

## Purpose: AI Recommender Fixes & Enhancements

---

## Completed Tasks

### 1. Age Calculation Fix

**Problem:** Child age was calculated incorrectly using separate years and months, causing the wrong `NEEDS_DEWORMING` flag.

**File:** `app/Http/Controllers/RecommendationController.php`

**Fix:** Changed from:

```php
$years = $birthdate->diffInYears($now);
$months = $birthdate->copy()->addYears($years)->diffInMonths($now);
```

To:

```php
$totalMonths = (int) $birthdate->diffInMonths($now);
$years = floor($totalMonths / 12);
$months = $totalMonths % 12;
```

---

### 2. Deworming Logic Fix

**Problem:** AI was ignoring the deworming field from the database and calculating age incorrectly, resulting in wrong deworming recommendations.

**Solution:** Added explicit `NEEDS_DEWORMING` field computed server-side:

```php
$needsDeworming = ($totalMonths >= 12 && $dewormingStatus === 'No') ? 'Yes' : 'No';
```

**Prompt Update:** Simplified the deworming rule to rely on the `NEEDS_DEWORMING` flag instead of calculating age:

```
DEWORMING RULE (MANDATORY - SUMUNOD SA NEEDS DEWORMING FIELD):
- Kung NEEDS DEWORMING = Yes: MAGBIGAY NG DEWORMING TABLETS SA OUTPUT
- Kung NEEDS DEWORMING = No: HUWAG MAGBIGAY NG DEWORMING SA OUTPUT
```

---

### 3. Duplicate Meal Plan Fix

**Problem:** AI was outputting same base food for all 3 meals.

**File:** `app/Http/Controllers/RecommendationController.php`

**Fix:**

1. Added validation to detect duplicate base foods
2. Added retry logic with stricter prompt on retry
3. Added post-processing to ensure each meal has a different base food

---

### 4. Light Foods Standing Alone Fix

**Problem:** AI was outputting meals like "Tanghali: Saging" without a base food.

**Fix:** Added `fixMealPlan()` post-processing that automatically adds a base food (Lugaw/Kanin/Kamote) to meals with only light foods.

---

### 5. Age-Specific Food Format Fix

**Problem:** AI was not properly following mashed/pureed requirements for 6-11 month olds.

**Fix:** Added stricter prompt rules:

- 0-5 months: GATAS LAMANG
- 6-11 months: SOFT FOODS (mashed/pureed)
- 12-35 months: REGULAR SOLIDS
- 36+ months: Regular solid foods

---

### 6. Rate Limiting Implementation

**Problem:** No protection against API abuse.

**Files:**

- `app/Providers/AppServiceProvider.php` - Rate limiter configuration
- `routes/web.php` - Applied `throttle:recommendations` middleware

**Configuration:**

- Healthworkers: 10 requests per minute
- Admins: Unlimited access

---

### 7. Sidebar Cleanup

**File:** `resources/js/components/app-sidebar.tsx`

**Change:** Removed Repository and Documentation links from footer.

---

## Test Cases

| Child   | Age       | Deworming Status | Needs Deworming | Expected           |
| ------- | --------- | ---------------- | --------------- | ------------------ |
| Marxeus | 5 months  | No               | No              | No deworming       |
| Marcus  | 13 months | No               | Yes             | Deworming included |
| Elric   | 43 months | No               | Yes             | Deworming included |

---

## API Endpoint

**Route:** `POST /recommendations`

**Auth:** Admin or Healthworker

**Rate Limit:** 10 requests/minute (Healthworker), Unlimited (Admin)

**Request Body:**

```json
{
    "child_id": 5,
    "bmi": 16.5,
    "nutrition_status": "Normal"
}
```

**Response:**

```json
{
    "recommendation": "1. Mga Nutrition Tips...\n2. Meal Plan..."
}
```
