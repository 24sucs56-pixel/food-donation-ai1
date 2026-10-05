from datetime import datetime, timedelta


def parse_time_str(time_str):
    if not time_str:
        return 23, 59
    t_str = str(time_str).strip()

    period = None
    if "AM" in t_str.upper():
        period = "AM"
        t_str = t_str.upper().replace("AM", "").strip()
    elif "PM" in t_str.upper():
        period = "PM"
        t_str = t_str.upper().replace("PM", "").strip()

    parts = t_str.split(":")
    if len(parts) < 2:
        return 23, 59
    try:
        hour = int(parts[0])
        minute = int(parts[1])
    except ValueError:
        return 23, 59

    if hour > 12:
        return hour, minute

    if period == "AM":
        if hour == 12:
            hour = 0
    elif period == "PM":
        if hour < 12:
            hour += 12

    return hour, minute


def parse_date_str(date_str, default_date=None):
    if not date_str:
        return default_date or datetime.now().date()
    d_str = str(date_str).strip()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(d_str, fmt).date()
        except ValueError:
            pass
    return default_date or datetime.now().date()


def get_category_adjustment(cat):
    if not cat or not isinstance(cat, str):
        return 0
    norm = cat.strip().lower()
    if norm in ("non veg", "non-veg"):
        return -10
    elif norm == "veg":
        return -2
    return 0


def get_storage_adjustment(stg):
    if not stg or not isinstance(stg, str):
        return 0
    norm = stg.strip().lower()
    if norm == "room temperature":
        return -10
    elif norm in ("refrigerated", "refrigerator"):
        return 3
    elif norm == "frozen":
        return 5
    return 0


def check_food_freshness(expiry_time, expiry_date=None, prep_time=None, prep_date=None, category=None, storage=None, food_name=None):
    try:
        now = datetime.now()

        # Parse expiry date & time
        exp_hour, exp_min = parse_time_str(expiry_time)
        exp_d = parse_date_str(expiry_date, default_date=now.date())
        expiry_dt = datetime(exp_d.year, exp_d.month, exp_d.day, exp_hour, exp_min)

        # Parse prep date & time
        if prep_time:
            prep_hour, prep_min = parse_time_str(prep_time)
            prep_d = parse_date_str(prep_date, default_date=exp_d)
            prep_dt = datetime(prep_d.year, prep_d.month, prep_d.day, prep_hour, prep_min)
        else:
            prep_dt = expiry_dt - timedelta(hours=8)

        total_life_sec = (expiry_dt - prep_dt).total_seconds()
        remaining_sec = (expiry_dt - now).total_seconds()
        elapsed_sec = (now - prep_dt).total_seconds()

        hours_left = remaining_sec / 3600.0

        # Expired Check (BUG 3: MUST NOT ADD 1 DAY)
        if remaining_sec <= 0 or now >= expiry_dt:
            return {
                "freshness": 0,
                "hours_left": 0,
                "result": "Expired",
                "recommendation": "This food is expired and is not good for donation. Please do not donate this food."
            }

        if elapsed_sec < 0:
            return {
                "freshness": 0,
                "hours_left": hours_left,
                "result": "Upcoming",
                "recommendation": "Preparation time has not been reached yet."
            }

        if total_life_sec <= 0:
            return {
                "freshness": 0,
                "hours_left": 0,
                "result": "Invalid",
                "recommendation": "Expiry time must be after preparation time."
            }

        base_ratio = (remaining_sec / total_life_sec) * 100.0
        storage_adj = get_storage_adjustment(storage)

        # Category adjustments for multiple food items (BUG 5)
        categories = []
        if isinstance(food_name, list):
            for item in food_name:
                if isinstance(item, dict) and item.get("category"):
                    categories.append(item.get("category"))
                elif isinstance(item, str):
                    categories.append(category or "")
        elif category:
            categories.append(category)

        if not categories:
            categories = ["Veg"]

        lowest_score = 100
        for cat in categories:
            cat_adj = get_category_adjustment(cat)
            score = round(max(0, min(100, base_ratio + cat_adj + storage_adj)))
            if score < lowest_score:
                lowest_score = score

        final_score = round(max(0, min(100, lowest_score)))

        if hours_left <= 1:
            result = "Near Expiry"
            rec = "This food is nearly expired and is not recommended for donation. Please do not donate this food."
        elif final_score >= 75:
            result = "Fresh"
            rec = "This food is fresh and safe to donate. Please donate this food."
        elif final_score >= 50:
            result = "Moderate"
            rec = "This food is moderately fresh. It can be donated, but please donate it as soon as possible."
        else:
            result = "Low Freshness"
            rec = "Food is close to expiry. Donate immediately if safe."

        return {
            "freshness": final_score,
            "hours_left": hours_left,
            "result": result,
            "recommendation": rec
        }
    except Exception as err:
        print("check_food_freshness exception:", err)
        return {
            "freshness": 0,
            "hours_left": 0,
            "result": "Invalid",
            "recommendation": "Error calculating freshness."
        }


def get_priority(freshness):

    if freshness <= 30:
        return "Very High"

    elif freshness <= 60:
        return "High"

    elif freshness <= 80:
        return "Medium"

    else:
        return "Low"


def recommend_ngo(category):
    norm_cat = category.replace("-", " ").strip().lower()

    if norm_cat == "veg":
        return "Helping Hands NGO"

    elif norm_cat == "non veg":
        return "Food Care Trust"

    elif norm_cat == "bakery":
        return "Hope Foundation"

    elif norm_cat == "fruits":
        return "Smile Charity"

    else:
        return "Community Food Bank"