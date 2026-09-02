document.addEventListener("DOMContentLoaded", () => {

    console.log("Smart Food Donation Dashboard Loaded Successfully");

    // ==========================================
    // Profile Picture Upload Interaction
    // ==========================================
    const changeAvatarBtn = document.getElementById("changeAvatarBtn");
    const profileImageFileInput = document.getElementById("profileImageFileInput");
    
    if (changeAvatarBtn && profileImageFileInput) {
        changeAvatarBtn.addEventListener("click", () => {
            profileImageFileInput.click();
        });
        
        profileImageFileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            // Validate file type
            const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!validTypes.includes(file.type)) {
                alert("Invalid file type. Please select a JPG, JPEG, PNG, or WEBP image.");
                return;
            }
            
            // Validate file size (2MB limit)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                alert("File size exceeds 2MB limit. Please choose a smaller image.");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target.result;
                
                // Update frontend locally immediately
                updateAllAvatars(base64Image);
                localStorage.setItem("profile_image", base64Image);
                
                // Save to backend database
                const userEmail = localStorage.getItem("email");
                if (userEmail) {
                    try {
                        const response = await fetch("http://127.0.0.1:5000/user/profile/image", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                email: userEmail,
                                profile_image: base64Image
                            })
                        });
                        if (response.ok) {
                            console.log("Profile picture synced to database successfully");
                        } else {
                            console.error("Backend failed to save profile picture");
                        }
                    } catch (err) {
                        console.error("Error updating profile image on server:", err);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // ==========================
    // Load Logged-in User
    // ==========================

    const name = localStorage.getItem("name") || "Guest";
    const role = localStorage.getItem("role") || "Donor";
const chatUserName = document.getElementById("chatUserName");

if(chatUserName){

    chatUserName.innerText = name;

}
    // Top Bar
    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");

    if (userName) userName.innerText = name;
    if (userRole) {
        let displayRole = role.charAt(0).toUpperCase() + role.slice(1);
        if (role.toLowerCase() === "ngo") displayRole = "NGO";
        userRole.innerText = displayRole;
    }

    // Sidebar
    const sidebarUser = document.getElementById("sidebarUserName");
    if (sidebarUser) {
        sidebarUser.innerText = name;
    }

    // Sync profile dropdown text dynamically
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    if (profileName) profileName.innerText = name;
    if (profileRole) {
        let displayRole = role.charAt(0).toUpperCase() + role.slice(1);
        if (role.toLowerCase() === "ngo") displayRole = "NGO";
        profileRole.innerText = displayRole;
    }

    // Dynamic Profile Avatar based on User Role or Custom Upload
    function updateAllAvatars(src) {
        document.querySelectorAll(".profile-button img, .profile-menu-header img, .settings-avatar").forEach(img => {
            img.src = src;
        });
    }

    let avatarSrc = localStorage.getItem("profile_image");
    if (!avatarSrc) {
        avatarSrc = "images/user1.png"; // Default donor
        if (role.toLowerCase() === "ngo") {
            avatarSrc = "images/user2.png";
        } else if (role.toLowerCase() === "volunteer") {
            avatarSrc = "images/user3.png";
        } else if (role.toLowerCase() === "admin") {
            avatarSrc = "images/logo.png";
        }
    }
    updateAllAvatars(avatarSrc);

    // Role-based Sidebar Menu Visibility Guard
    const roleMenuVisibility = {
        donor: ["sidebarHome", "sidebarDonate", "sidebarMyDonations", "sidebarAI", "sidebarSettings", "logoutBtn"],
        ngo: ["sidebarHome", "sidebarNGO", "sidebarAI", "sidebarSettings", "logoutBtn"],
        volunteer: ["sidebarHome", "sidebarVolunteer", "sidebarAI", "sidebarSettings", "logoutBtn"],
        admin: ["sidebarHome", "sidebarDonate", "sidebarMyDonations", "sidebarNGO", "sidebarVolunteer", "sidebarAI", "sidebarReports", "sidebarAdminUsers", "sidebarSettings", "logoutBtn"]
    };

    const allowedMenus = roleMenuVisibility[role.toLowerCase()] || roleMenuVisibility.donor;
    const allMenuIds = ["sidebarHome", "sidebarDonate", "sidebarMyDonations", "sidebarNGO", "sidebarVolunteer", "sidebarAI", "sidebarReports", "sidebarAdminUsers", "sidebarSettings", "logoutBtn"];
    
    allMenuIds.forEach(menuId => {
        const menuItem = document.getElementById(menuId);
        if (menuItem) {
            if (allowedMenus.includes(menuId)) {
                menuItem.style.display = "flex";
            } else {
                menuItem.style.display = "none";
            }
        }
    });

    // ==========================
    // Logout
    // ==========================
    const logoutBtns = document.querySelectorAll("#logoutBtn, #profileLogoutBtn, .logout");
    logoutBtns.forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "login.html";
        });
    });

    // ==========================================
    // SIDEBAR TAB SWITCHING WITH ROLE GUARDS
    // ==========================================
    const currentRole = (localStorage.getItem("role") || "donor").toLowerCase();

    const sections = {
        sidebarHome: { el: document.getElementById("dashboardHomeSection"), roles: ["donor", "ngo", "volunteer"] },
        sidebarDonate: { el: document.getElementById("donateSection"), roles: ["donor"] },
        sidebarMyDonations: { el: document.getElementById("myDonationsSection"), roles: ["donor"] },
        sidebarNGO: { el: document.getElementById("ngoSection"), roles: ["ngo"] },
        sidebarVolunteer: { el: document.getElementById("volunteerSection"), roles: ["volunteer"] },
        sidebarAI: { el: document.querySelector(".ai-assistant"), roles: ["donor", "ngo", "volunteer"] },
        sidebarReports: { el: document.getElementById("reportsSection"), roles: ["admin"] },
        sidebarAdminUsers: { el: document.getElementById("adminUsersSection"), roles: ["admin"] },
        sidebarSettings: { el: document.getElementById("settingsSection"), roles: ["donor", "ngo", "volunteer"] }
    };

    function switchTab(clickedId) {
        const target = sections[clickedId];
        if (!target) return;

        // Check Role Guard (Admin has access to everything)
        const isAuthorized = currentRole === "admin" || target.roles.includes(currentRole);

        // Deactivate all menu items
        document.querySelectorAll(".menu li").forEach(item => item.classList.remove("active"));
        
        // Activate clicked item
        const clickedItem = document.getElementById(clickedId);
        if (clickedItem) clickedItem.classList.add("active");

        // Hide all sections, including unauthorizedSection
        Object.values(sections).forEach(sec => {
            if (sec.el) sec.el.style.display = "none";
        });
        const unauthSec = document.getElementById("unauthorizedSection");
        if (unauthSec) unauthSec.style.display = "none";

        if (isAuthorized) {
            // Show clicked section
            if (target.el) {
                target.el.style.display = "block";
                
                // Reload tab contents dynamically to fetch fresh data
                if (clickedId === "sidebarMyDonations" && typeof loadDonorDonations === "function") {
                    loadDonorDonations();
                } else if (clickedId === "sidebarNGO" && typeof loadDonations === "function") {
                    loadDonations();
                } else if (clickedId === "sidebarVolunteer" && typeof loadVolunteerTasks === "function") {
                    loadVolunteerTasks();
                    if (typeof loadVolunteerRating === "function") loadVolunteerRating();
                } else if (clickedId === "sidebarAdminUsers" && typeof loadAdminUsersVerification === "function") {
                    loadAdminUsersVerification();
                }
                
                // Special fix for Leaflet map display issues when shown
                if (clickedId === "sidebarDonate" && typeof pickupMap !== "undefined" && pickupMap) {
                    setTimeout(() => {
                        pickupMap.invalidateSize();
                    }, 200);
                }
            }
        } else {
            // Show unauthorized section
            if (unauthSec) {
                unauthSec.style.display = "block";
                const unauthMsg = document.getElementById("unauthorizedMsg");
                if (unauthMsg) {
                    unauthMsg.innerHTML = `This module is restricted to <strong>${target.roles.map(r => r.toUpperCase()).join(", ")}</strong> accounts. <br><br>Your current account is logged in as a <strong>${currentRole.toUpperCase()}</strong>.`;
                }
            }
        }
    }
    window.switchTab = switchTab;

    // Attach listeners to sidebar items
    Object.keys(sections).forEach(id => {
        const item = document.getElementById(id);
        if (item) {
            item.addEventListener("click", () => switchTab(id));
        }
    });

    // Populate profile details in Settings
    const settingsName = document.getElementById("settingsName");
    const settingsEmail = document.getElementById("settingsEmail");
    const settingsRole = document.getElementById("settingsRole");
    if (settingsName) settingsName.value = localStorage.getItem("name") || "Guest User";
    if (settingsEmail) settingsEmail.value = localStorage.getItem("email") || "guest@smartfooddonation.org";
    if (settingsRole) settingsRole.value = localStorage.getItem("role") || "donor";
    const settingsProfileName = document.getElementById("settingsProfileName");
    if (settingsProfileName) settingsProfileName.innerText = localStorage.getItem("name") || "Guest User";

    // ==========================================
    // UPDATE DASHBOARD STATS WITH REAL DATA
    // ==========================================
    async function updateDashboardStats() {
        try {
            const response = await fetch("http://127.0.0.1:5000/donations");
            if (!response.ok) return;
            const result = await response.json();
            const allDonations = result.data || [];

            // 1. Total Donations
            const totalDonations = allDonations.length;
            const totalDonationsEl = document.getElementById("totalDonations");
            if (totalDonationsEl) {
                totalDonationsEl.innerText = totalDonations;
                totalDonationsEl.setAttribute("data-target", totalDonations);
            }

            // 2. Meals Saved (sum of quantity of all delivered donations)
            const deliveredDonations = allDonations.filter(d => d.status === "Delivered");
            const mealsSaved = deliveredDonations.reduce((sum, d) => sum + parseInt(d.quantity || 0), 0);
            const mealsSavedEl = document.getElementById("mealsSaved");
            if (mealsSavedEl) {
                mealsSavedEl.innerText = mealsSaved;
                mealsSavedEl.setAttribute("data-target", mealsSaved);
            }

            // 3. Connected NGOs
            const activeNgos = new Set();
            allDonations.forEach(d => {
                if (d.ngo) activeNgos.add(d.ngo);
                if (d.recommended_ngo) activeNgos.add(d.recommended_ngo);
            });
            const connectedNgos = activeNgos.size || 4;
            const connectedNgosEl = document.getElementById("connectedNgos");
            if (connectedNgosEl) {
                connectedNgosEl.innerText = connectedNgos;
                connectedNgosEl.setAttribute("data-target", connectedNgos);
            }

            // 4. AI Food Safety (average freshness percentage)
            const freshDonations = allDonations.filter(d => typeof d.freshness === "number");
            let avgFreshness = 95;
            if (freshDonations.length > 0) {
                const totalFreshness = freshDonations.reduce((sum, d) => sum + d.freshness, 0);
                avgFreshness = Math.round(totalFreshness / freshDonations.length);
            }
            const aiFoodSafetyEl = document.getElementById("aiFoodSafety");
            if (aiFoodSafetyEl) {
                aiFoodSafetyEl.innerText = `${avgFreshness}%`;
                aiFoodSafetyEl.setAttribute("data-target", avgFreshness);
            }

            // 5. Dynamic Progress Bars
            const ngoAccepted = allDonations.filter(d => ["Accepted", "Picked", "Delivered"].includes(d.status)).length;
            const pickedUp = allDonations.filter(d => ["Picked", "Delivered"].includes(d.status)).length;
            const delivered = deliveredDonations.length;
            const pending = allDonations.filter(d => d.status === "Waiting").length;

            const reducedVal = Math.round((ngoAccepted / (totalDonations || 1)) * 100);
            const successVal = Math.round((delivered / (ngoAccepted || 1)) * 100);
            const aiVal = avgFreshness;

            const reducedSpan = document.querySelector(".progress-card:nth-child(1) span");
            const reducedBar = document.querySelector(".progress1");
            if (reducedSpan) reducedSpan.innerText = `${reducedVal}%`;
            if (reducedBar) reducedBar.style.width = `${reducedVal}%`;

            const successSpan = document.querySelector(".progress-card:nth-child(2) span");
            const successBar = document.querySelector(".progress2");
            if (successSpan) successSpan.innerText = `${successVal}%`;
            if (successBar) successBar.style.width = `${successVal}%`;

            const aiSpan = document.querySelector(".progress-card:nth-child(3) span");
            const aiBar = document.querySelector(".progress3");
            if (aiSpan) aiSpan.innerText = `${aiVal}%`;
            if (aiBar) aiBar.style.width = `${aiVal}%`;

            // 6. Reports & Analytics Section Stats
            const reportTotalEl = document.getElementById("reportTotal");
            if (reportTotalEl) reportTotalEl.innerText = totalDonations;
            const reportAcceptedEl = document.getElementById("reportAccepted");
            if (reportAcceptedEl) reportAcceptedEl.innerText = ngoAccepted;
            const reportPickedEl = document.getElementById("reportPicked");
            if (reportPickedEl) reportPickedEl.innerText = pickedUp;
            const reportDeliveredEl = document.getElementById("reportDelivered");
            if (reportDeliveredEl) reportDeliveredEl.innerText = delivered;
            const reportPendingEl = document.getElementById("reportPending");
            if (reportPendingEl) reportPendingEl.innerText = pending;

            // 7. Render Reports Ledger Table
            function renderReportsTable(filter) {
                const tbody = document.getElementById("reportTableBody");
                if (!tbody) return;
                tbody.innerHTML = "";
                const filtered = filter === "All" ? allDonations : allDonations.filter(d => d.status === filter);
                filtered.forEach(d => {
                    let statusClass = "pending";
                    if (d.status === "Delivered") statusClass = "delivered";
                    else if (d.status === "Picked" || d.status === "Accepted") statusClass = "progress";
                    const foodNameText = Array.isArray(d.food_name) 
                        ? d.food_name.map(f => typeof f === 'object' ? `${f.name} (${f.category})` : f).join(", ") 
                        : (d.food_name || "");
                    tbody.innerHTML += `
                        <tr>
                            <td>${foodNameText}</td>
                            <td>${d.donor_email || "rohan.sharma.donor@gmail.com"}</td>
                            <td>${d.ngo || d.recommended_ngo || "-"}</td>
                            <td>${d.volunteer || "-"}</td>
                            <td>${d.freshness}% (${d.ai_result})</td>
                            <td><span class="status ${statusClass}">${d.status}</span></td>
                        </tr>
                    `;
                });
            }

            const filterSel = document.getElementById("reportFilter");
            if (filterSel) {
                // Remove existing to prevent duplication
                const newFilterSel = filterSel.cloneNode(true);
                filterSel.parentNode.replaceChild(newFilterSel, filterSel);
                newFilterSel.addEventListener("change", (e) => {
                    renderReportsTable(e.target.value);
                });
            }
            renderReportsTable(document.getElementById("reportFilter")?.value || "All");
            
            // 8. Update Recent Donations Table
            updateRecentDonationsTable(allDonations);

            // Save donations globally
            window.globalDonations = allDonations;

            // 9. Update Rewards Profile
            if (typeof loadUserProfileAndRewards === "function") {
                loadUserProfileAndRewards();
            }

            // 10. Update Notifications
            if (typeof window.loadNotifications === "function") {
                window.loadNotifications(allDonations);
            }
        } catch (error) {
            console.error("Error updating dashboard stats:", error);
        }
    }

    function updateRecentDonationsTable(donations) {
        const tbody = document.querySelector(".recent-donations tbody");
        if (!tbody) return;
        
        const sorted = [...donations].reverse().slice(0, 5);
        tbody.innerHTML = "";
        
        sorted.forEach(d => {
            let statusClass = "pending";
            if (d.status === "Delivered") statusClass = "delivered";
            else if (d.status === "Picked" || d.status === "Accepted") statusClass = "progress";
            
            const foodNameText = Array.isArray(d.food_name) 
                ? d.food_name.map(f => typeof f === 'object' ? `${f.name} (${f.category})` : f).join(", ") 
                : (d.food_name || "");
            tbody.innerHTML += `
                <tr>
                    <td>${foodNameText}</td>
                    <td>${d.donor_email ? d.donor_email.split('@')[0] : "donor"}</td>
                    <td>${d.ngo || d.recommended_ngo || "-"}</td>
                    <td>${d.volunteer ? `${d.volunteer} ${d.volunteer_rating ? `(${d.volunteer_rating} ★)` : ''}` : "-"}</td>
                    <td>${d.address ? d.address.split(',')[0] : "Madurai"}</td>
                    <td>
                        <span class="status ${statusClass}">
                            ${d.status}
                        </span>
                    </td>
                </tr>
            `;
        });
    }

    // Expose to window so other scripts (like ngo.js, volunteer.js) can refresh stats in real time
    window.updateDashboardStats = updateDashboardStats;

    // Load live statistics on load
    updateDashboardStats();

    // Redirect "View All" button in Recent Donations based on role
    const viewAllBtn = document.querySelector(".recent-donations .view-all-btn");
    if (viewAllBtn) {
        viewAllBtn.addEventListener("click", () => {
            if (currentRole === "admin") {
                const sidebarReports = document.getElementById("sidebarReports");
                if (sidebarReports) {
                    sidebarReports.click();
                }
            } else if (currentRole === "donor") {
                const sidebarMyDonations = document.getElementById("sidebarMyDonations");
                if (sidebarMyDonations) {
                    sidebarMyDonations.click();
                }
            } else if (currentRole === "ngo") {
                const sidebarNGO = document.getElementById("sidebarNGO");
                if (sidebarNGO) {
                    sidebarNGO.click();
                }
            } else if (currentRole === "volunteer") {
                const sidebarVolunteer = document.getElementById("sidebarVolunteer");
                if (sidebarVolunteer) {
                    sidebarVolunteer.click();
                }
            }
        });
    }

    // Default: switch to sidebarHome tab on page load
    switchTab("sidebarHome");

    // =========================================
    //         PROFILE DROPDOWN INTERACTIVITY
    // =========================================
    const profileBtn = document.getElementById("profileBtn");
    const profileMenu = document.getElementById("profileMenu");

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            profileMenu.classList.toggle("show");
        });

        document.addEventListener("click", function () {
            profileMenu.classList.remove("show");
        });

        profileMenu.addEventListener("click", function (e) {
            e.stopPropagation();
        });

        // Option 1: My Profile
        const myProfileLink = document.getElementById("profileMenuMyProfile");
        if (myProfileLink) {
            myProfileLink.addEventListener("click", (e) => {
                e.preventDefault();
                switchTab("sidebarSettings");
                profileMenu.classList.remove("show");
            });
        }

        // Option 2: Settings
        const settingsLink = document.getElementById("profileMenuSettings");
        if (settingsLink) {
            settingsLink.addEventListener("click", (e) => {
                e.preventDefault();
                switchTab("sidebarSettings");
                profileMenu.classList.remove("show");
            });
        }

        // Option 3: Notifications
        const notificationsLink = document.getElementById("profileMenuNotifications");
        if (notificationsLink) {
            notificationsLink.addEventListener("click", (e) => {
                e.preventDefault();
                const notifBtn = document.getElementById("notificationBtn");
                if (notifBtn) notifBtn.click();
                profileMenu.classList.remove("show");
            });
        }

        // Option 4: Help Center
        const helpLink = document.getElementById("profileMenuHelp");
        if (helpLink) {
            helpLink.addEventListener("click", (e) => {
                e.preventDefault();
                switchTab("sidebarAI");
                profileMenu.classList.remove("show");
            });
        }
    }

});
/*=========================================
        DONATION ANALYTICS CHART
=========================================*/

