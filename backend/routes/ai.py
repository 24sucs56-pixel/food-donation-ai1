from datetime import datetime


def check_food_freshness(expiry_time, expiry_date=None):
    try:
        now = datetime.now()
        if not expiry_time:
            expiry_time = "23:59"
            
        time_str = str(expiry_time).strip()
        expiry = None
        for fmt in ("%H:%M", "%I:%M %p", "%H:%M:%S", "%I:%M:%S %p"):
            try:
                expiry = datetime.strptime(time_str, fmt)
                break
            except ValueError:
                pass
        if not expiry:
            expiry = datetime.strptime("23:59", "%H:%M")

        if expiry_date:
            date_str = str(expiry_date).strip()
            exp_dt = None
            for dfmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y"):
                try:
                    exp_dt = datetime.strptime(date_str, dfmt)
                    break
                except ValueError:
                    pass
            if exp_dt:
                expiry = expiry.replace(year=exp_dt.year, month=exp_dt.month, day=exp_dt.day)
            else:
                expiry = expiry.replace(year=now.year, month=now.month, day=now.day)
        else:
            expiry = expiry.replace(year=now.year, month=now.month, day=now.day)

        hours_left = (expiry - now).total_seconds() / 3600
        if hours_left <= 0 and not expiry_date:
            from datetime import timedelta
            expiry = expiry + timedelta(days=1)
            hours_left = (expiry - now).total_seconds() / 3600

        if hours_left > 4:

            return {
                "freshness": 95,
                "result": "Safe",
                "recommendation": "Food is fresh. Collect within 4 hours."
            }

        elif hours_left > 2:

            return {
                "freshness": 80,
                "result": "Good",
                "recommendation": "Collect within 2 hours."
            }

        elif hours_left > 1:

            return {
                "freshness": 60,
                "result": "Average",
                "recommendation": "Deliver immediately."
            }

        elif hours_left > 0:

            return {
                "freshness": 35,
                "result": "Unsafe",
                "recommendation": "Food is about to expire."
            }

        else:

            return {
                "freshness": 0,
                "result": "Expired",
                "recommendation": "Do not donate this food."
            }

    except:

        return {
            "freshness": 0,
            "result": "Invalid",
            "recommendation": "Invalid expiry time."
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