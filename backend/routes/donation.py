from flask import Blueprint, request, jsonify
from database import donations, users
from bson.objectid import ObjectId
from datetime import datetime
from routes.ai import check_food_freshness, get_priority
from routes.matching_ai import recommend_ngo
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from auth_middleware import authorize_role

donation = Blueprint("donation", __name__)


def get_volunteer_rating_by_name(volunteer_name):
    if not volunteer_name:
        return None
    cursor = donations.find({
        "volunteer": volunteer_name,
        "status": "Delivered",
        "$or": [
            {"donor_rating": {"$exists": True}},
            {"ngo_rating": {"$exists": True}}
        ]
    })
    ratings = []
    for d in cursor:
        if "donor_rating" in d:
            ratings.append(d["donor_rating"])
        if "ngo_rating" in d:
            ratings.append(d["ngo_rating"])
    if ratings:
        return round(sum(ratings) / len(ratings), 1)
    return None


# ==========================
# SAVE DONATION
# ==========================
@donation.route("/accept/<id>", methods=["PUT"])
def accept_donation(id):
    is_auth, auth_err = authorize_role(["ngo", "admin"])
    if not is_auth:
        return auth_err

    data = request.get_json(silent=True) or {}
    ngo_name = data.get("ngo") or request.args.get("ngo") or "Helping Hands NGO"

    donations.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "status": "Accepted",
                "ngo": ngo_name,
                "accepted_at": datetime.now().strftime("%d-%m-%Y %I:%M %p")
            }
        }
    )

    return jsonify({
        "status": "success",
        "message": "Donation Accepted"
    })
@donation.route("/donate", methods=["POST"])
def donate():
    is_auth, auth_err = authorize_role(["donor", "admin"])
    if not is_auth:
        return auth_err

    data = request.get_json()

    food_name = data.get("food_name")
    quantity = data.get("quantity")
    category = data.get("category")
    prepared_time = data.get("prepared_time")
    storage = data.get("storage")
    expiry = data.get("expiry")
    address = data.get("address")
    latitude = data.get("latitude") or data.get("donor_latitude")
    longitude = data.get("longitude") or data.get("donor_longitude")
    donor_email = data.get("donor_email")
    
    # AI Food Analysis
    ai_result = check_food_freshness(expiry)
    priority = get_priority(ai_result["freshness"])
    ngo = recommend_ngo(category, latitude, longitude)
    donation_data = {

    "food_name": food_name,
    "quantity": quantity,
    "category": category,
    "prepared_time": prepared_time,
    "storage": storage,
    "expiry": expiry,
    "address": address,
    "latitude": latitude,
    "longitude": longitude,
    "donor_email": donor_email,

    # AI Analysis
    "freshness": ai_result["freshness"],
    "ai_result": ai_result["result"],
    "recommendation": ai_result["recommendation"],
    "priority": priority,

    # NGO Recommendation
    "recommended_ngo": ngo["name"],
    "distance": ngo["distance"],

    # Donation Status
    "status": "Waiting",
    "ngo": "",
    "volunteer": "",
    "requested_volunteer": "",
    "volunteer_status": None,
    "ngo_delivery_confirmation": None,

    "created_at": datetime.now().strftime("%d-%m-%Y %I:%M %p"),
    "accepted_at": "",
    "picked_at": "",
    "delivered_at": "",
    "ngo_confirmed_at": "",
    "ngo_confirmed_by": ""

}

    res = donations.insert_one(donation_data)

    if donor_email:
        users.update_one({"email": donor_email}, {"$inc": {"points": 10}})

    return jsonify({
        "status": "success",
        "message": "Food Donation Submitted Successfully",
        "donation_id": str(res.inserted_id)
    })