const chartCanvas = document.getElementById("donationChart");

if (chartCanvas && typeof Chart !== "undefined") {

    new Chart(chartCanvas, {

        type: "line",

        data: {

            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul"
            ],

            datasets: [{

                label: "Meals Donated",

                data: [
                    120,
                    240,
                    180,
                    320,
                    420,
                    510,
                    650
                ],

                borderColor: "#16a34a",

                backgroundColor: "rgba(34,197,94,.15)",

                fill: true,

                tension: .4

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

}
// Notification toggling code moved inside DOMContentLoaded block below


// ==========================
// Dashboard Counter Animation
// ==========================

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const updateCounter = () => {

        const target = Number(counter.getAttribute("data-target"));
        const current = Number(counter.innerText);

        const increment = Math.ceil(target / 50);

        if (current < target) {

            counter.innerText = Math.min(current + increment, target);

            setTimeout(updateCounter, 30);

        }

    };

    updateCounter();

});
// ==========================
// Current Date
// ==========================

const currentDate = document.getElementById("currentDate");

const today = new Date();

const options = {

    weekday: "long",

    year: "numeric",

    month: "long",

    day: "numeric"

};

currentDate.innerText = today.toLocaleDateString("en-US", options);
// ==========================
// Dynamic Greeting
// ==========================

const greeting = document.getElementById("greeting");

if (greeting) {

    const hour = new Date().getHours();

    if (hour < 12) {

        greeting.innerHTML = "Good Morning 🌅";

    }
    else if (hour < 17) {

        greeting.innerHTML = "Good Afternoon ☀️";

    }
    else {

        greeting.innerHTML = "Good Evening 🌙";

    }

}
// ==========================
// Live Clock
// ==========================

const liveClock = document.getElementById("liveClock");

function updateClock() {

    const now = new Date();

    const options = {

        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit",

        hour12: true

    };

    if (liveClock) {

        liveClock.innerText = "🕒 " + now.toLocaleTimeString("en-US", options);

    }

}

// Run immediately
updateClock();

// Update every second
setInterval(updateClock, 1000);
// ==========================
// DARK MODE
// ==========================

const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");

    if (themeIcon) {

        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");

    }

}

// Toggle theme
if (themeBtn) {

    themeBtn.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("theme", "dark");

            themeIcon.classList.remove("fa-moon");
            themeIcon.classList.add("fa-sun");

        } else {

            localStorage.setItem("theme", "light");

            themeIcon.classList.remove("fa-sun");
            themeIcon.classList.add("fa-moon");

        }

    });

}
// ==========================================================
// LOAD REAL DONATION DATA WITH OFFLINE FALLBACK
// ==========================================================

