from flask import Blueprint, request, jsonify
from database import users, donations
import bcrypt
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename

auth = Blueprint("auth", __name__)

ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth.route("/register", methods=["POST"])
def register():
    # Support multipart/form-data, application/x-www-form-urlencoded, and JSON payloads
    if request.content_type and "multipart/form-data" in request.content_type:
        data = request.form
        uploaded_file = request.files.get("document") or request.files.get("document_file") or request.files.get("file")
    elif request.is_json:
        data = request.get_json(silent=True) or {}
        uploaded_file = None
    else:
        data = request.form if request.form else (request.get_json(silent=True) or {})
        uploaded_file = request.files.get("document") or request.files.get("document_file") or request.files.get("file") if request.files else None

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = (data.get("role") or "").lower().strip()
    
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
    document_image = data.get("document_image") # base64 fallback if provided

    if not email or not password or not role or not name:
        return jsonify({
            "status": "error",
            "message": "Name, email, password, and role are required."
        }), 400

    # Check existing user
    if users.find_one({"email": email}):
        return jsonify({
            "status": "error",
            "message": "Email already exists"
        }), 400

    # Document upload validation for Donor, NGO, Volunteer
    document_type = None
    document_filename = None
    document_path = None
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if role in ["donor", "ngo", "volunteer"]:
        if role == "donor":
            document_type = "Food Certificate"
        elif role == "ngo":
            document_type = "NGO Certificate"
        elif role == "volunteer":
            document_type = "Aadhaar / Vehicle License"

        if uploaded_file and uploaded_file.filename:
            if not allowed_file(uploaded_file.filename):
                return jsonify({
                    "status": "error",
                    "message": "Invalid file format. Allowed formats: PDF, JPG, JPEG, PNG."
                }), 400

            # Validate file size (10 MB limit)
            uploaded_file.seek(0, os.SEEK_END)
            file_length = uploaded_file.tell()
            uploaded_file.seek(0)
            if file_length > 10 * 1024 * 1024:
                return jsonify({
                    "status": "error",
                    "message": "File size exceeds the 10 MB limit."
                }), 400

            original_name = secure_filename(uploaded_file.filename) or f"{role}_doc"
            ext = original_name.rsplit('.', 1)[1].lower() if '.' in original_name else "pdf"
            unique_filename = f"{role}_{uuid.uuid4().hex[:8]}_{original_name}"
            
            upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads', 'documents'))
            os.makedirs(upload_dir, exist_ok=True)
            saved_path = os.path.join(upload_dir, unique_filename)
            uploaded_file.save(saved_path)

            document_filename = uploaded_file.filename
            document_path = f"uploads/documents/{unique_filename}"
        elif document_image:
            # Fallback if base64 document image was uploaded
            document_filename = f"{role}_document.png"
            document_path = document_image
        else:
            return jsonify({
                "status": "error",
                "message": f"Verification document is required for {role.upper()} registration."
            }), 400

    # Encrypt password
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Initial verification status
    is_admin = (role == "admin")
    verification_status = "Approved" if is_admin else "Pending"
    status = verification_status

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
        "verification_status": verification_status,
        "email_verified": True,
        "admin_approved": is_admin,
        "account_status": "active" if is_admin else "pending",
        "created_at": now_str,
        "registration_date": now_str,
        "points": 0
    }

    if document_type:
        user["document_type"] = document_type
        user["document_filename"] = document_filename
        user["document_path"] = document_path
        user["document_uploaded_at"] = now_str
        user["document_image"] = document_path

    if role == "volunteer":
        user["vehicle"] = vehicle
    elif role == "ngo":
        user["ngo_name"] = ngo_name
        user["registration_number"] = registration_number
    elif role == "donor":
        user["donor_type"] = donor_type

    users.insert_one(user)

    return jsonify({
        "status": "success",
        "message": "Registration submitted successfully. Your account is pending Admin verification." if not is_admin else "Registration Successful!"
    })

@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")

    print("Login attempt for:", email)

    user = users.find_one({"email": email})

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

    # Role & Verification status check
    user_role = user.get("role", "donor")
    if user_role != "admin":
        ver_status = user.get("verification_status") or user.get("status", "Approved")
        if ver_status in ["Pending", "Pending Approval"]:
            return jsonify({
                "status": "error",
                "message": "Your account is waiting for Admin verification."
            }), 403
        elif ver_status == "Rejected":
            return jsonify({
                "status": "error",
                "message": "Your registration document was rejected by Admin."
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