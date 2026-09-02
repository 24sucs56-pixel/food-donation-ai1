from flask import Blueprint, jsonify, request
from database import donations, users

admin = Blueprint("admin", __name__)

@admin.route("/admin/dashboard", methods=["GET"])
def dashboard():

    total_users = users.count_documents({})

    total_donations = donations.count_documents({})

    waiting = donations.count_documents({"status": "Waiting"})

    accepted = donations.count_documents({"status": "Accepted"})

    picked = donations.count_documents({"status": "Picked"})

    delivered = donations.count_documents({"status": "Delivered"})

    veg = donations.count_documents({"category": "Veg"})

    nonveg = donations.count_documents({"category": "Non-Veg"})

    recent = []

    for item in donations.find().sort("_id", -1).limit(5):

        item["_id"] = str(item["_id"])

        recent.append(item)

    return jsonify({

        "status": "success",

        "total_users": total_users,

        "total_donations": total_donations,

        "waiting": waiting,

        "accepted": accepted,

        "picked": picked,

        "delivered": delivered,

        "veg": veg,

        "nonveg": nonveg,

        "recent": recent

    })

@admin.route("/admin/users", methods=["GET"])
def get_users():
    all_users = []
    for user in users.find({"role": {"$ne": "admin"}}):
        all_users.append({
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "phone": user.get("phone", ""),
            "state": user.get("state", ""),
            "district": user.get("district", ""),
            "city": user.get("city", ""),
            "pincode": user.get("pincode", ""),
            "address": user.get("address", ""),
            "status": user.get("status", "Approved"),
            "vehicle": user.get("vehicle", ""),
            "ngo_name": user.get("ngo_name", ""),
            "registration_number": user.get("registration_number", ""),
            "donor_type": user.get("donor_type", ""),
            "document_image": user.get("document_image", "")
        })
    return jsonify({
        "status": "success",
        "data": all_users
    })

@admin.route("/admin/users/verify", methods=["POST"])
def verify_user():
    data = request.get_json()
    email = data.get("email")
    status = data.get("status") # "Approved" or "Rejected"
    
    if not email or not status:
        return jsonify({
            "status": "error",
            "message": "Email and status are required."
        }), 400
        
    result = users.update_one({"email": email}, {"$set": {"status": status}})
    if result.matched_count == 0:
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404
        
    return jsonify({
        "status": "success",
        "message": f"User status updated to {status} successfully."
    })