async function loadDonationData() {
    try {
        const response = await fetch("http://127.0.0.1:5000/donations");
        const result = await response.json();

        console.log("🔥 Donation Data:", result);

        if (result.status !== "success") {
            console.error("Failed to load donations");
            return;
        }

        const donations = result.data;
        const totalDonations = donations.length;

        // Update Total Donations Counter
        const totalDonationElement = document.getElementById("totalDonations");
        if (totalDonationElement) {
            totalDonationElement.setAttribute("data-target", totalDonations);
            totalDonationElement.innerText = "0";

            // Animate the number
            let current = 0;
            const counterAnimation = setInterval(() => {
                if (current < totalDonations) {
                    current++;
                    totalDonationElement.innerText = current;
                } else {
                    totalDonationElement.innerText = totalDonations;
                    clearInterval(counterAnimation);
                }
            }, 30);
        }

    } catch (error) {
        console.warn("❌ Error loading donations from server, using local fallback:", error);
        
        // Offline Fallback - Load from local storage
        try {
            const localData = JSON.parse(localStorage.getItem("donations")) || [];
            const totalDonations = localData.length;
            const totalDonationElement = document.getElementById("totalDonations");
            if (totalDonationElement) {
                totalDonationElement.setAttribute("data-target", totalDonations);
                totalDonationElement.innerText = totalDonations;
            }
        } catch (e) {
            console.error("Error reading local donations:", e);
        }
    }
}

