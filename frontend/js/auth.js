// ======================================
// CHECK LOGIN & AUTH STATE
// ======================================

const role = localStorage.getItem("role");

if (!role) {
    alert("Please login first.");
    window.location.href = "login.html";
}

// ======================================
// CHECK ROLE WITH ADMIN BYPASS
// ======================================

function checkRole(expectedRole) {
    checkLogin();
    const currentRole = (localStorage.getItem("role") || "donor").toLowerCase();

    // Admin has access to all modules/pages
    if (currentRole === "admin") {
        return;
    }

    if (currentRole !== expectedRole.toLowerCase()) {
        alert("Access Denied!");
        window.location.href = "login.html";
    }
}

// ======================================
// CHECK LOGIN INITIALIZER
// ======================================

function checkLogin() {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    if (!name || !role) {
        alert("Please login first.");
        window.location.href = "login.html";
    }
}

// ======================================
// LOGOUT UTILITY
// ======================================

function logout() {
    localStorage.clear();
    alert("Logged out successfully.");
    window.location.href = "login.html";
}