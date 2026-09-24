// ======================================
// SMART FOOD DONATION SYSTEM - AUTHENTICATION & ROLE ENGINE
// ======================================

// Intercept all fetch requests to pass authentication headers
(function interceptFetchForAuth() {
    const originalFetch = window.fetch;
    window.fetch = function (url, options = {}) {
        const role = (localStorage.getItem("role") || "").toLowerCase().trim();
        const email = localStorage.getItem("email") || "";

        options = options || {};
        options.headers = options.headers || {};

        if (options.headers instanceof Headers) {
            if (role && !options.headers.has("X-User-Role")) options.headers.append("X-User-Role", role);
            if (email && !options.headers.has("X-User-Email")) options.headers.append("X-User-Email", email);
        } else {
            if (role && !options.headers["X-User-Role"]) options.headers["X-User-Role"] = role;
            if (email && !options.headers["X-User-Email"]) options.headers["X-User-Email"] = email;
        }
        return originalFetch.call(this, url, options);
    };
})();

// Central Role Navigation & Module Configuration
const ROLE_NAVIGATION_CONFIG = {
    donor: [
        { id: "sidebarHome", icon: "fa-solid fa-house", label: "Dashboard", target: "sidebarHome" },
        { id: "sidebarDonate", icon: "fa-solid fa-hand-holding-heart", label: "Donate Food", target: "sidebarDonate" },
        { id: "sidebarMyDonations", icon: "fa-solid fa-box", label: "My Donations", target: "sidebarMyDonations" },
        { id: "sidebarAI", icon: "fa-solid fa-robot", label: "AI Assistant", target: "sidebarAI" },
        { id: "sidebarReports", icon: "fa-solid fa-chart-line", label: "Reports", target: "sidebarReports" },
        { id: "sidebarSettings", icon: "fa-solid fa-gear", label: "Settings", target: "sidebarSettings" }
    ],
    ngo: [
        { id: "sidebarHome", icon: "fa-solid fa-house", label: "Dashboard", target: "sidebarHome" },
        { id: "sidebarNGO", icon: "fa-solid fa-building", label: "Available Donations", target: "sidebarNGO" },
        { id: "sidebarNgoAccepted", icon: "fa-solid fa-box-archive", label: "Accepted Donations", target: "sidebarNgoAccepted" },
        { id: "sidebarNearbyDonors", icon: "fa-solid fa-location-dot", label: "Nearby Donors", target: "sidebarNearbyDonors" },
        { id: "sidebarVolunteer", icon: "fa-solid fa-users", label: "Volunteers", target: "sidebarVolunteer" },
        { id: "sidebarReports", icon: "fa-solid fa-chart-line", label: "Reports", target: "sidebarReports" },
        { id: "sidebarSettings", icon: "fa-solid fa-gear", label: "Settings", target: "sidebarSettings" }
    ],
    volunteer: [
        { id: "sidebarHome", icon: "fa-solid fa-house", label: "Dashboard", target: "sidebarHome" },
        { id: "sidebarVolunteer", icon: "fa-solid fa-truck-fast", label: "Assigned Pickups", target: "sidebarVolunteer" },
        { id: "sidebarNGO", icon: "fa-solid fa-building-circle-check", label: "Nearby Donations", target: "sidebarNGO" },
        { id: "sidebarDeliveries", icon: "fa-solid fa-boxes-packing", label: "My Deliveries", target: "sidebarVolunteer" },
        { id: "sidebarReports", icon: "fa-solid fa-chart-line", label: "Reports", target: "sidebarReports" },
        { id: "sidebarSettings", icon: "fa-solid fa-gear", label: "Settings", target: "sidebarSettings" }
    ],
    admin: [
        { id: "sidebarAdminHome", icon: "fa-solid fa-chart-line", label: "Dashboard", target: "sidebarAdminHome", dataPage: "admin-dashboard" },
        { id: "sidebarAdminUsers", icon: "fa-solid fa-users-gear", label: "User Management", target: "sidebarAdminUsers", dataPage: "user-management" },
        { id: "sidebarAdminNGOs", icon: "fa-solid fa-building-circle-check", label: "NGO Verification", target: "sidebarAdminNGOs", dataPage: "ngo-verification" },
        { id: "sidebarAdminDonors", icon: "fa-solid fa-hand-holding-heart", label: "Donor Verification", target: "sidebarAdminDonors", dataPage: "donor-verification" },
        { id: "sidebarAdminVolunteers", icon: "fa-solid fa-truck-ramp-box", label: "Volunteer Verification", target: "sidebarAdminVolunteers", dataPage: "volunteer-verification" },
        { id: "sidebarAdminDonations", icon: "fa-solid fa-boxes-packing", label: "Donation Management", target: "sidebarAdminDonations", dataPage: "donation-management" },
        { id: "sidebarAdminReports", icon: "fa-solid fa-chart-pie", label: "Reports", target: "sidebarAdminReports", dataPage: "reports" },
        { id: "sidebarAdminSettings", icon: "fa-solid fa-sliders", label: "Settings", target: "sidebarAdminSettings", dataPage: "settings" }
    ]
};