// Load donations when dashboard opens
loadDonationData();
console.log("🔥 LIVE DONATION CODE IS RUNNING WITH OFFLINE FALLBACK");

// =======================================
// REWARDS & CERTIFICATIONS MANAGEMENT
// =======================================
async function loadUserProfileAndRewards() {
    const userEmail = localStorage.getItem("email");
    const userRole = (localStorage.getItem("role") || "").toLowerCase();
    
    if (!userEmail) return;
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/user/profile?email=${encodeURIComponent(userEmail)}`);
        if (!response.ok) return;
        const data = await response.json();
        
        // Sync profile image from database
        if (data.profile_image) {
            localStorage.setItem("profile_image", data.profile_image);
            updateAllAvatars(data.profile_image);
        } else {
            // Fallback to role default if database has no image
            let avatarSrc = "images/user1.png"; // Default donor
            if (userRole === "ngo") {
                avatarSrc = "images/user2.png";
            } else if (userRole === "volunteer") {
                avatarSrc = "images/user3.png";
            } else if (userRole === "admin") {
                avatarSrc = "images/logo.png";
            }
            updateAllAvatars(avatarSrc);
        }
        
        // Populate settings section user details
        const settingsPoints = document.getElementById("settingsPoints");
        if (settingsPoints) settingsPoints.innerText = data.points || 0;

        const settingsRank = document.getElementById("settingsRank");
        if (settingsRank) settingsRank.innerText = data.certificate || "Contributor";

        const settingsPrize = document.getElementById("settingsPrize");
        if (settingsPrize) settingsPrize.innerText = data.prize || "None";

        const settingsStatus = document.getElementById("settingsStatus");
        if (settingsStatus) {
            settingsStatus.innerText = data.user_status || "Approved";
            if ((data.user_status || "").toLowerCase() === "rejected") {
                settingsStatus.style.color = "#dc2626";
            } else if ((data.user_status || "").toLowerCase() === "pending verification") {
                settingsStatus.style.color = "#ea580c";
            } else {
                settingsStatus.style.color = "#16a34a";
            }
        }
        
        // Rewards Section (For Donors & Volunteers only)
        const rewardsSection = document.getElementById("rewardsSection");
        if (userRole !== "donor" && userRole !== "volunteer") {
            if (rewardsSection) rewardsSection.style.display = "none";
            return;
        }
        
        if (rewardsSection) {
            rewardsSection.style.display = "block";
        }
        
        const volunteerRatingCard = document.getElementById("volunteerRatingCard");
        if (volunteerRatingCard) {
            if (userRole === "volunteer") {
                volunteerRatingCard.style.display = "block";
                const userRatingVal = document.getElementById("userRatingVal");
                if (userRatingVal) {
                    const starsStr = data.rating_count > 0 ? `${data.rating} ★` : "No ratings yet";
                    userRatingVal.innerText = `${starsStr} (${data.rating_count} reviews)`;
                }
            } else {
                volunteerRatingCard.style.display = "none";
            }
        }
        
        const userPointsVal = document.getElementById("userPointsVal");
        if (userPointsVal) userPointsVal.innerText = data.points;
        
        const userCertLevel = document.getElementById("userCertLevel");
        if (userCertLevel) userCertLevel.innerText = data.certificate;
        
        const userPrizeVal = document.getElementById("userPrizeVal");
        if (userPrizeVal) userPrizeVal.innerText = data.prize;
        
        const viewCertificateBtn = document.getElementById("viewCertificateBtn");
        if (viewCertificateBtn) {
            if (data.points >= 100) {
                viewCertificateBtn.style.display = "inline-block";
                viewCertificateBtn.onclick = () => {
                    showCertificateModal(data.name, data.certificate);
                };
            } else {
                viewCertificateBtn.style.display = "none";
            }
        }
    } catch (error) {
        console.error("Error loading user profile rewards:", error);
    }
}

function showCertificateModal(name, certLevel) {
    const certModal = document.getElementById("certificateModal");
    if (!certModal) return;
    
    const certName = document.getElementById("certName");
    if (certName) certName.innerText = name;
    
    const certLevelText = document.getElementById("certLevelText");
    if (certLevelText) certLevelText.innerText = certLevel;
    
    const certDate = document.getElementById("certDate");
    if (certDate) {
        const today = new Date();
        const dateStr = today.getDate().toString().padStart(2, '0') + '-' + 
                        (today.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                        today.getFullYear();
        certDate.innerText = dateStr;
    }
    
    certModal.style.display = "flex";
}

// =======================================
// ADMIN USER VERIFICATION & MANAGEMENT
// =======================================
// Global store for base64 documents to avoid HTML markup bloat/crashes
window.adminUserDocuments = {};

async function loadAdminUsersVerification() {
    try {
        const response = await fetch("http://127.0.0.1:5000/admin/users");
        const res = await response.json();
        
        if (res.status !== "success") {
            console.error("Failed to load users");
            return;
        }
        
        const tbody = document.getElementById("adminUserVerificationData");
        if (!tbody) return;
        tbody.innerHTML = "";
        
        const usersList = res.data || [];
        if (usersList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="padding: 20px; text-align: center; color: #64748b;">No registration requests found.</td></tr>`;
            return;
        }
        
        // Reset documents store
        window.adminUserDocuments = {};
        
        usersList.forEach(user => {
            // Save document in memory if it exists
            if (user.document_image) {
                window.adminUserDocuments[user.email] = {
                    name: user.name,
                    document: user.document_image,
                    role: user.role
                };
            }

            let details = "";
            if (user.role === "volunteer") {
                details = `<strong>Vehicle Type:</strong> ${user.vehicle || 'None'}`;
            } else if (user.role === "ngo") {
                details = `<strong>NGO Name:</strong> ${user.ngo_name || ''}<br><strong>Reg No:</strong> ${user.registration_number || ''}`;
            } else if (user.role === "donor") {
                details = `<strong>Donor Type:</strong> ${user.donor_type || 'General'}`;
            }
            
            let statusBadge = "";
            let actionButtons = "";
            
            if (user.status === "Pending Approval") {
                statusBadge = `<span class="status pending">Pending Approval</span>`;
                actionButtons = `
                    <button class="submit-btn" style="width: auto; padding: 6px 12px; margin: 2px; background: #16a34a; font-size: 12px;" onclick="verifyUserAdmin('${user.email}', 'Approved')">Approve</button>
                    <button class="submit-btn" style="width: auto; padding: 6px 12px; margin: 2px; background: #dc2626; font-size: 12px;" onclick="verifyUserAdmin('${user.email}', 'Rejected')">Reject</button>
                `;
            } else if (user.status === "Approved") {
                statusBadge = `<span class="status delivered">Approved</span>`;
                actionButtons = `
                    <button class="submit-btn" style="width: auto; padding: 6px 12px; margin: 2px; background: #dc2626; font-size: 12px;" onclick="verifyUserAdmin('${user.email}', 'Rejected')">Reject</button>
                `;
            } else {
                statusBadge = `<span class="status pending" style="background: #fecaca; color: #b91c1c;">Rejected</span>`;
                actionButtons = `
                    <button class="submit-btn" style="width: auto; padding: 6px 12px; margin: 2px; background: #16a34a; font-size: 12px;" onclick="verifyUserAdmin('${user.email}', 'Approved')">Approve</button>
                `;
            }
            
            let documentCol = "<span style='color:#94a3b8;'>No document</span>";
            if (user.document_image) {
                let docLabel = "Document";
                if (user.role === "volunteer") docLabel = "Driving License";
                else if (user.role === "ngo") docLabel = "NGO Certificate";
                else if (user.role === "donor") docLabel = "FSSAI License";
                
                documentCol = `<button class="submit-btn" style="width: auto; padding: 6px 12px; font-size: 12px; background: #4f46e5;" onclick="viewDocumentAdmin('${user.email}')">View ${docLabel}</button>`;
            }
            
            // Build full address formatting
            let fullAddress = `
                ${user.address || '-'}<br>
                ${user.city || ''}, ${user.district || ''}<br>
                ${user.state || ''} - ${user.pincode || ''}
            `;
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${user.name}</strong></td>
                    <td>${user.email}</td>
                    <td><span style="text-transform: capitalize; font-weight: 500;">${user.role}</span></td>
                    <td>${user.phone || '-'}</td>
                    <td>${fullAddress}</td>
                    <td>${details}</td>
                    <td>${documentCol}</td>
                    <td>${statusBadge}</td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading verification requests:", error);
    }
}

