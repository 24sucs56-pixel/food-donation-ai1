import os
from pymongo import MongoClient
import bcrypt

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)

db = client["smart_food_donation_ai"]

users = db["users"]

donations = db["donations"]

admin_activity = db["admin_activity"]

from datetime import datetime

def ensure_demo_users():
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    demo_accounts = [
        {
            "name": "Demo Donor",
            "email": "donor.demo@foodbridge.test",
            "password_plain": "Donor@12345",
            "role": "donor",
            "donor_type": "Individual",
            "phone": "9999999901",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "123 Demo Street, Madurai",
            "status": "Pending",
            "verification_status": "Pending",
            "email_verified": True,
            "admin_approved": False,
            "account_status": "pending",
            "document_type": "Food Certificate",
            "document_filename": "demo_food_certificate.pdf",
            "document_path": "uploads/documents/demo_food_certificate.pdf",
            "document_uploaded_at": now_str,
            "created_at": now_str,
            "registration_date": now_str,
            "is_demo": True,
            "points": 100
        },
        {
            "name": "Demo NGO",
            "email": "ngo.demo@foodbridge.test",
            "password_plain": "Ngo@12345",
            "role": "ngo",
            "ngo_name": "Demo NGO Trust",
            "registration_number": "NGO-DEMO-123",
            "phone": "9999999902",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "456 NGO Avenue, Madurai",
            "status": "Pending",
            "verification_status": "Pending",
            "email_verified": True,
            "admin_approved": False,
            "account_status": "pending",
            "document_type": "NGO Certificate",
            "document_filename": "demo_ngo_certificate.pdf",
            "document_path": "uploads/documents/demo_ngo_certificate.pdf",
            "document_uploaded_at": now_str,
            "created_at": now_str,
            "registration_date": now_str,
            "is_demo": True,
            "points": 100
        },
        {
            "name": "Demo Volunteer",
            "email": "volunteer.demo@foodbridge.test",
            "password_plain": "Volunteer@12345",
            "role": "volunteer",
            "vehicle": "Two Wheeler",
            "phone": "9999999903",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "789 Volunteer Road, Madurai",
            "status": "Pending",
            "verification_status": "Pending",
            "email_verified": True,
            "admin_approved": False,
            "account_status": "pending",
            "document_type": "Aadhaar / Vehicle License",
            "document_filename": "demo_volunteer_license.pdf",
            "document_path": "uploads/documents/demo_volunteer_license.pdf",
            "document_uploaded_at": now_str,
            "created_at": now_str,
            "registration_date": now_str,
            "is_demo": True,
            "points": 100
        },
        {
            "name": "Demo Admin",
            "email": "admin.demo@foodbridge.test",
            "password_plain": "Admin@12345",
            "role": "admin",
            "phone": "9999999904",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "1 Admin Plaza, Madurai",
            "status": "Approved",
            "verification_status": "Approved",
            "email_verified": True,
            "admin_approved": True,
            "account_status": "active",
            "created_at": now_str,
            "registration_date": now_str,
            "is_demo": True,
            "points": 1000
        }
    ]

    try:
        for acc in demo_accounts:
            existing = users.find_one({"email": acc["email"]})
            hashed_pwd = bcrypt.hashpw(acc["password_plain"].encode("utf-8"), bcrypt.gensalt())
            
            user_doc = {
                "name": acc["name"],
                "email": acc["email"],
                "password": hashed_pwd,
                "role": acc["role"],
                "phone": acc["phone"],
                "state": acc["state"],
                "district": acc["district"],
                "city": acc["city"],
                "pincode": acc["pincode"],
                "address": acc["address"],
                "status": acc["status"],
                "verification_status": acc["verification_status"],
                "email_verified": acc["email_verified"],
                "admin_approved": acc["admin_approved"],
                "account_status": acc["account_status"],
                "is_demo": True,
                "points": acc["points"],
                "created_at": acc.get("created_at", now_str),
                "registration_date": acc.get("registration_date", now_str)
            }
            if "donor_type" in acc: user_doc["donor_type"] = acc["donor_type"]
            if "ngo_name" in acc: user_doc["ngo_name"] = acc["ngo_name"]
            if "registration_number" in acc: user_doc["registration_number"] = acc["registration_number"]
            if "vehicle" in acc: user_doc["vehicle"] = acc["vehicle"]
            if "document_type" in acc: user_doc["document_type"] = acc["document_type"]
            if "document_filename" in acc: user_doc["document_filename"] = acc["document_filename"]
            if "document_path" in acc: user_doc["document_path"] = acc["document_path"]
            if "document_uploaded_at" in acc: user_doc["document_uploaded_at"] = acc["document_uploaded_at"]

            if existing:
                users.update_one({"email": acc["email"]}, {"$set": user_doc})
            else:
                users.insert_one(user_doc)
        print("Demo users seeded/verified in MongoDB successfully.")
    except Exception as e:
        print("Error seeding demo users in database:", e)

# Run seeding on database import
ensure_demo_users()