// Render Role Navigation dynamically into desktop sidebar & mobile drawer
function renderRoleNavigation() {
    const role = (localStorage.getItem("role") || "").toLowerCase().trim();
    const menuUl = document.querySelector(".menu");
    if (!menuUl) return;

    if (!role || !ROLE_NAVIGATION_CONFIG[role]) {
        menuUl.innerHTML = "";
        return;
    }

    const navItems = ROLE_NAVIGATION_CONFIG[role];
    menuUl.innerHTML = "";

    navItems.forEach((item, idx) => {
        const li = document.createElement("li");
        li.id = item.id;
        if (item.dataPage) li.setAttribute("data-page", item.dataPage);
        if (idx === 0) li.classList.add("active");

        li.innerHTML = `
            <i class="${item.icon}"></i>
            <span>${item.label}</span>
        `;

        li.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof window.navigateToSection === "function") {
                window.navigateToSection(item.target || item.id);
            } else if (typeof window.switchTab === "function") {
                window.switchTab(item.target || item.id);
            } else {
                window.location.href = "dashboard.html";
            }
        });

        menuUl.appendChild(li);
    });

    // Logout Item
    const logoutLi = document.createElement("li");
    logoutLi.classList.add("logout");
    logoutLi.id = "logoutBtn";
    logoutLi.innerHTML = `
        <i class="fa-solid fa-right-from-bracket"></i>
        <span>Logout</span>
    `;
    logoutLi.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
    });
    menuUl.appendChild(logoutLi);
}

// Startup Guard & Router
(function autoCheckLoginOnLoad() {
    const path = window.location.pathname.toLowerCase();
    const email = localStorage.getItem("email");
    const role = (localStorage.getItem("role") || "").toLowerCase().trim();
    const isLoggedIn = !!(email && role);

    const isPublicPage = path.endsWith("index.html") || path.endsWith("/") || path.endsWith("login.html") || path.endsWith("register.html");

    if (!isLoggedIn) {
        // Logged-out users: allow public pages (index.html, login.html, register.html)
        // If visiting a protected system module page while logged out, redirect to login.html
        if (!isPublicPage) {
            window.location.href = "login.html";
        }
    } else {
        // Logged-in users: if visiting public/landing pages or auth pages (index.html, login.html, register.html, /),
        // automatically route to their authorized dashboard
        if (isPublicPage) {
            if (role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }
        }
    }
})();

// Check Login Session
function checkLogin() {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (!name || !role || !email) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Role Page Guard (Direct URL protection)
function checkRole(allowedRoles) {
    if (!checkLogin()) return;

    const currentRole = (localStorage.getItem("role") || "").toLowerCase().trim();

    if (currentRole === "admin") return;

    const allowedList = Array.isArray(allowedRoles)
        ? allowedRoles.map(r => r.toLowerCase().trim())
        : [allowedRoles.toLowerCase().trim()];

    if (!allowedList.includes(currentRole)) {
        window.location.href = "dashboard.html";
    }
}

// Logout & State Purge
async function logout() {
    if (typeof window.deleteFCMTokenFromBackend === 'function') {
        try {
            await window.deleteFCMTokenFromBackend();
        } catch (e) {
            console.warn("FCM Token cleanup on logout:", e);
        }
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    if (email && role) {
        renderRoleNavigation();
    }
});

window.logout = logout;
window.checkRole = checkRole;
window.checkLogin = checkLogin;
window.renderRoleNavigation = renderRoleNavigation;
window.ROLE_NAVIGATION_CONFIG = ROLE_NAVIGATION_CONFIG;