window.viewDocumentAdmin = function(email) {
    const docData = window.adminUserDocuments[email];
    if (!docData) return;
    
    const modal = document.getElementById("documentModal");
    const img = document.getElementById("modalDocImg");
    const title = document.getElementById("modalDocTitle");
    
    let docLabel = "Verification Document";
    if (docData.role === "volunteer") docLabel = "Driving License";
    else if (docData.role === "ngo") docLabel = "NGO Registration Certificate";
    else if (docData.role === "donor") docLabel = "Food Safety / FSSAI License";
    
    title.innerText = `${docData.name}'s ${docLabel}`;
    img.src = docData.document;
    modal.style.display = "flex";
};

window.verifyUserAdmin = async function(email, status) {
    if (!confirm(`Are you sure you want to change this user status to ${status}?`)) {
        return;
    }
    try {
        const response = await fetch("http://127.0.0.1:5000/admin/users/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                status: status
            })
        });
        
        const res = await response.json();
        alert(res.message);
        if (response.ok) {
            loadAdminUsersVerification();
        }
    } catch (error) {
        console.error(error);
        alert("Failed to update verification status.");
    }
};

// Modal Close Handlers
document.addEventListener("DOMContentLoaded", () => {

    const closeDoc = document.getElementById("closeDocModal");
    if (closeDoc) {
        closeDoc.addEventListener("click", () => {
            document.getElementById("documentModal").style.display = "none";
        });
    }
    
    const closeCert = document.getElementById("closeCertModal");
    if (closeCert) {
        closeCert.addEventListener("click", () => {
            document.getElementById("certificateModal").style.display = "none";
        });
    }

    const closeDetails = document.getElementById("closeDetailsModal");
    if (closeDetails) {
        closeDetails.addEventListener("click", () => {
            document.getElementById("donationDetailsModal").style.display = "none";
        });
    }
    
    window.addEventListener("click", (e) => {
        const docModal = document.getElementById("documentModal");
        if (e.target === docModal) {
            docModal.style.display = "none";
        }
        const certModal = document.getElementById("certificateModal");
        if (e.target === certModal) {
            certModal.style.display = "none";
        }
        const detailsModal = document.getElementById("donationDetailsModal");
        if (e.target === detailsModal) {
            detailsModal.style.display = "none";
        }
    });

    // Random Food Saving & Donation Facts Selector
    const foodFacts = [
        "Around 1/3 of all food produced globally is lost or wasted every year.",
        "Donating surplus food reduces landfill methane emissions, fighting climate change.",
        "Feeding people instead of landfills saves water, land, and energy resources.",
        "Every donation helps! Even small contributions can feed a family in need.",
        "Over 800 million people suffer from chronic hunger, while edible food is wasted.",
        "AI-powered freshness tracking safeguards beneficiaries and improves efficiency.",
        "Meal planning and proper storage can prevent up to 40% of household food waste."
    ];
    const factTextEl = document.getElementById("topbarFactText");
    if (factTextEl) {
        const randomFact = foodFacts[Math.floor(Math.random() * foodFacts.length)];
        factTextEl.innerText = randomFact;
    }
});

