import math

# NGO Database

ngos = [

    {
        "name": "Helping Hands NGO",
        "category": "Veg",
        "lat": 9.930500,
        "lng": 78.090100
    },

    {
        "name": "Food Care Trust",
        "category": "Non Veg",
        "lat": 9.925200,
        "lng": 78.087000
    },

    {
        "name": "Hope Foundation",
        "category": "Bakery",
        "lat": 9.920000,
        "lng": 78.082500
    },

    {
        "name": "Smile Charity",
        "category": "Fruits",
        "lat": 9.934000,
        "lng": 78.095000
    }

]
def calculate_distance(lat1, lon1, lat2, lon2):

    return math.sqrt(
        (lat1 - lat2) ** 2 +
        (lon1 - lon2) ** 2
    )
def recommend_ngo(category, latitude=None, longitude=None):
    matched = []
    
    if not category or not isinstance(category, str):
        category = "Veg"

    try:
        lat = float(latitude) if latitude is not None else 9.9252
        lng = float(longitude) if longitude is not None else 78.0870
    except (ValueError, TypeError):
        lat = 9.9252
        lng = 78.0870

    # Normalize category comparison to handle both "Non Veg" and "Non-Veg"
    normalized_category = category.replace("-", " ").strip().lower()

    for ngo in ngos:
        ngo_category = ngo["category"].replace("-", " ").strip().lower()

        if ngo_category == normalized_category:
            distance = calculate_distance(
                lat,
                lng,
                ngo["lat"],
                ngo["lng"]
            )
            matched.append({
                "name": ngo["name"],
                "distance": round(distance, 4)
            })

    if len(matched) == 0:
        return {
            "name": "Community Food Bank",
            "distance": 0
        }

    matched.sort(key=lambda x: x["distance"])
    return matched[0]