@donation.route("/accepted-donations", methods=["GET"])
def accepted_donations():

    accepted = []

    for item in donations.find({

    "status": {

        "$in": ["Accepted", "Picked", "Delivered"]

    }

}):

        item["_id"] = str(item["_id"])
        vol_name = item.get("volunteer")
        item["volunteer_rating"] = get_volunteer_rating_by_name(vol_name) if vol_name else None
        accepted.append(item)

    return jsonify({
        "status": "success",
        "data": accepted
    })


# ==========================
# VOLUNTEER REQUEST PICKUP
# ==========================
@donation.route("/volunteer/request-pickup/<id>", methods=["PUT"])
def request_pickup(id):
    is_auth, auth_err = authorize_role(["volunteer", "admin"])
    if not is_auth:
        return auth_err

    data = request.get_json(silent=True) or {}
    volunteer_name = data.get("volunteer") or request.args.get("volunteer") or "Demo Volunteer"

    d = donations.find_one({"_id": ObjectId(id)})
    if not d:
        return jsonify({"status": "error", "message": "Donation not found"}), 404

    if d.get("status") != "Accepted":
        return jsonify({"status": "error", "message": "Donation is not in Accepted status"}), 400

    donations.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "requested_volunteer": volunteer_name,
                "volunteer_status": "Requested"
            }
        }
    )

    return jsonify({
        "status": "success",
        "message": "Pickup requested. Waiting for NGO approval."
    })


# ==========================
# NGO APPROVE VOLUNTEER
# ==========================
@donation.route("/ngo/approve-volunteer/<id>", methods=["PUT"])
def approve_volunteer(id):
    is_auth, auth_err = authorize_role(["ngo", "admin"])
    if not is_auth:
        return auth_err

    d = donations.find_one({"_id": ObjectId(id)})
    if not d:
        return jsonify({"status": "error", "message": "Donation not found"}), 404

    requested_volunteer = d.get("requested_volunteer")
    if not requested_volunteer or d.get("volunteer_status") != "Requested":
        return jsonify({"status": "error", "message": "No pending volunteer request for this donation"}), 400

    donations.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "volunteer": requested_volunteer,
                "volunteer_status": "Approved"
            }
        }
    )

    return jsonify({
        "status": "success",
        "message": f"Volunteer {requested_volunteer} approved for pickup"
    })


@donation.route("/pickup/<id>", methods=["PUT"])
def pickup(id):
    is_auth, auth_err = authorize_role(["volunteer", "admin"])
    if not is_auth:
        return auth_err

    data = request.get_json(silent=True) or {}
    volunteer_name = data.get("volunteer") or request.args.get("volunteer") or "Demo Volunteer"

    d = donations.find_one({"_id": ObjectId(id)})
    if not d:
        return jsonify({"status": "error", "message": "Donation not found"}), 404

    vol_status = d.get("volunteer_status")
    if vol_status and vol_status != "Approved":
        return jsonify({"status": "error", "message": "Pickup is not approved by NGO yet"}), 400

    donations.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "status": "Picked",
                "volunteer": volunteer_name,
                "volunteer_status": "Picked",
                "picked_at": datetime.now().strftime("%d-%m-%Y %I:%M %p")
            }
        }
    )

    return jsonify({
        "status": "success",
        "message": "Food Picked Successfully"
    })


# ==========================
# DELIVER FOOD
# ==========================

@donation.route("/deliver/<id>", methods=["PUT"])
def deliver(id):
    is_auth, auth_err = authorize_role(["volunteer", "admin"])
    if not is_auth:
        return auth_err

    d = donations.find_one({"_id": ObjectId(id)})
    if not d:
        return jsonify({"status": "error", "message": "Donation not found"}), 404

    volunteer_name = d.get("volunteer")

    donations.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "status": "Delivered",
                "volunteer_status": "Delivered",
                "delivered_at": datetime.now().strftime("%d-%m-%Y %I:%M %p")
            }
        }
    )

    if volunteer_name:
        users.update_one({"name": volunteer_name}, {"$inc": {"points": 15}})

    return jsonify({
        "status": "success",
        "message": "Food Delivered Successfully"
    })


