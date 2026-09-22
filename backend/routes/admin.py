from flask import Blueprint, jsonify, request, send_file, Response
from database import donations, users, admin_activity
import sys, os, mimetypes
from datetime import datetime
from bson.objectid import ObjectId
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

    pending_query = {"$or": [{"verification_status": "Pending"}, {"status": "Pending"}, {"status": "Pending Approval"}]}
    pending_verifications = users.count_documents(pending_query)
    approved_users = users.count_documents({"$or": [{"verification_status": "Approved"}, {"status": "Approved"}]})
    rejected_users = users.count_documents({"$or": [{"verification_status": "Rejected"}, {"status": "Rejected"}]})

    # Role specific verification breakdown
    donor_pending = users.count_documents({"role": "donor", **pending_query})
    donor_approved = users.count_documents({"role": "donor", "$or": [{"verification_status": "Approved"}, {"status": "Approved"}]})
    donor_rejected = users.count_documents({"role": "donor", "$or": [{"verification_status": "Rejected"}, {"status": "Rejected"}]})

    ngo_pending = users.count_documents({"role": "ngo", **pending_query})
    ngo_approved = users.count_documents({"role": "ngo", "$or": [{"verification_status": "Approved"}, {"status": "Approved"}]})
    ngo_rejected = users.count_documents({"role": "ngo", "$or": [{"verification_status": "Rejected"}, {"status": "Rejected"}]})

    volunteer_pending = users.count_documents({"role": "volunteer", **pending_query})
    volunteer_approved = users.count_documents({"role": "volunteer", "$or": [{"verification_status": "Approved"}, {"status": "Approved"}]})
    volunteer_rejected = users.count_documents({"role": "volunteer", "$or": [{"verification_status": "Rejected"}, {"status": "Rejected"}]})

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
    for u in users.find(pending_query).sort("_id", -1).limit(10):
        pending_users_list.append({
            "id": str(u["_id"]),
            "name": u.get("name"),
            "email": u.get("email"),
            "role": u.get("role"),
            "status": u.get("verification_status") or u.get("status", "Pending"),
            "verification_status": u.get("verification_status") or u.get("status", "Pending"),
            "document_type": u.get("document_type", ""),
            "document_filename": u.get("document_filename", ""),
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
        user_ver_status = user.get("verification_status") or user.get("status", "Approved")
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
            "status": user_ver_status,
            "verification_status": user_ver_status,
            "email_verified": user.get("email_verified", True),
            "admin_approved": user.get("admin_approved", user_ver_status == "Approved"),
            "account_status": user.get("account_status", "active" if user_ver_status == "Approved" else ("inactive" if user_ver_status == "Rejected" else "pending")),
            "registration_date": user.get("registration_date", user.get("created_at", "N/A")),
            "created_at": user.get("created_at", user.get("registration_date", "N/A")),
            "approved_at": user.get("approved_at", user.get("verified_at", "")),
            "approved_by": user.get("approved_by", user.get("verified_by", "")),
            "rejected_at": user.get("rejected_at", user.get("verified_at", "")),
            "rejected_by": user.get("rejected_by", user.get("verified_by", "")),
            "verified_at": user.get("verified_at", ""),
            "verified_by": user.get("verified_by", ""),
            "vehicle": user.get("vehicle", ""),
            "ngo_name": user.get("ngo_name", ""),
            "registration_number": user.get("registration_number", ""),
            "donor_type": user.get("donor_type", ""),
            "document_type": user.get("document_type", ""),
            "document_filename": user.get("document_filename", ""),
            "document_path": user.get("document_path", ""),
            "document_uploaded_at": user.get("document_uploaded_at", ""),
            "document_image": user.get("document_path") or user.get("document_image", "")
        })
    return jsonify({
        "status": "success",
        "data": all_users
    })

@admin.route("/admin/pending-users", methods=["GET"])
def get_pending_users():
    is_authorized, auth_err = authorize_role(["admin"])
    if not is_authorized:
        return auth_err

    pending_query = {"$or": [{"verification_status": "Pending"}, {"status": "Pending"}, {"status": "Pending Approval"}]}
    pending_list = []
    for u in users.find(pending_query).sort("_id", -1):
        ver_status = u.get("verification_status") or u.get("status", "Pending")
        pending_list.append({
            "id": str(u["_id"]),
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "role": u.get("role", ""),
            "phone": u.get("phone", ""),
            "registration_date": u.get("registration_date", u.get("created_at", "")),
            "status": ver_status,
            "verification_status": ver_status,
            "document_type": u.get("document_type", "Verification Document"),
            "document_filename": u.get("document_filename", "document.pdf"),
            "document_path": u.get("document_path", u.get("document_image", "")),
            "document_uploaded_at": u.get("document_uploaded_at", "")
        })

    return jsonify({
        "status": "success",
        "data": pending_list
    })

