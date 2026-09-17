from flask import request, jsonify
from database import users

def authorize_role(allowed_roles):
    """
    Authorization check for backend API endpoints.
    Checks headers 'X-User-Role' and 'X-User-Email' or body/query params.
    If 'X-User-Email' is present, validates actual role in DB to prevent tampering.
    'admin' is always granted access.
    """
    user_email = request.headers.get("X-User-Email") or request.args.get("user_email")
    user_role = request.headers.get("X-User-Role") or request.args.get("user_role")

    if request.is_json and request.get_json(silent=True):
        data = request.get_json(silent=True) or {}
        if not user_email:
            user_email = data.get("user_email")
        if not user_role:
            user_role = data.get("user_role")

    # If email provided, double check real role from DB
    if user_email:
        db_user = users.find_one({"email": user_email})
        if db_user and db_user.get("role"):
            user_role = db_user.get("role")

    all_allowed = [r.lower() for r in allowed_roles] + ["admin"]
    
    if not user_role or user_role.lower() not in all_allowed:
        return False, (jsonify({
            "status": "error",
            "message": f"Access Denied: Action requires one of roles: {', '.join(allowed_roles)}"
        }), 403)

    return True, None
