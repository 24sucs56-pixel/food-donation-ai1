import os
import logging
from datetime import datetime
try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    HAS_FIREBASE_SDK = True
except ImportError:
    HAS_FIREBASE_SDK = False
    firebase_admin = None
    credentials = None
    messaging = None

from database import users

# Setup logger for FCM
logger = logging.getLogger("fcm_service")
logger.setLevel(logging.INFO)

# Global flag to track initialization
_fcm_initialized = False

def init_firebase():
    """
    Initializes the Firebase Admin SDK safely.
    Checks secret path on Render (/etc/secrets/firebase-service-account.json),
    environment variable, or local root fallback.
    Does NOT crash if credentials are absent (gracefully degrades).
    """
    global _fcm_initialized
    if _fcm_initialized:
        return True

    if not HAS_FIREBASE_SDK:
        logger.info("firebase-admin package not installed in environment. Push notifications disabled.")
        _fcm_initialized = False
        return False

    if firebase_admin._apps:
        _fcm_initialized = True
        return True

    possible_paths = [
        "/etc/secrets/firebase-service-account.json",
        os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", ""),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "firebase-service-account.json")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "firebase-service-account.json"))
    ]

    service_account_path = None
    for path in possible_paths:
        if path and os.path.isfile(path):
            service_account_path = path
            break

    if service_account_path:
        try:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            _fcm_initialized = True
            logger.info("Firebase Admin SDK successfully initialized from credential file.")
            return True
        except Exception as e:
            logger.warning(f"Failed to initialize Firebase Admin SDK from {service_account_path}: {e}")
            _fcm_initialized = False
            return False
    else:
        logger.info("No Firebase service account file found. Push notifications will operate in disabled fallback mode.")
        _fcm_initialized = False
        return False

# Attempt initialization on module load
init_firebase()


def clean_invalid_token(token):
    """
    Removes an invalid or unregistered FCM token from all MongoDB user records.
    """
    try:
        res = users.update_many(
            {"fcm_tokens.token": token},
            {"$pull": {"fcm_tokens": {"token": token}}}
        )
        logger.info(f"Cleaned up invalid FCM token. Modified documents: {res.modified_count}")
    except Exception as e:
        logger.error(f"Error cleaning invalid FCM token: {e}")


def send_multicast_push(tokens, title, body, data=None):
    """
    Sends FCM push notification to a list of tokens and handles token cleanup for failed ones.
    """
    if not tokens or not init_firebase():
        return False

    # Ensure token uniqueness
    unique_tokens = list(set([t for t in tokens if t]))
    if not unique_tokens:
        return False

    payload_data = {}
    if data:
        for k, v in data.items():
            payload_data[str(k)] = str(v)

    notification = messaging.Notification(
        title=title,
        body=body
    )

    message = messaging.MulticastMessage(
        tokens=unique_tokens,
        notification=notification,
        data=payload_data,
        webpush=messaging.WebpushConfig(
            notification=messaging.WebpushNotification(
                title=title,
                body=body,
                icon="/icons/icon-192x192.png",
                badge="/icons/icon-72x72.png"
            ),
            fcm_options=messaging.WebpushFCMOptions(
                link="/"
            )
        )
    )

    try:
        response = messaging.send_each_for_multicast(message)
        logger.info(f"FCM multicast sent. Success count: {response.success_count}, Failure count: {response.failure_count}")

        # Check for invalid tokens to clean up
        if response.failure_count > 0:
            for idx, resp in enumerate(response.responses):
                if not resp.success:
                    err = resp.exception
                    err_code = str(err).lower()
                    if "unregistered" in err_code or "invalid-registration-token" in err_code or "notfound" in err_code:
                        invalid_token = unique_tokens[idx]
                        clean_invalid_token(invalid_token)

        return True
    except Exception as e:
        logger.error(f"Error sending FCM multicast notification: {e}")
        return False


def send_push_to_user(user_identifier, title, body, data=None):
    """
    Sends FCM push notification to a specific user identified by email, name, or ObjectId string.
    """
    try:
        user = users.find_one({"$or": [{"email": user_identifier}, {"name": user_identifier}]})
        if not user:
            from bson.objectid import ObjectId
            if ObjectId.is_valid(str(user_identifier)):
                user = users.find_one({"_id": ObjectId(str(user_identifier))})

        if not user or "fcm_tokens" not in user or not user["fcm_tokens"]:
            return False

        tokens = [t.get("token") for t in user.get("fcm_tokens", []) if t.get("token")]
        return send_multicast_push(tokens, title, body, data)
    except Exception as e:
        logger.error(f"Exception in send_push_to_user: {e}")
        return False


def send_push_to_users(user_identifiers, title, body, data=None):
    """
    Sends FCM push notification to multiple users.
    """
    try:
        if not user_identifiers:
            return False

        query = {"$or": [{"email": {"$in": user_identifiers}}, {"name": {"$in": user_identifiers}}]}
        matched_users = users.find(query)
        all_tokens = []
        for u in matched_users:
            for t in u.get("fcm_tokens", []):
                if t.get("token"):
                    all_tokens.append(t.get("token"))

        return send_multicast_push(all_tokens, title, body, data)
    except Exception as e:
        logger.error(f"Exception in send_push_to_users: {e}")
        return False


def send_push_to_role(role, title, body, data=None):
    """
    Sends FCM push notification to all users with a specific role ('donor', 'ngo', 'volunteer', 'admin').
    """
    try:
        role_users = users.find({"role": role.lower()})
        all_tokens = []
        for u in role_users:
            for t in u.get("fcm_tokens", []):
                if t.get("token"):
                    all_tokens.append(t.get("token"))

        return send_multicast_push(all_tokens, title, body, data)
    except Exception as e:
        logger.error(f"Exception in send_push_to_role: {e}")
        return False


def send_push_to_ngo(ngo_identifier, title, body, data=None):
    """
    Sends push to NGO user by NGO name or email. Fallbacks to all NGO role users if specific NGO user not found.
    """
    try:
        ngo_user = users.find_one({"role": "ngo", "$or": [{"ngo_name": ngo_identifier}, {"email": ngo_identifier}, {"name": ngo_identifier}]})
        if ngo_user:
            tokens = [t.get("token") for t in ngo_user.get("fcm_tokens", []) if t.get("token")]
            if tokens:
                return send_multicast_push(tokens, title, body, data)

        # Fallback to all NGOs if specific NGO doesn't have token
        return send_push_to_role("ngo", title, body, data)
    except Exception as e:
        logger.error(f"Exception in send_push_to_ngo: {e}")
        return False