@admin.route("/admin/user/<user_identifier>/document", methods=["GET"])
@admin.route("/admin/user/document/<user_identifier>", methods=["GET"])
def get_user_document(user_identifier):
    is_authorized, auth_err = authorize_role(["admin"])
    if not is_authorized:
        return auth_err

    user = None
    if ObjectId.is_valid(user_identifier):
        user = users.find_one({"_id": ObjectId(user_identifier)})
    if not user:
        user = users.find_one({"email": user_identifier})

    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    doc_path = user.get("document_path") or user.get("document_image")
    if not doc_path:
        return jsonify({"status": "error", "message": "No verification document uploaded for this user"}), 404

    if doc_path.startswith("data:"):
        import base64
        try:
            header, encoded = doc_path.split(",", 1)
            mime_type = header.split(";")[0].replace("data:", "")
            data = base64.b64decode(encoded)
            return Response(data, mimetype=mime_type)
        except Exception:
            return jsonify({"status": "error", "message": "Invalid base64 document encoding"}), 400

    rel_path = doc_path.replace("\\", "/")
    if rel_path.startswith("uploads/"):
        abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', rel_path))
    else:
        abs_path = os.path.abspath(rel_path)

    if not os.path.exists(abs_path):
        doc_name = os.path.basename(rel_path)
        fallback_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads', 'documents', doc_name))
        if os.path.exists(fallback_path):
            abs_path = fallback_path
        else:
            return jsonify({"status": "error", "message": f"Document file not found: {doc_name}"}), 404

    mime_type, _ = mimetypes.guess_type(abs_path)
    if not mime_type:
        if abs_path.endswith(".pdf"):
            mime_type = "application/pdf"
        elif abs_path.endswith(".png"):
            mime_type = "image/png"
        elif abs_path.endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
        else:
            mime_type = "application/octet-stream"

    return send_file(
        abs_path,
        mimetype=mime_type,
        as_attachment=False,
        download_name=user.get("document_filename") or os.path.basename(abs_path)
    )

def process_user_verification(email, status):
    target_user = users.find_one({"email": email})
    if not target_user:
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    admin_email = request.headers.get("X-User-Email") or "admin.demo@foodbridge.test"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    is_approved = (status == "Approved")
    update_doc = {
        "status": status,
        "verification_status": status,
        "account_status": "active" if is_approved else "inactive",
        "admin_approved": is_approved,
        "verified_at": now_str,
        "verified_by": admin_email
    }

    if is_approved:
        update_doc["approved_at"] = now_str
        update_doc["approved_by"] = admin_email
    else:
        update_doc["rejected_at"] = now_str
        update_doc["rejected_by"] = admin_email

    users.update_one({"email": email}, {"$set": update_doc})

    # Record audit log
    admin_activity.insert_one({
        "user_name": target_user.get("name", "User"),
        "user_email": email,
        "user_role": target_user.get("role", "user"),
        "action": f"{status}",
        "status": status,
        "admin_email": admin_email,
        "timestamp": now_str
    })

    msg = "User verified successfully." if is_approved else "User registration rejected."
    return jsonify({
        "status": "success",
        "message": msg
    })

@admin.route("/admin/user/<user_identifier>/approve", methods=["PUT", "POST"])
def approve_user_endpoint(user_identifier):
    is_authorized, auth_err = authorize_role(["admin"])
    if not is_authorized:
        return auth_err

    user = None
    if ObjectId.is_valid(user_identifier):
        user = users.find_one({"_id": ObjectId(user_identifier)})
    if not user:
        user = users.find_one({"email": user_identifier})

    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    return process_user_verification(user["email"], "Approved")

@admin.route("/admin/user/<user_identifier>/reject", methods=["PUT", "POST"])
def reject_user_endpoint(user_identifier):
    is_authorized, auth_err = authorize_role(["admin"])
    if not is_authorized:
        return auth_err

    user = None
    if ObjectId.is_valid(user_identifier):
        user = users.find_one({"_id": ObjectId(user_identifier)})
    if not user:
        user = users.find_one({"email": user_identifier})

    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    return process_user_verification(user["email"], "Rejected")

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

    if not email or not status:
        return jsonify({
            "status": "error",
            "message": "Email and status are required."
        }), 400

    return process_user_verification(email, status)

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