# ==========================
# NGO CONFIRM DELIVERY
# ==========================
@donation.route("/ngo/confirm-delivery/<id>", methods=["PUT"])
def confirm_delivery(id):
    is_auth, auth_err = authorize_role(["ngo", "admin"])
    if not is_auth:
        return auth_err

    data = request.get_json(silent=True) or {}
    ngo_name = data.get("ngo") or request.args.get("ngo") or "Helping Hands NGO"

    d = donations.find_one({"_id": ObjectId(id)})
    if not d:
        return jsonify({"status": "error", "message": "Donation not found"}), 404

    if d.get("status") != "Delivered":
        return jsonify({"status": "error", "message": "Donation must be in Delivered status before NGO confirmation"}), 400

    if d.get("ngo_delivery_confirmation") == "Confirmed":
        return jsonify({"status": "error", "message": "Delivery has already been confirmed"}), 400

    donations.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "ngo_delivery_confirmation": "Confirmed",
                "ngo_confirmed_at": datetime.now().strftime("%d-%m-%Y %I:%M %p"),
                "ngo_confirmed_by": ngo_name
            }
        }
    )

    return jsonify({
        "status": "success",
        "message": "Delivery Confirmed Successfully"
    })


# ==========================
# RATE VOLUNTEER
# ==========================
@donation.route("/rate-volunteer/<id>", methods=["POST"])
def rate_volunteer(id):
    data = request.get_json(silent=True) or {}
    role = data.get("role")
    rating = data.get("rating")

    if not role or rating is None:
        return jsonify({
            "status": "error",
            "message": "Role and rating are required"
        }), 400

    try:
        rating = float(rating)
    except ValueError:
        return jsonify({
            "status": "error",
            "message": "Rating must be a number"
        }), 400

    if not (1.0 <= rating <= 5.0):
        return jsonify({
            "status": "error",
            "message": "Rating must be between 1 and 5"
        }), 400

    d = donations.find_one({"_id": ObjectId(id)})
    if not d:
        return jsonify({
            "status": "error",
            "message": "Donation not found"
        }), 404

    if not d.get("volunteer"):
        return jsonify({
            "status": "error",
            "message": "No volunteer assigned to this delivery"
        }), 400

    if d.get("status") != "Delivered":
        return jsonify({
            "status": "error",
            "message": "Volunteer can only be rated after delivery is completed"
        }), 400

    update_field = "donor_rating" if role == "donor" else "ngo_rating"
    donations.update_one(
        {"_id": ObjectId(id)},
        {"$set": {update_field: rating}}
    )

    return jsonify({
        "status": "success",
        "message": f"Thank you! You rated the volunteer {rating} \u2605"
    })

# ==========================
# GET ALL DONATIONS
# ==========================


@donation.route("/donations", methods=["GET"])
def get_donations():

    all_donations = []

    for item in donations.find():
        item["_id"] = str(item["_id"])
        vol_name = item.get("volunteer")
        item["volunteer_rating"] = get_volunteer_rating_by_name(vol_name) if vol_name else None
        all_donations.append(item)

    return jsonify({
        "status": "success",
        "data": all_donations
    })

