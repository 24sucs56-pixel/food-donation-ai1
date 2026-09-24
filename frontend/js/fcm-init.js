/**
 * Smart Food Donation AI - Firebase Cloud Messaging (FCM) Push Notification Module
 */

// Global Firebase Web Configuration
// Replace placeholders with your Firebase Web App configuration from Firebase Console:
// Project Settings -> General -> Your Apps -> Web App -> SDK Setup and Configuration
window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
  apiKey: "AIzaSyBO_kOPeVZmCw_yd1ilIpUgYNJhdqmITJo",
  authDomain: "smart-food-donation-ai.firebaseapp.com",
  projectId: "smart-food-donation-ai",
  storageBucket: "smart-food-donation-ai.firebasestorage.app",
  messagingSenderId: "336262620600",
  appId: "1:336262620600:web:663045303e84adf4991b4d",
  measurementId: "G-6S5ZM1EJQ0"
};

// Replace with your VAPID Public Key from Firebase Console:
// Project Settings -> Cloud Messaging -> Web Push certificates -> Key pair
window.FIREBASE_VAPID_KEY = window.FIREBASE_VAPID_KEY || "BDjeVj4N576BQg-aJ7Vn_pg0nf89Mpa49pz7WHw4nw8RyeoQuxCOgpni7j2zmhkFUrxjE7bwOsd7XGAS8NV68CM";

const getFCMApiBase = () => {
  if (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://127.0.0.1:5000";
  }
  return "https://food-donation-ai1.onrender.com";
};

let fcmApp = null;
let fcmMessaging = null;

// Initialize Firebase App & Messaging
function initFCM() {
  if (fcmMessaging) return fcmMessaging;

  try {
    if (typeof firebase !== 'undefined' && firebase.apps) {
      if (!firebase.apps.length) {
        fcmApp = firebase.initializeApp(window.FIREBASE_CONFIG);
      } else {
        fcmApp = firebase.apps[0];
      }
      if (firebase.messaging.isSupported()) {
        fcmMessaging = firebase.messaging();
      }
    }
  } catch (err) {
    console.warn("FCM Initialization Warning:", err);
  }
  return fcmMessaging;
}

// Save FCM token to Flask backend API
async function saveFCMTokenToBackend(token) {
  const email = localStorage.getItem("email");
  if (!email || !token) return;

  try {
    const apiBase = getFCMApiBase();
    const response = await fetch(`${apiBase}/api/save-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": email
      },
      body: JSON.stringify({
        fcm_token: token,
        email: email,
        device_info: navigator.userAgent || "Web Browser"
      })
    });

    const data = await response.json();
    if (data.status === "success") {
      localStorage.setItem("fcm_token", token);
      console.log("FCM Token registered with backend successfully.");
    }
  } catch (err) {
    console.warn("Error sending FCM token to backend:", err);
  }
}

// Remove FCM Token on logout
async function deleteFCMTokenFromBackend() {
  const token = localStorage.getItem("fcm_token");
  const email = localStorage.getItem("email");
  if (!token) return;

  try {
    const apiBase = getFCMApiBase();
    await fetch(`${apiBase}/api/delete-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": email || ""
      },
      body: JSON.stringify({
        fcm_token: token,
        email: email || ""
      })
    });
    localStorage.removeItem("fcm_token");
  } catch (err) {
    console.warn("Error deleting FCM token on logout:", err);
  }
}

// Request Push Notification Permission
async function requestFCMPermission() {
  if (!('Notification' in window)) {
    console.log("This browser does not support desktop/mobile push notifications.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log("Notification permission granted.");
      hideFCMPermissionBanner();
      
      // Register Service Worker & Fetch Token
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const messaging = initFCM();
        if (messaging) {
          const tokenOptions = { serviceWorkerRegistration: registration };
          if (window.FIREBASE_VAPID_KEY) {
            tokenOptions.vapidKey = window.FIREBASE_VAPID_KEY;
          }
          const token = await messaging.getToken(tokenOptions);

          if (token) {
            await saveFCMTokenToBackend(token);
          }
        }
      }
      return true;
    } else if (permission === 'denied') {
      console.log("Notification permission denied by user.");
      localStorage.setItem("fcm_permission_dismissed", "true");
      hideFCMPermissionBanner();
      return false;
    }
  } catch (err) {
    console.warn("Error requesting notification permission:", err);
  }
  return false;
}

// Display UX Permission Request Banner post-login if permission is default and user hasn't dismissed
function checkAndShowFCMPermissionBanner() {
  const email = localStorage.getItem("email");
  if (!email) return; // Only show for logged in users

  if (!('Notification' in window)) return;

  if (Notification.permission === 'default' && !localStorage.getItem("fcm_permission_dismissed")) {
    showFCMPermissionBanner();
  } else if (Notification.permission === 'granted') {
    // Silently refresh token if granted
    requestFCMPermission();
  }
}

function showFCMPermissionBanner() {
  if (document.getElementById("fcmPermissionBanner")) return;

  const banner = document.createElement("div");
  banner.id = "fcmPermissionBanner";
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 380px;
    background: #161b22;
    border: 1px solid #10b981;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 99999;
    color: #e6edf3;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeIn 0.3s ease-in-out;
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 24px;">🔔</span>
      <div>
        <strong style="font-size: 15px; color: #10b981; display: block;">Enable Push Notifications</strong>
        <span style="font-size: 13px; color: #8b949e;">Get real-time updates on your donations, NGO requests, and volunteer pickups directly on your device.</span>
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
      <button id="fcmDismissBtn" style="background: transparent; border: 1px solid #30363d; color: #8b949e; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">Later</button>
      <button id="fcmEnableBtn" style="background: #10b981; border: none; color: #ffffff; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">Enable Notifications</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById("fcmEnableBtn").addEventListener("click", () => {
    requestFCMPermission();
  });

  document.getElementById("fcmDismissBtn").addEventListener("click", () => {
    localStorage.setItem("fcm_permission_dismissed", "true");
    hideFCMPermissionBanner();
  });
}

function hideFCMPermissionBanner() {
  const banner = document.getElementById("fcmPermissionBanner");
  if (banner) {
    banner.remove();
  }
}

// Foreground messaging setup
function setupForegroundFCM() {
  const messaging = initFCM();
  if (messaging) {
    messaging.onMessage((payload) => {
      console.log("Received foreground FCM message:", payload);

      const title = payload.notification?.title || payload.data?.title || "Notification";
      const body = payload.notification?.body || payload.data?.body || "";

      // Refresh in-app dropdown notifications if function available
      if (typeof window.loadNotifications === 'function') {
        window.loadNotifications();
      }

      // Show toast alert
      if (typeof showToast === 'function') {
        showToast(`🔔 ${title}: ${body}`);
      }
    });
  }
}

// Auto-run on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    checkAndShowFCMPermissionBanner();
    setupForegroundFCM();
  }, 1500);
});

// Export globally
window.requestFCMPermission = requestFCMPermission;
window.deleteFCMTokenFromBackend = deleteFCMTokenFromBackend;
