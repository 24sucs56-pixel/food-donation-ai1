// Firebase Cloud Messaging Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase inside the Service Worker
// Replace with your Firebase Web App configuration from Firebase Console:
// Firebase Console -> Project Settings -> General -> Web Apps -> SDK setup and configuration
const firebaseConfig = self.FIREBASE_CONFIG || {
  apiKey: "AIzaSyBO_kOPeVZmCw_yd1ilIpUgYNJhdqmITJo",
  authDomain: "smart-food-donation-ai.firebaseapp.com",
  projectId: "smart-food-donation-ai",
  storageBucket: "smart-food-donation-ai.firebasestorage.app",
  messagingSenderId: "336262620600",
  appId: "1:336262620600:web:663045303e84adf4991b4d",
  measurementId: "G-6S5ZM1EJQ0"
};

try {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  
  const messaging = firebase.messaging();

  // Background Push Notification Handler
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'Smart Food Donation Alert';
    const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || 'You have a new update regarding food donation.';
    
    const options = {
      body: body,
      icon: (payload.notification && payload.notification.icon) || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'food-donation-notification',
      data: payload.data || {}
    };

    return self.registration.showNotification(title, options);
  });
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Firebase SW initialization deferred or failed:', err);
}

// Notification Click Handler: Opens/focuses app window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/dashboard.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