# ==========================
# GET VOLUNTEER REVIEWS & BREAKDOWN
# ==========================
@donation.route("/volunteer/reviews", methods=["GET"])
def volunteer_reviews():
    email = request.args.get("email")
    name = request.args.get("name")
    
    volunteer_name = None
    if email:
        u = users.find_one({"email": email})
        if u:
            volunteer_name = u.get("name")
    if not volunteer_name and name:
        volunteer_name = name
        
    if not volunteer_name:
        return jsonify({
            "status": "error",
            "message": "Volunteer email or name is required"
        }), 400
        
    cursor = donations.find({
        "volunteer": volunteer_name,
        "status": "Delivered"
    }).sort("_id", -1)
    
    donor_reviews = []
    ngo_reviews = []
    all_reviews = []
    
    donor_ratings_list = []
    ngo_ratings_list = []
    
    donor_email_cache = {}
    
    for d in cursor:
        d_id = str(d["_id"])
        food_name = d.get("food_name", "Food Donation")
        if isinstance(food_name, list):
            food_name = ", ".join([f.get("name", str(f)) if isinstance(f, dict) else str(f) for f in food_name])
        
        category = d.get("category", "Veg")
        quantity = d.get("quantity", 0)
        delivered_at = d.get("delivered_at") or d.get("created_at") or "Recently"
        
        # 1. Check if Donor reviewed
        if "donor_rating" in d:
            d_rating = float(d["donor_rating"])
            donor_ratings_list.append(d_rating)
            donor_email = d.get("donor_email", "")
            
            donor_display_name = "Generous Donor"
            if donor_email:
                if donor_email not in donor_email_cache:
                    donor_user = users.find_one({"email": donor_email})
                    if donor_user:
                        donor_email_cache[donor_email] = donor_user.get("name", donor_email)
                    else:
                        donor_email_cache[donor_email] = donor_email.split("@")[0].replace(".", " ").title()
                donor_display_name = donor_email_cache[donor_email]
                
            feedback_text = d.get("donor_feedback") or (
                "Super fast pickup! Food was safely loaded in insulated crates and handled with great care." if d_rating >= 4.8 else
                "Good and punctual courier delivery. Very polite and coordinated well over phone." if d_rating >= 4.0 else
                "Food collected and delivered on schedule."
            )
            
            rev = {
                "id": f"{d_id}_donor",
                "reviewer_type": "Donor",
                "reviewer_name": donor_display_name,
                "reviewer_role": "Donor",
                "rating": d_rating,
                "food_name": food_name,
                "category": category,
                "quantity": quantity,
                "delivered_at": delivered_at,
                "address": d.get("address", ""),
                "feedback": feedback_text
            }
            donor_reviews.append(rev)
            all_reviews.append(rev)
            
        # 2. Check if NGO reviewed
        if "ngo_rating" in d:
            n_rating = float(d["ngo_rating"])
            ngo_ratings_list.append(n_rating)
            ngo_name = d.get("ngo") or d.get("recommended_ngo") or "Partner NGO"
            
            feedback_text = d.get("ngo_feedback") or (
                "Received in pristine condition with safety verification intact. Distributed immediately to beneficiaries!" if n_rating >= 4.8 else
                "Delivered on schedule to our distribution center. Excellent communication." if n_rating >= 4.0 else
                "Package delivered and verified safely."
            )
            
            rev = {
                "id": f"{d_id}_ngo",
                "reviewer_type": "NGO",
                "reviewer_name": ngo_name,
                "reviewer_role": "NGO Partner",
                "rating": n_rating,
                "food_name": food_name,
                "category": category,
                "quantity": quantity,
                "delivered_at": delivered_at,
                "address": d.get("address", ""),
                "feedback": feedback_text
            }
            ngo_reviews.append(rev)
            all_reviews.append(rev)
            
    total_ratings = donor_ratings_list + ngo_ratings_list
    avg_rating = round(sum(total_ratings) / len(total_ratings), 1) if total_ratings else 0.0
    avg_donor_rating = round(sum(donor_ratings_list) / len(donor_ratings_list), 1) if donor_ratings_list else 0.0
    avg_ngo_rating = round(sum(ngo_ratings_list) / len(ngo_ratings_list), 1) if ngo_ratings_list else 0.0
    
    return jsonify({
        "status": "success",
        "volunteer_name": volunteer_name,
        "average_rating": avg_rating,
        "total_reviews": len(all_reviews),
        "donor_reviews_count": len(donor_reviews),
        "donor_average_rating": avg_donor_rating,
        "ngo_reviews_count": len(ngo_reviews),
        "ngo_average_rating": avg_ngo_rating,
        "reviews": all_reviews
    })