// ==========================================
// DYNAMIC NOTIFICATION SYSTEM & DETAIL VIEW
// ==========================================

function parseCustomDate(dateStr) {
    if (!dateStr) return new Date(0);
    try {
        const parts = dateStr.split(" ");
        if (parts.length < 2) return new Date(0);
        
        const dateParts = parts[0].split("-");
        const timeParts = parts[1].split(":");
        const ampm = parts[2] ? parts[2].toUpperCase() : "AM";
        
        if (dateParts.length < 3 || timeParts.length < 2) return new Date(0);
        
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const year = parseInt(dateParts[2]);
        
        let hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        
        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        
        return new Date(year, month, day, hour, minute);
    } catch (e) {
        console.error("Error parsing date:", dateStr, e);
        return new Date(0);
    }
}

window.viewDonationDetails = function(donationOrId, donationsList) {
    let donation = null;
    if (typeof donationOrId === "object" && donationOrId !== null) {
        donation = donationOrId;
    } else if (donationsList) {
        donation = donationsList.find(d => d._id === donationOrId);
    }
    
    if (!donation) {
        console.error("Donation details not found!");
        return;
    }
    
    // Populate categories/details
    const modalCat = document.getElementById("modalDonationCategory");
    if (modalCat) {
        modalCat.innerText = donation.category || "Veg";
        modalCat.className = `card-badge category-${(donation.category || "Veg").toLowerCase().replace(" ", "-")}`;
    }
    
    const modalTitle = document.getElementById("modalDonationTitle");
    if (modalTitle) {
        const foodNameText = Array.isArray(donation.food_name) 
            ? donation.food_name.map(f => typeof f === 'object' ? f.name : f).join(", ") 
            : (donation.food_name || "");
        modalTitle.innerText = foodNameText;
    }
    
    const modalId = document.getElementById("modalDonationId");
    if (modalId) modalId.innerText = `Donation ID: ${donation._id}`;
    
    const modalStatus = document.getElementById("modalDonationStatus");
    if (modalStatus) {
        modalStatus.innerText = donation.status;
        let statusClass = "waiting";
        if (donation.status === "Delivered") statusClass = "delivered";
        else if (donation.status === "Picked") statusClass = "picked";
        else if (donation.status === "Accepted") statusClass = "accepted";
        modalStatus.className = `status-badge ${statusClass}`;
    }
    
    // Freshness
    const freshVal = typeof donation.freshness === "number" ? donation.freshness : 90;
    const modalFreshVal = document.getElementById("modalDonationFreshnessVal");
    if (modalFreshVal) modalFreshVal.innerText = `${freshVal}%`;
    const modalFreshBar = document.getElementById("modalDonationFreshnessBar");
    if (modalFreshBar) {
        modalFreshBar.style.width = `${freshVal}%`;
        let barColor = "#16a34a"; // high
        if (freshVal < 50) barColor = "#ef4444"; // low
        else if (freshVal < 80) barColor = "#f59e0b"; // med
        modalFreshBar.style.backgroundColor = barColor;
    }
    
    // Quantity & Storage
    const modalQty = document.getElementById("modalDonationQuantity");
    if (modalQty) modalQty.innerText = `${donation.quantity} units`;
    
    const modalStorage = document.getElementById("modalDonationStorage");
    if (modalStorage) modalStorage.innerText = donation.storage || "Ambient";
    
    const modalPrepared = document.getElementById("modalDonationPrepared");
    if (modalPrepared) modalPrepared.innerText = donation.prepared_time || "-";
    
    const modalExpiry = document.getElementById("modalDonationExpiry");
    if (modalExpiry) modalExpiry.innerText = donation.expiry || "-";
    
    // Additional Info
    const modalAddr = document.getElementById("modalDonationAddress");
    if (modalAddr) modalAddr.innerText = donation.address || "-";
    
    const modalNgo = document.getElementById("modalDonationNgo");
    if (modalNgo) modalNgo.innerText = donation.ngo || donation.recommended_ngo || "-";
    
    const modalVol = document.getElementById("modalDonationVolunteer");
    if (modalVol) modalVol.innerText = donation.volunteer || "Awaiting Assignment";
    
    const modalVerdict = document.getElementById("modalDonationAiVerdict");
    if (modalVerdict) modalVerdict.innerText = `${donation.ai_result || "Passed"} (${donation.priority || "Normal"} Priority)`;
    
    const modalAdvice = document.getElementById("modalDonationAiAdvice");
    const modalAdviceRow = document.getElementById("modalDonationAiAdviceRow");
    if (donation.recommendation) {
        if (modalAdvice) modalAdvice.innerText = donation.recommendation;
        if (modalAdviceRow) modalAdviceRow.style.display = "flex";
    } else {
        if (modalAdviceRow) modalAdviceRow.style.display = "none";
    }
    
    // Timeline
    const modalTimeline = document.getElementById("modalDonationTimeline");
    if (modalTimeline) {
        modalTimeline.innerHTML = `
            <div class="timeline-step completed">
                <div class="step-dot"></div>
                <div class="step-info">
                    <span class="step-label">Created / Submitted</span>
                    <span class="step-time">${donation.created_at || '-'}</span>
                </div>
            </div>
            <div class="timeline-step ${donation.accepted_at ? 'completed' : ''}">
                <div class="step-dot"></div>
                <div class="step-info">
                    <span class="step-label">NGO Accepted</span>
                    <span class="step-time">${donation.accepted_at || 'Awaiting Claim'}</span>
                </div>
            </div>
            <div class="timeline-step ${donation.picked_at ? 'completed' : ''}">
                <div class="step-dot"></div>
                <div class="step-info">
                    <span class="step-label">Picked Up</span>
                    <span class="step-time">${donation.picked_at || 'Awaiting Pickup'}</span>
                </div>
            </div>
            <div class="timeline-step ${donation.delivered_at ? 'completed' : ''}">
                <div class="step-dot"></div>
                <div class="step-info">
                    <span class="step-label">Delivered Safely</span>
                    <span class="step-time">${donation.delivered_at || 'In Transit'}</span>
                </div>
            </div>
        `;
    }
    
    // Display Modal
    const modal = document.getElementById("donationDetailsModal");
    if (modal) {
        modal.style.display = "flex";
    }
};

