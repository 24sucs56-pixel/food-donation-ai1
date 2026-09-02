import os
import bcrypt
from pymongo import MongoClient
from datetime import datetime, timedelta

def seed():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["smart_food_donation_ai"]
    
    print("Connecting to MongoDB at mongodb://localhost:27017/ ...")
    print("Database: smart_food_donation_ai")
    
    # ----------------------------------------------------
    # 1. POPULATE USERS COLLECTION
    # ----------------------------------------------------
    db.users.drop()
    
    # Common password: password123
    hashed_pwd = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt())
    
    users_list = [
        # === DONORS: Restaurants, Caterers, Supermarkets & Individuals ===
        {
            "name": "Murugan Idli Shop",
            "email": "murugan.idlishop.madurai@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Restaurant",
            "phone": "9842145671",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "194 West Masi Street, Madurai Central",
            "status": "Approved",
            "points": 580,
            "created_at": (datetime.now() - timedelta(days=45)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Kumar Mess & Catering",
            "email": "kumar.mess.madurai@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Restaurant",
            "phone": "9843212345",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "12/A 80 Feet Road, KK Nagar, Madurai",
            "status": "Approved",
            "points": 490,
            "created_at": (datetime.now() - timedelta(days=38)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Sree Sabarees Veg Restaurant",
            "email": "sreesabarees.mdu@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Restaurant",
            "phone": "9443355667",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "Opposite Railway Junction, Town Hall Road, Madurai",
            "status": "Approved",
            "points": 620,
            "created_at": (datetime.now() - timedelta(days=30)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Annapoorna Royal Caterers",
            "email": "annapoorna.caterers.mdu@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Catering Service",
            "phone": "9788112233",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "45 Lake View Road, K.Pudur, Madurai",
            "status": "Approved",
            "points": 740,
            "created_at": (datetime.now() - timedelta(days=28)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Amma Non-Veg Mess",
            "email": "ammamess.madurai@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Restaurant",
            "phone": "9894455112",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "Alagar Kovil Road, Tallakulam, Madurai",
            "status": "Approved",
            "points": 380,
            "created_at": (datetime.now() - timedelta(days=25)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "The Gateway Hotel Pasumalai",
            "email": "gateway.pasumalai.banquets@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Restaurant",
            "phone": "9944012399",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625004",
            "address": "Pasumalai Hills, Madurai",
            "status": "Approved",
            "points": 810,
            "created_at": (datetime.now() - timedelta(days=20)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Modern Supermarket & Fresh Bakery",
            "email": "modern.supermarket.mdu@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Supermarket",
            "phone": "9790011224",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "Melur Main Road, Mattuthavani, Madurai",
            "status": "Approved",
            "points": 350,
            "created_at": (datetime.now() - timedelta(days=18)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Sri Krishna Sweets & Bakery",
            "email": "srikrishna.sweets.mdu@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Bakery",
            "phone": "9842188990",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "South Veli Street, Madurai",
            "status": "Approved",
            "points": 420,
            "created_at": (datetime.now() - timedelta(days=15)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Iyengar Bakery & Sweets",
            "email": "iyengar.bakery.tallakulam@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Bakery",
            "phone": "9843377112",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "Gokhale Road, Chinna Chokkikulam, Madurai",
            "status": "Approved",
            "points": 290,
            "created_at": (datetime.now() - timedelta(days=12)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Rohan Sharma",
            "email": "rohan.sharma.donor@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Individual",
            "phone": "9876543210",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "Plot 14, Anna Nagar, Madurai",
            "status": "Approved",
            "points": 210,
            "created_at": (datetime.now() - timedelta(days=40)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Priya Patel",
            "email": "priya.patel95@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Individual",
            "phone": "9842011998",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "Flat 3B, Green Meadows, Tallakulam, Madurai",
            "status": "Approved",
            "points": 180,
            "created_at": (datetime.now() - timedelta(days=32)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Aarav Mehta",
            "email": "aarav.mehta.donations@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Individual",
            "phone": "9943211887",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "88 KK Nagar Main Avenue, Madurai",
            "status": "Approved",
            "points": 240,
            "created_at": (datetime.now() - timedelta(days=26)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Grand Mahal Wedding Hall",
            "email": "grandmahal.events.mdu@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Event Organizer",
            "phone": "9842512390",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625016",
            "address": "Bypass Road, Ponmeni, Madurai",
            "status": "Pending Approval",
            "points": 0,
            "created_at": (datetime.now() - timedelta(days=2)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Ananya Sundaram",
            "email": "ananya.sundaram.donor@gmail.com",
            "password": hashed_pwd,
            "role": "donor",
            "donor_type": "Individual",
            "phone": "9443299881",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625003",
            "address": "45 North Chitrai Street, Simmakkal, Madurai",
            "status": "Approved",
            "points": 130,
            "created_at": (datetime.now() - timedelta(days=10)).strftime("%d-%m-%Y %I:%M %p")
        },

        # === NGOs: Registered & Verified Trusts ===
        {
            "name": "Helping Hands NGO",
            "email": "contact@helpinghandsngo.org",
            "password": hashed_pwd,
            "role": "ngo",
            "ngo_name": "Helping Hands Social Welfare Trust",
            "registration_number": "TN/2019/0089211",
            "phone": "9842100112",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "15 VOC Street, KK Nagar, Madurai",
            "status": "Approved",
            "points": 1450,
            "created_at": (datetime.now() - timedelta(days=60)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Food Care Trust",
            "email": "info@foodcaretrust.org",
            "password": hashed_pwd,
            "role": "ngo",
            "ngo_name": "Food Care Charitable Trust",
            "registration_number": "TN/2020/0045618",
            "phone": "9843211990",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "77 Kuruvikaran Salai, Anna Nagar, Madurai",
            "status": "Approved",
            "points": 1320,
            "created_at": (datetime.now() - timedelta(days=55)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Hope Foundation",
            "email": "support@hopefoundation.org",
            "password": hashed_pwd,
            "role": "ngo",
            "ngo_name": "Hope Foundation for Children & Elderly",
            "registration_number": "TN/2018/0012390",
            "phone": "9443311880",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "24 Lady Doak College Road, Tallakulam, Madurai",
            "status": "Approved",
            "points": 1680,
            "created_at": (datetime.now() - timedelta(days=50)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Smile Charity",
            "email": "admin@smilecharity.org",
            "password": hashed_pwd,
            "role": "ngo",
            "ngo_name": "Smile Relief & Welfare Charity",
            "registration_number": "TN/2021/0078123",
            "phone": "9894411220",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "18 Palam Station Road, Goripalayam, Madurai",
            "status": "Approved",
            "points": 1150,
            "created_at": (datetime.now() - timedelta(days=45)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Akshaya Trust Madurai",
            "email": "contact@akshayatrustmadurai.org",
            "password": hashed_pwd,
            "role": "ngo",
            "ngo_name": "Akshaya Feeding & Rehabilitation Trust",
            "registration_number": "TN/2017/0034119",
            "phone": "9842188440",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "56 North Veli Street, Simmakkal, Madurai",
            "status": "Approved",
            "points": 1890,
            "created_at": (datetime.now() - timedelta(days=42)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Anbagam Children Home",
            "email": "care@anbagamhome.org",
            "password": hashed_pwd,
            "role": "ngo",
            "ngo_name": "Anbagam Orphanage & Relief Society",
            "registration_number": "TN/2020/0091882",
            "phone": "9443211556",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "12 Ahimsapuram 4th Street, Sellur, Madurai",
            "status": "Approved",
            "points": 980,
            "created_at": (datetime.now() - timedelta(days=35)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Pasumai Food Relief Trust",
            "email": "pasumairelief@gmail.com",
            "password": hashed_pwd,
            "role": "ngo",
            "ngo_name": "Pasumai Green Food Support Trust",
            "registration_number": "TN/2022/0065128",
            "phone": "9790112233",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625007",
            "address": "40 Villapuram Housing Board, Madurai",
            "status": "Approved",
            "points": 820,
            "created_at": (datetime.now() - timedelta(days=22)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Mother Teresa Welfare Trust",
            "email": "motherteresa.trust.mdu@gmail.com",
            "password": hashed_pwd,
            "role": "ngo",
            "ngo_name": "Mother Teresa Destitute Care Trust",
            "registration_number": "TN/2023/0011452",
            "phone": "9842511009",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625009",
            "address": "88 Teppakulam South Bank, Madurai",
            "status": "Pending Approval",
            "points": 0,
            "created_at": (datetime.now() - timedelta(days=3)).strftime("%d-%m-%Y %I:%M %p")
        },

        # === VOLUNTEERS: Dedicated Delivery Heroes ===
        {
            "name": "Vikas Dubey",
            "email": "vikas.dubey99@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Bike",
            "phone": "9842199882",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "Plot 28, Sector 4, KK Nagar, Madurai",
            "status": "Approved",
            "points": 640,
            "created_at": (datetime.now() - timedelta(days=40)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Ramesh Kumar",
            "email": "ramesh.kumar84@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Van",
            "phone": "9843211550",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "14 Simmakkal North Street, Madurai",
            "status": "Approved",
            "points": 820,
            "created_at": (datetime.now() - timedelta(days=38)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Suresh Raina",
            "email": "suresh.raina.v@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Car",
            "phone": "9943211009",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "52 Tallakulam Main Road, Madurai",
            "status": "Approved",
            "points": 580,
            "created_at": (datetime.now() - timedelta(days=35)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Karthik Raja",
            "email": "karthik.raja.dev@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Electric Scooter",
            "phone": "9790144556",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625002",
            "address": "33 Sellur 50 Feet Road, Madurai",
            "status": "Approved",
            "points": 710,
            "created_at": (datetime.now() - timedelta(days=30)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Dinesh Karthik",
            "email": "dinesh.karthik.vol@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Bike",
            "phone": "9842011883",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625007",
            "address": "66 Villapuram Main Road, Madurai",
            "status": "Approved",
            "points": 490,
            "created_at": (datetime.now() - timedelta(days=25)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Kiran Bedi",
            "email": "kiran.bedi.vol@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Car",
            "phone": "9843322119",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625009",
            "address": "19 Teppakulam West Street, Madurai",
            "status": "Approved",
            "points": 530,
            "created_at": (datetime.now() - timedelta(days=20)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Meera Krishnan",
            "email": "meera.krishnan.volunteer@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Bike",
            "phone": "9443512390",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625006",
            "address": "12 Pasumalai Bypass, Madurai",
            "status": "Approved",
            "points": 410,
            "created_at": (datetime.now() - timedelta(days=18)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Sanjay Subramanian",
            "email": "sanjay.subramanian.vol@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Van",
            "phone": "9894411995",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625007",
            "address": "88 Mattuthavani Bus Stand Colony, Madurai",
            "status": "Approved",
            "points": 670,
            "created_at": (datetime.now() - timedelta(days=15)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Pooja Ramachandran",
            "email": "pooja.ramachandran.v@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Electric Scooter",
            "phone": "9790223344",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625020",
            "address": "40 Lake View Road, KK Nagar, Madurai",
            "status": "Approved",
            "points": 390,
            "created_at": (datetime.now() - timedelta(days=10)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Naveen Pandian",
            "email": "naveen.pandian.vol@gmail.com",
            "password": hashed_pwd,
            "role": "volunteer",
            "vehicle": "Bike",
            "phone": "9842511228",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625016",
            "address": "Kalavasal Main Road, Madurai",
            "status": "Pending Approval",
            "points": 0,
            "created_at": (datetime.now() - timedelta(days=1)).strftime("%d-%m-%Y %I:%M %p")
        },

        # === SYSTEM ADMINS ===
        {
            "name": "System Administrator",
            "email": "admin@smartfooddonation.org",
            "password": hashed_pwd,
            "role": "admin",
            "phone": "9999988888",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "Central Admin Headquarters, Madurai",
            "status": "Approved",
            "points": 10000,
            "created_at": (datetime.now() - timedelta(days=100)).strftime("%d-%m-%Y %I:%M %p")
        },
        {
            "name": "Super Admin",
            "email": "admin@gmail.com",
            "password": hashed_pwd,
            "role": "admin",
            "phone": "9876543210",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "city": "Madurai",
            "pincode": "625001",
            "address": "Smart Food Donation AI HQ, Madurai",
            "status": "Approved",
            "points": 10000,
            "created_at": (datetime.now() - timedelta(days=100)).strftime("%d-%m-%Y %I:%M %p")
        }
    ]
    
    db.users.insert_many(users_list)
    print(f"-> Successfully inserted {len(users_list)} users into 'users' collection (all default passwords: 'password123')")

    # ----------------------------------------------------
    # 2. POPULATE DONATIONS COLLECTION
    # ----------------------------------------------------
    db.donations.drop()
    
    donations_list = []
    
    donor_map = [
        ("Murugan Idli Shop", "murugan.idlishop.madurai@gmail.com", "194 West Masi Street, Madurai Central", 9.9195, 78.1180),
        ("Kumar Mess & Catering", "kumar.mess.madurai@gmail.com", "12/A 80 Feet Road, KK Nagar, Madurai", 9.9270, 78.1450),
        ("Sree Sabarees Veg Restaurant", "sreesabarees.mdu@gmail.com", "Town Hall Road, Junction, Madurai", 9.9180, 78.1130),
        ("Annapoorna Royal Caterers", "annapoorna.caterers.mdu@gmail.com", "45 Lake View Road, K.Pudur, Madurai", 9.9450, 78.1520),
        ("Amma Non-Veg Mess", "ammamess.madurai@gmail.com", "Alagar Kovil Road, Tallakulam, Madurai", 9.9320, 78.1320),
        ("The Gateway Hotel Pasumalai", "gateway.pasumalai.banquets@gmail.com", "Pasumalai Hills, Madurai", 9.8980, 78.0890),
        ("Modern Supermarket & Fresh Bakery", "modern.supermarket.mdu@gmail.com", "Melur Main Road, Mattuthavani, Madurai", 9.9490, 78.1580),
        ("Sri Krishna Sweets & Bakery", "srikrishna.sweets.mdu@gmail.com", "South Veli Street, Madurai", 9.9140, 78.1220),
        ("Iyengar Bakery & Sweets", "iyengar.bakery.tallakulam@gmail.com", "Gokhale Road, Chinna Chokkikulam, Madurai", 9.9340, 78.1360),
        ("Rohan Sharma", "rohan.sharma.donor@gmail.com", "Plot 14, Anna Nagar, Madurai", 9.9230, 78.1410),
        ("Priya Patel", "priya.patel95@gmail.com", "Flat 3B, Green Meadows, Tallakulam, Madurai", 9.9310, 78.1330),
        ("Aarav Mehta", "aarav.mehta.donations@gmail.com", "88 KK Nagar Main Avenue, Madurai", 9.9260, 78.1470)
    ]
    
    ngos = [
        "Helping Hands NGO",
        "Food Care Trust",
        "Hope Foundation",
        "Smile Charity",
        "Akshaya Trust Madurai",
        "Anbagam Children Home",
        "Pasumai Food Relief Trust"
    ]
    
    # --- SECTION A: WAITING DONATIONS (Available on NGO Dashboard to accept) ---
    waiting_raw = [
        ("Traditional South Indian Sambar Rice & Potato Poriyal", "Veg", 45, "Hot Insulated Container", 96, "Safe", "Freshly cooked hot meal. Safe for immediate distribution.", "Low"),
        ("Chettinad Chicken Biryani with Boiled Eggs", "Non-Veg", 60, "Hot Insulated Container", 95, "Safe", "Freshly cooked biryani. Distribute within 4 hours.", "Low"),
        ("Fresh Paneer Butter Masala & 50 Phulkas", "Veg", 35, "Hot Insulated Container", 94, "Safe", "High nutritional value. Distribute immediately.", "Low"),
        ("Assorted Whole Wheat Bread Loaves & Bun Packs", "Bakery", 40, "Dry Storage", 98, "Safe", "Packaged bakery items. Safe for 24+ hours.", "Low"),
        ("Seasonal Pomegranate, Apple & Guava Baskets", "Fruits", 30, "Room Temperature", 95, "Safe", "Fresh fruits washed and sorted.", "Low"),
        ("Mutton Dum Biryani with Onion Raita", "Non-Veg", 50, "Hot Insulated Container", 92, "Safe", "Excellent quality. Immediate distribution recommended.", "Low"),
        ("Hot Ghee Pongal, Medu Vada & Coconut Chutney", "Veg", 30, "Hot Insulated Container", 90, "Safe", "Breakfast meal packed safely in hygienic containers.", "Low"),
        ("Egg Fried Rice & Veg Manchurian", "Non-Veg", 25, "Hot Insulated Container", 88, "Safe", "Prepared 1 hour ago. Safe for distribution.", "Low"),
        ("Fresh Cream Cakes & Pineapple Pastries", "Bakery", 20, "Refrigerated", 85, "Good", "Keep refrigerated until distribution.", "Medium"),
        ("Mixed Vegetable Pulao & Cucumber Pachadi", "Veg", 40, "Hot Insulated Container", 93, "Safe", "High quality lunch meal.", "Low"),
        ("Chicken Shawarma Rolls & French Fries", "Non-Veg", 25, "Hot Insulated Container", 86, "Safe", "Ready to serve food boxes.", "Low"),
        ("Banana & Orange Mixed Fruit Crates", "Fruits", 35, "Room Temperature", 92, "Safe", "Freshly sourced fruits.", "Low"),
        ("Curd Rice with Mango Pickle (Surplus from Wedding)", "Veg", 50, "Refrigerated", 65, "Average", "Best consumed within 2 hours. Keep cool.", "Medium"),
        ("Overripe Banana Bunches (About to spoil)", "Fruits", 15, "Room Temperature", 30, "Unsafe", "Quality degraded. Not recommended for children.", "Critical"),
        ("Curry Leaves Rice (Cooked yesterday night)", "Veg", 20, "Room Temperature", 15, "Expired", "Food exceeds safe storage limit. Do not distribute.", "Critical")
    ]
    
    for idx, item in enumerate(waiting_raw):
        food, cat, qty, storage, fresh, ai_res, rec, pri = item
        d_name, d_email, d_addr, d_lat, d_lng = donor_map[idx % len(donor_map)]
        
        lat = round(d_lat + (idx * 0.0012) - 0.002, 5)
        lng = round(d_lng - (idx * 0.0011) + 0.002, 5)
        
        created_time = datetime.now() - timedelta(minutes=(idx * 18 + 15))
        
        donations_list.append({
            "food_name": food,
            "category": cat,
            "quantity": qty,
            "prepared_time": (created_time - timedelta(hours=1)).strftime("%I:%M %p"),
            "storage": storage,
            "expiry": (created_time + timedelta(hours=4)).strftime("%I:%M %p"),
            "address": d_addr,
            "latitude": lat,
            "longitude": lng,
            "donor_email": d_email,
            "freshness": fresh,
            "ai_result": ai_res,
            "recommendation": rec,
            "priority": pri,
            "recommended_ngo": ngos[idx % len(ngos)],
            "distance": f"{round(0.8 + (idx * 0.35) % 4.5, 1)} km",
            "status": "Waiting",
            "ngo": "",
            "volunteer": "",
            "created_at": created_time.strftime("%d-%m-%Y %I:%M %p"),
            "accepted_at": "",
            "picked_at": "",
            "delivered_at": ""
        })

    # --- SECTION B: ACCEPTED DONATIONS (NGO Accepted, waiting for volunteer pickup) ---
    accepted_raw = [
        ("Veg Meals Box (Rice, Sambar, Kootu, Appalam)", "Veg", 50, "Helping Hands NGO", 96),
        ("Thalappakatti Style Mutton Biryani", "Non-Veg", 40, "Food Care Trust", 94),
        ("Chapati with Mixed Veg Kurma & Salad", "Veg", 30, "Hope Foundation", 95),
        ("Fresh Butter Buns & Sweet Rolls", "Bakery", 45, "Smile Charity", 97),
        ("Watermelon & Musk Melon Slices Container", "Fruits", 25, "Akshaya Trust Madurai", 93),
        ("Vegetable Hakka Noodles & Gobi 65", "Veg", 35, "Anbagam Children Home", 91),
        ("Chicken Pepper Masala with Phulkas", "Non-Veg", 30, "Helping Hands NGO", 90),
        ("Kashmiri Apple Boxes (Direct from wholesaler)", "Fruits", 30, "Pasumai Food Relief Trust", 98),
        ("Mini Sambar Idlis with Chutney Packets", "Veg", 60, "Food Care Trust", 95),
        ("Egg Curry & Jeera Rice Combo", "Non-Veg", 35, "Hope Foundation", 92),
        ("Rava Kesari & Medu Pakoda Sweet Box", "Veg", 40, "Smile Charity", 94),
        ("Whole Wheat Pav Buns & Veg Bhaji", "Veg", 25, "Akshaya Trust Madurai", 89),
        ("Fish Curry & White Rice", "Non-Veg", 20, "Helping Hands NGO", 88),
        ("Garlic Bread Loaves & Rusks", "Bakery", 30, "Food Care Trust", 96),
        ("Papaya & Guava Fruit Salad", "Fruits", 20, "Hope Foundation", 87),
        ("Mushroom Biryani with Onion Raita", "Veg", 35, "Anbagam Children Home", 93),
        ("Tandoori Roti & Dal Makhani", "Veg", 40, "Smile Charity", 91),
        ("Chicken Fried Rice & Chilli Sauce", "Non-Veg", 25, "Akshaya Trust Madurai", 89),
        ("Veg Cutlets & Sandwiches", "Bakery", 30, "Pasumai Food Relief Trust", 92),
        ("Lemon Rice & Roasted Peanuts", "Veg", 35, "Helping Hands NGO", 90)
    ]
    
    for idx, item in enumerate(accepted_raw):
        food, cat, qty, ngo_target, fresh = item
        d_name, d_email, d_addr, d_lat, d_lng = donor_map[(idx + 2) % len(donor_map)]
        
        lat = round(d_lat + (idx * 0.0014) - 0.0015, 5)
        lng = round(d_lng - (idx * 0.0013) + 0.0025, 5)
        
        created_time = datetime.now() - timedelta(hours=idx % 5 + 2, minutes=idx * 7)
        accepted_time = created_time + timedelta(minutes=15)
        
        donations_list.append({
            "food_name": food,
            "category": cat,
            "quantity": qty,
            "prepared_time": (created_time - timedelta(hours=1)).strftime("%I:%M %p"),
            "storage": "Hot Insulated Container" if cat in ["Veg", "Non-Veg"] else "Room Temperature",
            "expiry": (created_time + timedelta(hours=5)).strftime("%I:%M %p"),
            "address": d_addr,
            "latitude": lat,
            "longitude": lng,
            "donor_email": d_email,
            "freshness": fresh,
            "ai_result": "Safe" if fresh >= 90 else "Good",
            "recommendation": "Accepted by NGO. Awaiting volunteer pickup assignment.",
            "priority": "Low" if fresh >= 90 else "Medium",
            "recommended_ngo": ngo_target,
            "distance": f"{round(1.2 + (idx * 0.2) % 3.8, 1)} km",
            "status": "Accepted",
            "ngo": ngo_target,
            "volunteer": "",
            "created_at": created_time.strftime("%d-%m-%Y %I:%M %p"),
            "accepted_at": accepted_time.strftime("%d-%m-%Y %I:%M %p"),
            "picked_at": "",
            "delivered_at": ""
        })

    # --- SECTION C: PICKED DONATIONS (Volunteer has collected, in transit) ---
    picked_raw = [
        ("Grand Wedding Feast Surplus - Veg Pulao & Paneer", "Veg", 80, "Helping Hands NGO", "Vikas Dubey", 96),
        ("Hyderabadi Chicken Dum Biryani", "Non-Veg", 50, "Food Care Trust", "Ramesh Kumar", 95),
        ("Kothu Parotta with Veg Kurma", "Veg", 35, "Hope Foundation", "Suresh Raina", 92),
        ("Chocolate Cream Cake & Doughnuts Box", "Bakery", 40, "Smile Charity", "Karthik Raja", 97),
        ("Fresh Alphonso Mango Crates", "Fruits", 30, "Akshaya Trust Madurai", "Dinesh Karthik", 94),
        ("Curd Rice, Pickle & Sundal Combo", "Veg", 45, "Anbagam Children Home", "Kiran Bedi", 91),
        ("Egg Biryani & Brinjal Gravy", "Non-Veg", 30, "Pasumai Food Relief Trust", "Meera Krishnan", 93),
        ("Whole Wheat Burger Buns & Cookies", "Bakery", 50, "Helping Hands NGO", "Sanjay Subramanian", 98),
        ("Mixed Sprouts Salad & Cucumber Slices", "Veg", 25, "Food Care Trust", "Pooja Ramachandran", 95),
        ("Chicken 65 & Veg Fried Rice", "Non-Veg", 35, "Hope Foundation", "Vikas Dubey", 90),
        ("Ghee Sambar Rice with Potato Chips", "Veg", 40, "Smile Charity", "Ramesh Kumar", 94),
        ("Sweet Corn & Cheese Sandwiches", "Bakery", 30, "Akshaya Trust Madurai", "Suresh Raina", 92),
        ("Green & Black Grapes Bowls", "Fruits", 20, "Anbagam Children Home", "Karthik Raja", 91),
        ("Tomato Rice with Appalam", "Veg", 35, "Helping Hands NGO", "Dinesh Karthik", 89),
        ("Mutton Chukka with Kal Dosa", "Non-Veg", 25, "Food Care Trust", "Meera Krishnan", 93),
        ("Sweet Bread & Jam Rolls", "Bakery", 40, "Hope Foundation", "Pooja Ramachandran", 96),
        ("Pineapple Juice & Fruit Bowls", "Fruits", 25, "Smile Charity", "Kiran Bedi", 92),
        ("Channa Masala & Jeera Rice", "Veg", 30, "Akshaya Trust Madurai", "Sanjay Subramanian", 94)
    ]
    
    for idx, item in enumerate(picked_raw):
        food, cat, qty, ngo_target, vol_target, fresh = item
        d_name, d_email, d_addr, d_lat, d_lng = donor_map[(idx + 4) % len(donor_map)]
        
        lat = round(d_lat + (idx * 0.0011) - 0.002, 5)
        lng = round(d_lng - (idx * 0.0015) + 0.001, 5)
        
        created_time = datetime.now() - timedelta(hours=idx % 4 + 3, minutes=idx * 9)
        accepted_time = created_time + timedelta(minutes=12)
        picked_time = accepted_time + timedelta(minutes=20)
        
        donations_list.append({
            "food_name": food,
            "category": cat,
            "quantity": qty,
            "prepared_time": (created_time - timedelta(hours=1)).strftime("%I:%M %p"),
            "storage": "Hot Insulated Container" if cat in ["Veg", "Non-Veg"] else "Room Temperature",
            "expiry": (created_time + timedelta(hours=5)).strftime("%I:%M %p"),
            "address": d_addr,
            "latitude": lat,
            "longitude": lng,
            "donor_email": d_email,
            "freshness": fresh,
            "ai_result": "Safe",
            "recommendation": "Collected by volunteer. Vehicle is en route to NGO destination.",
            "priority": "Low",
            "recommended_ngo": ngo_target,
            "distance": f"{round(1.5 + (idx * 0.25) % 4.0, 1)} km",
            "status": "Picked",
            "ngo": ngo_target,
            "volunteer": vol_target,
            "created_at": created_time.strftime("%d-%m-%Y %I:%M %p"),
            "accepted_at": accepted_time.strftime("%d-%m-%Y %I:%M %p"),
            "picked_at": picked_time.strftime("%d-%m-%Y %I:%M %p"),
            "delivered_at": ""
        })

    # --- SECTION D: DELIVERED DONATIONS (Successfully Completed Distribution) ---
    delivered_raw = [
        ("Madurai Special Veg Meals (Rice, Sambar, Rasam, Poriyal, Payasam)", "Veg", 120, "Helping Hands NGO", "Vikas Dubey", 98, 5.0),
        ("Chicken Biryani & Egg Packets (Post Event Banquet)", "Non-Veg", 100, "Food Care Trust", "Ramesh Kumar", 96, 5.0),
        ("Traditional Pongal & Vada Breakfast Distribution", "Veg", 80, "Hope Foundation", "Suresh Raina", 95, 4.9),
        ("Whole Wheat Bread, Rusks & Sweet Buns Bulk Pack", "Bakery", 150, "Smile Charity", "Karthik Raja", 99, 5.0),
        ("Apple, Orange & Banana Relief Boxes", "Fruits", 75, "Akshaya Trust Madurai", "Dinesh Karthik", 97, 4.8),
        ("Chapati & Paneer Masala Dinner Packets", "Veg", 90, "Anbagam Children Home", "Kiran Bedi", 96, 5.0),
        ("Mutton Dum Biryani with Raita & Brinjal Gravy", "Non-Veg", 70, "Pasumai Food Relief Trust", "Meera Krishnan", 95, 4.9),
        ("Veg Fried Rice & Gobi Manchurian Combo", "Veg", 65, "Helping Hands NGO", "Sanjay Subramanian", 94, 4.8),
        ("Fresh Chocolate Truffle Pastries & Muffins", "Bakery", 50, "Food Care Trust", "Pooja Ramachandran", 98, 5.0),
        ("Pomegranate & Watermelon Fruit Bowls", "Fruits", 40, "Hope Foundation", "Vikas Dubey", 96, 5.0),
        ("Bisi Bele Bath & Potato Fry Packets", "Veg", 60, "Smile Charity", "Ramesh Kumar", 93, 4.7),
        ("Egg Fried Rice & Chicken 65 Boxes", "Non-Veg", 55, "Akshaya Trust Madurai", "Suresh Raina", 94, 4.9),
        ("Gulab Jamun & Mysore Pak Sweet Combo", "Veg", 80, "Anbagam Children Home", "Karthik Raja", 98, 5.0),
        ("French Loaves & Garlic Butter Bread", "Bakery", 45, "Pasumai Food Relief Trust", "Dinesh Karthik", 95, 4.8),
        ("Tender Coconut Water & Cut Papaya Slices", "Fruits", 50, "Helping Hands NGO", "Meera Krishnan", 97, 5.0),
        ("Idli, Medu Vada & Coconut Chutney Bulk Pack", "Veg", 110, "Food Care Trust", "Pooja Ramachandran", 95, 4.9),
        ("Chettinad Fish Curry with Steamed Rice", "Non-Veg", 40, "Hope Foundation", "Sanjay Subramanian", 92, 4.8),
        ("Veg Cutlet & Vegetable Spring Roll Boxes", "Bakery", 60, "Smile Charity", "Kiran Bedi", 94, 4.9),
        ("Sweet Buns, Butter Cookies & Cream Rolls", "Bakery", 70, "Akshaya Trust Madurai", "Vikas Dubey", 97, 5.0),
        ("Lemon Rice & Curd Rice Packets Combo", "Veg", 85, "Anbagam Children Home", "Ramesh Kumar", 95, 4.9),
        ("Tandoori Chicken & Butter Naan Dinner Packs", "Non-Veg", 50, "Helping Hands NGO", "Suresh Raina", 94, 5.0),
        ("Vegetable Pulao, Paneer Tikka & Salad", "Veg", 75, "Food Care Trust", "Karthik Raja", 96, 5.0),
        ("Fresh Mosambi & Orange Juice Packets", "Fruits", 60, "Hope Foundation", "Dinesh Karthik", 95, 4.9),
        ("Stuffed Aloo Parottas with Curd & Pickle", "Veg", 55, "Smile Charity", "Kiran Bedi", 93, 4.8),
        ("Chicken Pepper Gravy & Rice Meals", "Non-Veg", 45, "Akshaya Trust Madurai", "Meera Krishnan", 94, 4.9),
        ("Vanilla Sponge Cake & Tea Biscuits Box", "Bakery", 65, "Anbagam Children Home", "Sanjay Subramanian", 97, 5.0),
        ("Guava, Banana & Sapota Fresh Fruit Mix", "Fruits", 50, "Pasumai Food Relief Trust", "Pooja Ramachandran", 96, 5.0),
        ("Sambar Rice & Beans Usili Combo", "Veg", 70, "Helping Hands NGO", "Vikas Dubey", 95, 4.9),
        ("Egg Masala Curry & 60 Chapatis", "Non-Veg", 40, "Food Care Trust", "Ramesh Kumar", 93, 4.8),
        ("Mushroom Biryani & Gobi Fry Packets", "Veg", 60, "Hope Foundation", "Suresh Raina", 96, 5.0),
        ("Assorted Cupcakes & Cream Donut Trays", "Bakery", 50, "Smile Charity", "Karthik Raja", 98, 5.0),
        ("Grapes, Watermelon & Pineapple Slices", "Fruits", 45, "Akshaya Trust Madurai", "Dinesh Karthik", 94, 4.9),
        ("Curd Rice with Pomegranate Topping", "Veg", 90, "Anbagam Children Home", "Kiran Bedi", 96, 5.0),
        ("Chicken Noodles & Spring Rolls", "Non-Veg", 45, "Pasumai Food Relief Trust", "Meera Krishnan", 93, 4.8),
        ("Mini Veg Samosas & Mint Chutney Packs", "Bakery", 120, "Helping Hands NGO", "Pooja Ramachandran", 97, 5.0)
    ]
    
    for idx, item in enumerate(delivered_raw):
        food, cat, qty, ngo_target, vol_target, fresh, rating = item
        d_name, d_email, d_addr, d_lat, d_lng = donor_map[(idx + 1) % len(donor_map)]
        
        lat = round(d_lat + (idx * 0.0009) - 0.001, 5)
        lng = round(d_lng - (idx * 0.0012) + 0.002, 5)
        
        # Historical spacing over past 1 to 14 days
        days_ago = (idx % 14) + 1
        hours_ago = (idx % 8) + 2
        
        created_time = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        accepted_time = created_time + timedelta(minutes=14)
        picked_time = accepted_time + timedelta(minutes=22)
        delivered_time = picked_time + timedelta(minutes=35)
        
        donations_list.append({
            "food_name": food,
            "category": cat,
            "quantity": qty,
            "prepared_time": (created_time - timedelta(hours=1)).strftime("%I:%M %p"),
            "storage": "Hot Insulated Container" if cat in ["Veg", "Non-Veg"] else "Room Temperature",
            "expiry": (created_time + timedelta(hours=5)).strftime("%I:%M %p"),
            "address": d_addr,
            "latitude": lat,
            "longitude": lng,
            "donor_email": d_email,
            "freshness": fresh,
            "ai_result": "Safe",
            "recommendation": "Delivered successfully. Safe consumption confirmed by NGO.",
            "priority": "Low",
            "recommended_ngo": ngo_target,
            "distance": f"{round(1.0 + (idx * 0.18) % 3.5, 1)} km",
            "status": "Delivered",
            "ngo": ngo_target,
            "volunteer": vol_target,
            "donor_rating": rating,
            "ngo_rating": rating,
            "created_at": created_time.strftime("%d-%m-%Y %I:%M %p"),
            "accepted_at": accepted_time.strftime("%d-%m-%Y %I:%M %p"),
            "picked_at": picked_time.strftime("%d-%m-%Y %I:%M %p"),
            "delivered_at": delivered_time.strftime("%d-%m-%Y %I:%M %p")
        })

    db.donations.insert_many(donations_list)
    print(f"-> Successfully inserted {len(donations_list)} donations into 'donations' collection!")
    
    # ----------------------------------------------------
    # 3. VERIFICATION & STATS SUMMARY
    # ----------------------------------------------------
    print("\n" + "="*50)
    print("      DATABASE SEEDING COMPLETED SUCCESSFULLY")
    print("="*50)
    print(f"Total Users: {db.users.count_documents({})}")
    print(f"  - Donors:     {db.users.count_documents({'role': 'donor'})}")
    print(f"  - NGOs:       {db.users.count_documents({'role': 'ngo'})}")
    print(f"  - Volunteers: {db.users.count_documents({'role': 'volunteer'})}")
    print(f"  - Admins:     {db.users.count_documents({'role': 'admin'})}")
    print(f"  - Pending Verifications: {db.users.count_documents({'status': 'Pending Approval'})}")
    print(f"\nTotal Food Donations: {db.donations.count_documents({})}")
    print(f"  - Waiting:    {db.donations.count_documents({'status': 'Waiting'})}")
    print(f"  - Accepted:   {db.donations.count_documents({'status': 'Accepted'})}")
    print(f"  - Picked:     {db.donations.count_documents({'status': 'Picked'})}")
    print(f"  - Delivered:  {db.donations.count_documents({'status': 'Delivered'})}")
    print(f"  - Veg:        {db.donations.count_documents({'category': 'Veg'})}")
    print(f"  - Non-Veg:    {db.donations.count_documents({'category': 'Non-Veg'})}")
    print(f"  - Bakery:     {db.donations.count_documents({'category': 'Bakery'})}")
    print(f"  - Fruits:     {db.donations.count_documents({'category': 'Fruits'})}")
    print("="*50)
    print("You can now open MongoDB Compass to explore the collections and live documents.")

if __name__ == "__main__":
    seed()

