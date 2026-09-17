from flask import Blueprint, jsonify, request
from database import donations, users, admin_activity
import sys, os
from datetime import datetime
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from auth_middleware import authorize_role

admin = Blueprint("admin", __name__)

@admin.route("/admin/dashboard", methods=["GET"])
def dashboard():
    is_authorized, auth_err = authorize_role(["admin"])
    if not is_authorized:
        return auth_err

    total_users = users.count_documents({})
    total_donors = users.count_documents({"role": "donor"})
    total_ngos = users.count_documents({"role": "ngo"})
    total_volunteers = users.count_documents({"role": "volunteer"})

    pending_verifications = users.count_documents({"status": "Pending Approval"})
    approved_users = users.count_documents({"status": "Approved"})
    rejected_users = users.count_documents({"status": "Rejected"})

    # Role specific verification breakdown
    donor_pending = users.count_documents({"role": "donor", "status": "Pending Approval"})
    donor_approved = users.count_documents({"role": "donor", "status": "Approved"})
    donor_rejected = users.count_documents({"role": "donor", "status": "Rejected"})

    ngo_pending = users.count_documents({"role": "ngo", "status": "Pending Approval"})
    ngo_approved = users.count_documents({"role": "ngo", "status": "Approved"})
    ngo_rejected = users.count_documents({"role": "ngo", "status": "Rejected"})

    volunteer_pending = users.count_documents({"role": "volunteer", "status": "Pending Approval"})
    volunteer_approved = users.count_documents({"role": "volunteer", "status": "Approved"})
    volunteer_rejected = users.count_documents({"role": "volunteer", "status": "Rejected"})

    # Donation statistics
    total_donations = donations.count_documents({})
    waiting = donations.count_documents({"status": "Waiting"})
    accepted = donations.count_documents({"status": "Accepted"})
    picked = donations.count_documents({"status": "Picked"})
    delivered = donations.count_documents({"status": "Delivered"})
    veg = donations.count_documents({"category": "Veg"})
    nonveg = donations.count_documents({"category": "Non-Veg"})

    # Recent donations
    recent = []
    for item in donations.find().sort("_id", -1).limit(5):
        item["_id"] = str(item["_id"])
        recent.append(item)

    # Recent Admin Activity Log (Real database audit)
    recent_activity = []
    for act in admin_activity.find().sort("_id", -1).limit(10):
        act["_id"] = str(act["_id"])
        recent_activity.append(act)

    # Pending verifications for quick review on dashboard
    pending_users_list = []
    for u in users.find({"status": "Pending Approval"}).sort("_id", -1).limit(10):
        pending_users_list.append({
            "name": u.get("name"),
            "email": u.get("email"),
            "role": u.get("role"),
            "status": u.get("status"),
            "created_at": u.get("created_at", u.get("registration_date", "Recently"))
        })

    return jsonify({
        "status": "success",
        "total_users": total_users,
        "total_donors": total_donors,
        "total_ngos": total_ngos,
        "total_volunteers": total_volunteers,
        "pending_verifications": pending_verifications,
        "approved_users": approved_users,
        "rejected_users": rejected_users,
        "verification_overview": {
            "donor": { "pending": donor_pending, "approved": donor_approved, "rejected": donor_rejected },
            "ngo": { "pending": ngo_pending, "approved": ngo_approved, "rejected": ngo_rejected },
            "volunteer": { "pending": volunteer_pending, "approved": volunteer_approved, "rejected": volunteer_rejected }
        },
        "total_donations": total_donations,
        "waiting": waiting,
        "accepted": accepted,
        "picked": picked,
        "delivered": delivered,
        "veg": veg,
        "nonveg": nonveg,
        "recent": recent,
        "recent_activity": recent_activity,
        "pending_users_list": pending_users_list
    })

@admin.route("/admin/users", methods=["GET"])
def get_users():
    is_authorized, auth_err = authorize_role(["admin"])
    if not is_authorized:
        return auth_err

    all_users = []
    for user in users.find():
        user_status = user.get("status", "Approved")
        all_users.append({
            "id": str(user["_id"]),
            "name": user.get("name", "N/A"),
            "email": user.get("email", ""),
            "role": user.get("role", "donor"),
            "phone": user.get("phone", "-"),
            "state": user.get("state", ""),
            "district": user.get("district", ""),
            "city": user.get("city", ""),
            "pincode": user.get("pincode", ""),
            "address": user.get("address", "-"),
            "status": user_status,
            "email_verified": user.get("email_verified", True),
            "admin_approved": user.get("admin_approved", user_status == "Approved"),
            "account_status": user.get("account_status", "active" if user_status == "Approved" else ("inactive" if user_status == "Rejected" else "pending")),
            "registration_date": user.get("registration_date", user.get("created_at", "N/A")),
            "created_at": user.get("created_at", user.get("registration_date", "N/A")),
            "approved_at": user.get("approved_at", ""),
            "approved_by": user.get("approved_by", ""),
            "rejected_at": user.get("rejected_at", ""),
            "rejected_by": user.get("rejected_by", ""),
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
    is_authorized, auth_err = authorize_role(["admin"])
    if not is_authorized:
        return auth_err

    data = request.get_json() or {}
    email = data.get("email")
    status = data.get("status") # "Approved" or "Rejected"
    action = data.get("action") # "approve" or "reject"
    if not status and action:
        if str(action).lower() in ["approve", "approved"]:
            status = "Approved"
        elif str(action).lower() in ["reject", "rejected"]:
            status = "Rejected"

    admin_email = request.headers.get("X-User-Email") or data.get("admin_email") or "admin.demo@foodbridge.test"
    
    if not email or not status:
        return jsonify({
            "status": "error",
            "message": "Email and status are required."
        }), 400

    target_user = users.find_one({"email": email})
    if not target_user:
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    update_doc = {
        "status": status,
        "account_status": "active" if status == "Approved" else "inactive",
        "admin_approved": status == "Approved"
    }

    if status == "Approved":
        update_doc["approved_at"] = now_str
        update_doc["approved_by"] = admin_email
    elif status == "Rejected":
        update_doc["rejected_at"] = now_str
        update_doc["rejected_by"] = admin_email

    users.update_one({"email": email}, {"$set": update_doc})

    # Record audit trail in real admin_activity collection
    admin_activity.insert_one({
        "user_name": target_user.get("name", "User"),
        "user_email": email,
        "user_role": target_user.get("role", "user"),
        "action": f"{status}",
        "status": status,
        "admin_email": admin_email,
        "timestamp": now_str
    })

    return jsonify({
        "status": "success",
        "message": f"User {target_user.get('name', email)} status updated to {status} successfully."
    })

@admin.route("/admin/donations", methods=["GET"])
def get_donations():
    is_authorized, auth_err = authorize_role(["admin"])
    if not is_authorized:
        return auth_err

    all_donations = []
    for d in donations.find().sort("_id", -1):
        d["_id"] = str(d["_id"])
        all_donations.append(d)

    return jsonify({
        "status": "success",
        "data": all_donations
    })