window.loadNotifications = function(allDonations) {
    const userEmail = localStorage.getItem("email") || "";
    const userName = localStorage.getItem("name") || "";
    const userRole = (localStorage.getItem("role") || "donor").toLowerCase();
    
    const notificationBody = document.querySelector("#notificationMenu .notification-body");
    if (!notificationBody) return;
    
    let notifications = [];
    
    // Generate notifications based on role
    if (userRole === "donor") {
        const myDonations = allDonations.filter(d => d.donor_email === userEmail);
        myDonations.forEach(d => {
            const foodNameText = Array.isArray(d.food_name) 
                ? d.food_name.map(f => typeof f === 'object' ? f.name : f).join(", ") 
                : (d.food_name || "Food");
            
            notifications.push({
                id: `${d._id}_submitted`,
                donationId: d._id,
                title: "Donation Submitted",
                text: `Your donation of ${foodNameText} was submitted successfully.`,
                dateStr: d.created_at,
                icon: "📦",
                tabId: "sidebarMyDonations"
            });
            
            if (d.accepted_at) {
                notifications.push({
                    id: `${d._id}_accepted`,
                    donationId: d._id,
                    title: "Donation Accepted",
                    text: `Your donation of ${foodNameText} was claimed by ${d.ngo || 'an NGO'}.`,
                    dateStr: d.accepted_at,
                    icon: "🤝",
                    tabId: "sidebarMyDonations"
                });
            }
            
            if (d.picked_at) {
                notifications.push({
                    id: `${d._id}_picked`,
                    donationId: d._id,
                    title: "Volunteer Assigned & Picked Up",
                    text: `Volunteer ${d.volunteer || 'assigned'} has picked up ${foodNameText}.`,
                    dateStr: d.picked_at,
                    icon: "🚚",
                    tabId: "sidebarMyDonations"
                });
            }
            
            if (d.delivered_at) {
                notifications.push({
                    id: `${d._id}_delivered`,
                    donationId: d._id,
                    title: "Donation Delivered",
                    text: `Your donation of ${foodNameText} has been safely delivered! Thank you.`,
                    dateStr: d.delivered_at,
                    icon: "✅",
                    tabId: "sidebarMyDonations"
                });
            }
        });
        
    } else if (userRole === "ngo") {
        allDonations.forEach(d => {
            const foodNameText = Array.isArray(d.food_name) 
                ? d.food_name.map(f => typeof f === 'object' ? f.name : f).join(", ") 
                : (d.food_name || "Food");
            
            if (d.status === "Waiting") {
                notifications.push({
                    id: `${d._id}_available`,
                    donationId: d._id,
                    title: "New Donation Available",
                    text: `Surplus food ${foodNameText} is available for claiming.`,
                    dateStr: d.created_at,
                    icon: "🔔",
                    tabId: "sidebarNGO",
                    subTabId: "ngoTabAvailable"
                });
            } else if (d.ngo === userName || d.ngo === "Helping Hands NGO") {
                notifications.push({
                    id: `${d._id}_ngo_accepted`,
                    donationId: d._id,
                    title: "Donation Claimed by You",
                    text: `You claimed ${foodNameText}. Awaiting volunteer pickup.`,
                    dateStr: d.accepted_at,
                    icon: "🤝",
                    tabId: "sidebarNGO",
                    subTabId: "ngoTabAccepted"
                });
                
                if (d.picked_at) {
                    notifications.push({
                        id: `${d._id}_ngo_picked`,
                        donationId: d._id,
                        title: "Donation Picked Up",
                        text: `Volunteer ${d.volunteer || 'assigned'} picked up ${foodNameText}.`,
                        dateStr: d.picked_at,
                        icon: "🚚",
                        tabId: "sidebarNGO",
                        subTabId: "ngoTabAccepted"
                    });
                }
                
                if (d.delivered_at) {
                    notifications.push({
                        id: `${d._id}_ngo_delivered`,
                        donationId: d._id,
                        title: "Donation Delivered Successfully",
                        text: `${foodNameText} has been delivered to your location.`,
                        dateStr: d.delivered_at,
                        icon: "✅",
                        tabId: "sidebarNGO",
                        subTabId: "ngoTabAccepted"
                    });
                }
            }
        });
        
    } else if (userRole === "volunteer") {
        allDonations.forEach(d => {
            const foodNameText = Array.isArray(d.food_name) 
                ? d.food_name.map(f => typeof f === 'object' ? f.name : f).join(", ") 
                : (d.food_name || "Food");
            
            if (d.status === "Accepted") {
                notifications.push({
                    id: `${d._id}_vol_available`,
                    donationId: d._id,
                    title: "New Pickup Task Available",
                    text: `Surplus food ${foodNameText} is ready at ${d.address ? d.address.split(',')[0] : 'location'}.`,
                    dateStr: d.accepted_at,
                    icon: "🔔",
                    tabId: "sidebarVolunteer",
                    subTabId: "volTabAvailable"
                });
            } else if (d.volunteer === userName || d.volunteer === "Vikas Dubey") {
                if (d.picked_at) {
                    notifications.push({
                        id: `${d._id}_vol_picked`,
                        donationId: d._id,
                        title: "Pickup Completed",
                        text: `You have picked up ${foodNameText} and started delivery.`,
                        dateStr: d.picked_at,
                        icon: "🚚",
                        tabId: "sidebarVolunteer",
                        subTabId: "volTabActive"
                    });
                }
                
                if (d.delivered_at) {
                    notifications.push({
                        id: `${d._id}_vol_delivered`,
                        donationId: d._id,
                        title: "Task Delivered Successfully",
                        text: `You delivered ${foodNameText} to ${d.ngo || 'NGO'}.`,
                        dateStr: d.delivered_at,
                        icon: "✅",
                        tabId: "sidebarVolunteer",
                        subTabId: "volTabCompleted"
                    });
                }
            }
        });
        
    } else {
        // Admin
        allDonations.forEach(d => {
            const foodNameText = Array.isArray(d.food_name) 
                ? d.food_name.map(f => typeof f === 'object' ? f.name : f).join(", ") 
                : (d.food_name || "Food");
            
            notifications.push({
                id: `${d._id}_admin_submit`,
                donationId: d._id,
                title: "Donation Submitted",
                text: `${foodNameText} submitted by ${d.donor_email || 'donor'}.`,
                dateStr: d.created_at,
                icon: "📦",
                tabId: "sidebarHome"
            });
            
            if (d.accepted_at) {
                notifications.push({
                    id: `${d._id}_admin_accepted`,
                    donationId: d._id,
                    title: "Donation Accepted",
                    text: `${foodNameText} claimed by ${d.ngo || 'NGO'}.`,
                    dateStr: d.accepted_at,
                    icon: "🤝",
                    tabId: "sidebarNGO",
                    subTabId: "ngoTabAccepted"
                });
            }
            
            if (d.picked_at) {
                notifications.push({
                    id: `${d._id}_admin_picked`,
                    donationId: d._id,
                    title: "Donation Picked Up",
                    text: `${foodNameText} picked up by ${d.volunteer || 'volunteer'}.`,
                    dateStr: d.picked_at,
                    icon: "🚚",
                    tabId: "sidebarVolunteer",
                    subTabId: "volTabActive"
                });
            }
            
            if (d.delivered_at) {
                notifications.push({
                    id: `${d._id}_admin_delivered`,
                    donationId: d._id,
                    title: "Donation Delivered",
                    text: `${foodNameText} delivered successfully.`,
                    dateStr: d.delivered_at,
                    icon: "✅",
                    tabId: "sidebarHome"
                });
            }
        });
    }
    
    // Sort
    notifications.sort((a, b) => {
        const dateA = parseCustomDate(a.dateStr);
        const dateB = parseCustomDate(b.dateStr);
        return dateB - dateA;
    });
    
    notifications = notifications.slice(0, 15);
    
    let readIds = [];
    try {
        readIds = JSON.parse(localStorage.getItem("read_notifications"));
        if (!Array.isArray(readIds)) {
            readIds = [];
        }
    } catch (e) {
        readIds = [];
    }
    
    const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;
    
    const badge = document.querySelector("#notificationBtn .notification-count");
    if (badge) {
        badge.innerText = unreadCount;
        badge.style.display = unreadCount > 0 ? "flex" : "none";
    }
    
    const newCountSpan = document.querySelector("#notificationMenu .new-count");
    if (newCountSpan) {
        newCountSpan.innerText = `${unreadCount} New`;
        
        // Mark all as read click
        newCountSpan.style.cursor = "pointer";
        newCountSpan.title = "Click to mark all as read";
        
        // Remove existing listener to prevent stacking
        const newCountClone = newCountSpan.cloneNode(true);
        newCountSpan.parentNode.replaceChild(newCountClone, newCountSpan);
        
        newCountClone.addEventListener("click", (e) => {
            e.stopPropagation();
            notifications.forEach(n => {
                if (!readIds.includes(n.id)) {
                    readIds.push(n.id);
                }
            });
            localStorage.setItem("read_notifications", JSON.stringify(readIds));
            window.loadNotifications(allDonations);
        });
    }
    
    notificationBody.innerHTML = "";
    
    if (notifications.length === 0) {
        notificationBody.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #888;">
                <i class="fa-solid fa-bell-slash" style="font-size: 24px; margin-bottom: 8px;"></i>
                <p style="font-size: 13px; margin: 0;">No notifications found</p>
            </div>
        `;
        return;
    }
    
    notifications.forEach(n => {
        const isUnread = !readIds.includes(n.id);
        const unreadStyle = isUnread ? "background-color: #f7fff8; font-weight: 550;" : "";
        
        const itemDiv = document.createElement("div");
        itemDiv.className = "notification-item";
        if (isUnread) itemDiv.classList.add("unread");
        itemDiv.style = unreadStyle;
        
        itemDiv.innerHTML = `
            <div class="notification-icon">${n.icon}</div>
            <div style="flex: 1;">
                <h4 style="margin: 0 0 4px 0; color: #1e293b; font-size: 13.5px; font-weight: 600;">${n.title}</h4>
                <p style="margin: 0 0 6px 0; color: #64748b; font-size: 12px; line-height: 1.4;">${n.text}</p>
                <small style="color: #94a3b8; font-size: 11px; display: block;"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i>${n.dateStr || 'Recent'}</small>
            </div>
        `;
        
        itemDiv.addEventListener("click", () => {
            if (isUnread) {
                readIds.push(n.id);
                localStorage.setItem("read_notifications", JSON.stringify(readIds));
            }
            
            const notifMenu = document.getElementById("notificationMenu");
            if (notifMenu) notifMenu.classList.remove("show");
            
            if (window.switchTab && n.tabId) {
                window.switchTab(n.tabId);
                
                if (userRole === "ngo" && n.subTabId) {
                    const subTabBtn = document.getElementById(n.subTabId);
                    if (subTabBtn) subTabBtn.click();
                }
                if (userRole === "volunteer" && n.subTabId) {
                    const subTabBtn = document.getElementById(n.subTabId);
                    if (subTabBtn) subTabBtn.click();
                }
            }
            
            window.viewDonationDetails(n.donationId, allDonations);
        });
        
        notificationBody.appendChild(itemDiv);
    });
};

// Deep link param verification on page load
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get("viewDonationId");
    if (viewId) {
        setTimeout(async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/donations");
                const result = await response.json();
                const donations = result.data || [];
                const donation = donations.find(d => d._id === viewId);
                if (donation) {
                    const currentRole = (localStorage.getItem("role") || "donor").toLowerCase();
                    if (currentRole === "donor") {
                        window.switchTab("sidebarMyDonations");
                    } else if (currentRole === "ngo") {
                        window.switchTab("sidebarNGO");
                        const subTabId = donation.status === "Waiting" ? "ngoTabAvailable" : "ngoTabAccepted";
                        const subTabBtn = document.getElementById(subTabId);
                        if (subTabBtn) subTabBtn.click();
                    } else if (currentRole === "volunteer") {
                        window.switchTab("sidebarVolunteer");
                        let subTabId = "volTabAvailable";
                        if (donation.status === "Picked") subTabId = "volTabActive";
                        else if (donation.status === "Delivered") subTabId = "volTabCompleted";
                        const subTabBtn = document.getElementById(subTabId);
                        if (subTabBtn) subTabBtn.click();
                    }
                    window.viewDonationDetails(donation, donations);
                }
            } catch (err) {
                console.error("Deep link error:", err);
            }
        }, 1000);
    }
})();
