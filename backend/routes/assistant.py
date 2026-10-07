import os
import json
import urllib.request
import sys
from flask import Blueprint, request, jsonify

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from auth_middleware import authorize_role

assistant = Blueprint("assistant", __name__)

BASE_SYSTEM_INSTRUCTION = (
    "You are the Smart Food Donation AI Assistant, an interactive chatbot for Smart Food Donation (a smart food donation platform).\n"
    "Your goal is to help users (donors, NGOs, volunteers) navigate the application and understand food donation practices, "
    "food safety guidelines, storage details, NGO matching, volunteer dispatches, and donation tracking.\n\n"
    "Rules:\n"
    "1. Respond in clean, semantic HTML format (e.g. use <p>, <ul>, <li>, <strong>, <a>, <br> as needed). Do not include "
    "<html>, <body>, or <head> tags.\n"
    "2. If you refer to navigation in the app, link to the appropriate pages/modules:\n"
    "   - Donate Food page: <a href=\"donate.html\">Donate Food</a>\n"
    "   - Dashboard: <a href=\"dashboard.html\">Dashboard</a>\n"
    "   - My Donations: <a href=\"mydonations.html\">My Donations</a>\n"
    "   - NGO Available Donations: <a href=\"dashboard.html\">Available Donations</a>\n"
    "   - Volunteer Assigned Pickups: <a href=\"dashboard.html\">Assigned Pickups</a>\n"
    "3. Keep your answers polite, helpful, and concise.\n"
    "4. Align your advice with the application's goals: reducing food waste and matching fresh food with local shelters."
)

@assistant.route("/assistant/chat", methods=["POST"])
def chat():
    is_auth, auth_err = authorize_role(["donor", "ngo", "volunteer"])
    if not is_auth:
        return auth_err

    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({
            "status": "error",
            "message": "Message is required"
        }), 400

    user_role = (request.headers.get("X-User-Role") or data.get("user_role") or "donor").lower().strip()

    role_instructions = {
        "donor": "Current user role: DONOR. Provide advice relevant to food donors, such as food freshness calculations, safety parameters, donation steps, and status tracking.",
        "ngo": "Current user role: NGO. Provide advice relevant to non-profit organizations, including browsing available donations, accepting donations, managing accepted items, and volunteer coordination.",
        "volunteer": "Current user role: VOLUNTEER. Provide advice relevant to delivery volunteers, including pickup procedures, assigned pickups, transit safety, food handling, and delivery confirmation."
    }

    specific_instruction = role_instructions.get(user_role, role_instructions["donor"])
    system_instruction = f"{BASE_SYSTEM_INSTRUCTION}\n\n{specific_instruction}"

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        setup_message = (
            f"<p>👋 Hello! I am the Smart Food Donation AI Assistant ({user_role.upper()} Mode).</p>"
            "<div style='border: 1px solid #ffeeba; background-color: #fff3cd; color: #856404; padding: 12px; border-radius: 8px; margin-top: 10px; margin-bottom: 10px; font-size: 14px;'>"
            "<strong>⚠️ Gemini API Key is missing!</strong><br>"
            "To activate my real-time AI capabilities, please follow these steps:<br>"
            "<ol style='margin-top: 5px; margin-bottom: 5px; padding-left: 20px;'>"
            "<li>Create a <code>.env</code> file in the <code>backend/</code> directory.</li>"
            "<li>Add this line to it: <code>GEMINI_API_KEY=your_actual_api_key</code></li>"
            "<li>Restart the Flask backend server.</li>"
            "</ol>"
            "You can obtain a free API key from <a href='https://aistudio.google.com/' target='_blank' style='color: #0056b3; text-decoration: underline;'>Google AI Studio</a>.<br>"
            "<em>Currently running in offline simulation mode.</em>"
            "</div>"
        )
        return jsonify({
            "status": "success",
            "reply": setup_message,
            "api_key_configured": False
        })

    contents = []
    for chat_msg in history:
        role = chat_msg.get("role")
        text = chat_msg.get("text", "")
        gemini_role = "model" if role == "model" else "user"
        contents.append({
            "role": gemini_role,
            "parts": [{"text": text}]
        })

    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1000
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)

            candidates = res_json.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    reply_html = parts[0].get("text", "")
                    return jsonify({
                        "status": "success",
                        "reply": reply_html,
                        "api_key_configured": True
                    })

            return jsonify({
                "status": "error",
                "message": "Empty response from Gemini API"
            }), 500

    except Exception as e:
        print("Gemini API Error:", str(e))
        return jsonify({
            "status": "error",
            "message": f"Failed to connect to Gemini API: {str(e)}"
        }), 500
