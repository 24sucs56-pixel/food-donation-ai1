from flask import Blueprint, request, jsonify
from database import users, donations
import bcrypt
from datetime import datetime

auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    
    phone = data.get("phone")
    state = data.get("state")
    district = data.get("district")
    city = data.get("city")
    pincode = data.get("pincode")
    address = data.get("address")
    
    vehicle = data.get("vehicle")
    ngo_name = data.get("ngo_name")
    registration_number = data.get("registration_number")
    donor_type = data.get("donor_type")
    document_image = data.get("document_image")

    # Check existing user
    if users.find_one({"email": email}):
        return jsonify({
            "status": "error",
            "message": "Email already exists"
        }), 400

    # Encrypt password
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Initial status
    status = "Approved" if role == "admin" else "Pending Approval"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role,
        "phone": phone,
        "state": state,
        "district": district,
        "city": city,
        "pincode": pincode,
        "address": address,
        "status": status,
        "email_verified": True,
        "admin_approved": status == "Approved",
        "account_status": "active" if status == "Approved" else "pending",
        "created_at": now_str,
        "registration_date": now_str,
        "points": 0
    }

    if role == "volunteer":
        user["vehicle"] = vehicle
        user["document_image"] = document_image
    elif role == "ngo":
        user["ngo_name"] = ngo_name
        user["registration_number"] = registration_number
        user["document_image"] = document_image
    elif role == "donor":
        user["donor_type"] = donor_type
        user["document_image"] = document_image

    users.insert_one(user)

    return jsonify({
        "status": "success",
        "message": "Registration Successful! Your account is pending admin verification." if status == "Pending Approval" else "Registration Successful!"
    })

@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    # ===== Debug Prints =====
    print("Received Data:", data)
    print("Email:", email)
    print("Password:", password)

    user = users.find_one({"email": email})

    print("User:", user)

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"]
    ):
        return jsonify({
            "status": "error",
            "message": "Incorrect password"
        }), 401

    # Check verification status for security
    user_status = user.get("status", "Approved")
    if user_status == "Pending Approval":
        return jsonify({
            "status": "error",
            "message": "Your account is pending verification by admin."
        }), 403
    elif user_status == "Rejected":
        return jsonify({
            "status": "error",
            "message": "you cant acces this anymore because of the admin choice"
        }), 403

    return jsonify({
        "status": "success",
        "message": "Login Successful",
        "name": user["name"],
        "role": user["role"],
        "email": user["email"],
        "profile_image": user.get("profile_image", "")
    })
@auth.route("/test")
def test():

    users.insert_one({
        "name": "Karthikeyan",
        "email": "test@gmail.com"
    })

    return {
        "message": "User inserted successfully"
    }
@auth.route("/allusers")
def all_users():

    data = []

    for user in users.find():

        data.append({
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role")
        })

    return jsonify(data)

@auth.route("/user/profile", methods=["GET"])
def user_profile():
    email = request.args.get("email")
    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400
        
    user = users.find_one({"email": email})
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404
        
    points = user.get("points", 0)
    role = user.get("role", "donor")
    
    # Calculate certificates and prizes dynamically
    certificate = "Contributor"
    prize = "None (Reach 100 points to unlock rewards!)"
    
    if points >= 200:
        if role == "volunteer":
            certificate = "Master Logistics Specialist"
        else:
            certificate = "Master Food Saver Expert"
        prize = "Gold Badge + $25 Premium Voucher"
    elif points >= 100:
        if role == "volunteer":
            certificate = "Certified Professional Food Courier"
        else:
            certificate = "Certified Professional Food Saver"
        prize = "Bronze Badge + $10 Grocery Voucher"
        
    avg_rating = "N/A"
    rating_count = 0
    if role == "volunteer":
        cursor = donations.find({
            "volunteer": user.get("name"),
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
            avg_rating = round(sum(ratings) / len(ratings), 1)
            rating_count = len(ratings)

    return jsonify({
        "status": "success",
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": role,
        "phone": user.get("phone", ""),
        "address": user.get("address", ""),
        "state": user.get("state", ""),
        "district": user.get("district", ""),
        "city": user.get("city", ""),
        "pincode": user.get("pincode", ""),
        "donor_type": user.get("donor_type", ""),
        "ngo_name": user.get("ngo_name", ""),
        "registration_number": user.get("registration_number", ""),
        "vehicle": user.get("vehicle", ""),
        "points": points,
        "certificate": certificate,
        "prize": prize,
        "profile_image": user.get("profile_image", ""),
        "user_status": user.get("status", "Approved"),
        "account_status": user.get("account_status", "active"),
        "created_at": user.get("created_at", user.get("registration_date", "")),
        "rating": avg_rating,
        "rating_count": rating_count
    })

@auth.route("/user/profile/update", methods=["PUT", "POST"])
def update_user_profile():
    data = request.get_json(silent=True) or {}
    email = data.get("email") or request.headers.get("X-User-Email")
    
    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    target_user = users.find_one({"email": email})
    if not target_user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    # Build fields to update
    editable_keys = ["name", "phone", "address", "state", "district", "city", "pincode", "donor_type", "ngo_name", "registration_number", "vehicle"]
    update_fields = {}
    
    for key in editable_keys:
        if key in data and data[key] is not None:
            update_fields[key] = str(data[key]).strip()

    if update_fields:
        users.update_one({"email": email}, {"$set": update_fields})

    updated_user = users.find_one({"email": email})
    return jsonify({
        "status": "success",
        "message": "Profile updated successfully",
        "name": updated_user.get("name", ""),
        "email": updated_user.get("email", ""),
        "role": updated_user.get("role", ""),
        "phone": updated_user.get("phone", ""),
        "address": updated_user.get("address", ""),
        "state": updated_user.get("state", ""),
        "district": updated_user.get("district", ""),
        "city": updated_user.get("city", ""),
        "pincode": updated_user.get("pincode", ""),
        "donor_type": updated_user.get("donor_type", ""),
        "ngo_name": updated_user.get("ngo_name", ""),
        "registration_number": updated_user.get("registration_number", ""),
        "vehicle": updated_user.get("vehicle", ""),
        "profile_image": updated_user.get("profile_image", "")
    })

@auth.route("/user/profile/image", methods=["POST"])
def update_profile_image():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    profile_image = data.get("profile_image")
    
    if not email or not profile_image:
        return jsonify({"status": "error", "message": "Email and image data are required"}), 400
        
    result = users.update_one({"email": email}, {"$set": {"profile_image": profile_image}})
    return jsonify({"status": "success", "message": "Profile image updated successfully"})

@auth.route("/user/change-password", methods=["POST"])
def change_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email") or request.headers.get("X-User-Email")
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not email or not current_password or not new_password:
        return jsonify({"status": "error", "message": "All password fields are required"}), 400
        
    user = users.find_one({"email": email})
    if not user:
        return jsonify({"status": "error", "message": "User account not found"}), 404
        
    if not bcrypt.checkpw(current_password.encode("utf-8"), user["password"]):
        return jsonify({"status": "error", "message": "Current password is incorrect"}), 401
        
    hashed_new = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    users.update_one({"email": email}, {"$set": {"password": hashed_new}})
    
    return jsonify({"status": "success", "message": "Password updated successfully!"})