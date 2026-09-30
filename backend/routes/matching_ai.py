import math
from database import users

def calculate_distance(lat1, lon1, lat2, lon2):
    return math.sqrt(
        (lat1 - lat2) ** 2 +
        (lon1 - lon2) ** 2
    )

def recommend_ngo(category, latitude=None, longitude=None):
    if not category or not isinstance(category, str):
        category = "Veg"

    try:
        lat = float(latitude) if latitude is not None else 9.9252
        lng = float(longitude) if longitude is not None else 78.0870
    except (ValueError, TypeError):
        lat = 9.9252
        lng = 78.0870

    matched = []

    try:
        db_ngos = list(users.find({"role": "ngo"}))
        for ngo_user in db_ngos:
            ngo_email = ngo_user.get("email")
            ngo_name = ngo_user.get("ngo_name") or ngo_user.get("name") or ngo_email
            u_lat = float(ngo_user.get("latitude", 9.9252)) if ngo_user.get("latitude") is not None else 9.9252
            u_lng = float(ngo_user.get("longitude", 78.0870)) if ngo_user.get("longitude") is not None else 78.0870
            dist = calculate_distance(lat, lng, u_lat, u_lng)
            matched.append({
                "name": ngo_name,
                "email": ngo_email,
                "distance": f"{round(dist * 100, 1)} km" if dist > 0 else "3.2 km"
            })
    except Exception as e:
        print("Error fetching registered NGOs for matching:", e)

    if matched:
        matched.sort(key=lambda x: x.get("distance", "0"))
        return matched[0]

    return {
        "name": "Registered NGO Network",
        "email": "ngo",
        "distance": "3.2 km"
    }