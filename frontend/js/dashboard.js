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
                        const response = await fetch("https://food-donation-ai1.onrender.com/user/profile/image", {
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
    const profileEmailInit = document.getElementById("profileEmail");
    const profileRoleBadgeInit = document.getElementById("profileRoleBadge");
    const userEmailInit = localStorage.getItem("email") || "user@email.com";
    if (profileEmailInit) profileEmailInit.innerText = userEmailInit;
    if (profileRoleBadgeInit) {
        let badgeRoleText = role.toUpperCase();
        if (badgeRoleText === "ADMIN") badgeRoleText = "ADMINISTRATOR";
        profileRoleBadgeInit.innerText = badgeRoleText;
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
        donor: ["sidebarHome", "sidebarDonate", "sidebarMyDonations", "sidebarAI", "sidebarReports", "sidebarSettings", "logoutBtn"],
        ngo: ["sidebarHome", "sidebarNGO", "sidebarNgoAccepted", "sidebarNearbyDonors", "sidebarVolunteer", "sidebarReports", "sidebarSettings", "logoutBtn"],
        volunteer: ["sidebarHome", "sidebarVolunteer", "sidebarNGO", "sidebarDeliveries", "sidebarReports", "sidebarSettings", "logoutBtn"],
        admin: ["sidebarHome", "sidebarAdminUsers", "sidebarAdminNGOs", "sidebarAdminDonations", "sidebarAdminVolunteers", "sidebarReports", "sidebarSettings", "logoutBtn"]
    };

    const allowedMenus = roleMenuVisibility[role.toLowerCase()] || roleMenuVisibility.donor;
    const allMenuIds = [
        "sidebarHome", "sidebarDonate", "sidebarMyDonations", "sidebarNGO", 
        "sidebarNgoAccepted", "sidebarNearbyDonors", "sidebarVolunteer", "sidebarDeliveries", "sidebarAI", "sidebarReports", "sidebarAdminUsers", 
        "sidebarAdminNGOs", "sidebarAdminDonations", "sidebarAdminVolunteers", 
        "sidebarSettings", "logoutBtn"
    ];
    
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

    // Customize navigation labels per role
    const ngoMenuText = document.querySelector("#sidebarNGO span");
    const myDonationsMenuText = document.querySelector("#sidebarMyDonations span");
    const volunteerMenuText = document.querySelector("#sidebarVolunteer span");

    if (role.toLowerCase() === "ngo") {
        if (ngoMenuText) ngoMenuText.innerText = "Available Donations";
        if (myDonationsMenuText) myDonationsMenuText.innerText = "Accepted Donations";
        if (volunteerMenuText) volunteerMenuText.innerText = "Volunteers";
    } else if (role.toLowerCase() === "volunteer") {
        if (volunteerMenuText) volunteerMenuText.innerText = "Assigned Pickups";
        if (ngoMenuText) ngoMenuText.innerText = "Nearby Donations";
    } else if (role.toLowerCase() === "donor") {
        if (myDonationsMenuText) myDonationsMenuText.innerText = "My Donations";
    } else if (role.toLowerCase() === "admin") {
        if (myDonationsMenuText) myDonationsMenuText.innerText = "Donation Management";
    }

    // Dynamic Dashboard Card Content Filtering per Role
    function applyRoleDashboardFilters(currentRole) {
        const cardTotalDonations = document.getElementById("cardTotalDonations");
        const cardMealsSaved = document.getElementById("cardMealsSaved");
        const cardConnectedNgos = document.getElementById("cardConnectedNgos");
        const cardAiFoodSafety = document.getElementById("cardAiFoodSafety");
        const rewardsSection = document.getElementById("rewardsSection");
        const volunteerRatingCard = document.getElementById("volunteerRatingCard");

        const normalizedRole = (currentRole || "donor").toLowerCase().trim();

        if (normalizedRole === "donor") {
            if (cardTotalDonations) cardTotalDonations.style.display = "flex";
            if (cardMealsSaved) cardMealsSaved.style.display = "flex";
            if (cardConnectedNgos) cardConnectedNgos.style.display = "flex";
            if (cardAiFoodSafety) cardAiFoodSafety.style.display = "flex";
            if (rewardsSection) rewardsSection.style.display = "block";
            if (volunteerRatingCard) volunteerRatingCard.style.display = "none";
        } else if (normalizedRole === "ngo") {
            if (cardTotalDonations) cardTotalDonations.style.display = "flex";
            if (cardMealsSaved) cardMealsSaved.style.display = "flex";
            if (cardConnectedNgos) cardConnectedNgos.style.display = "flex";
            if (cardAiFoodSafety) cardAiFoodSafety.style.display = "flex";
            if (rewardsSection) rewardsSection.style.display = "none";
            if (volunteerRatingCard) volunteerRatingCard.style.display = "none";
        } else if (normalizedRole === "volunteer") {
            if (cardTotalDonations) cardTotalDonations.style.display = "flex";
            if (cardMealsSaved) cardMealsSaved.style.display = "flex";
            if (cardConnectedNgos) cardConnectedNgos.style.display = "none";
            if (cardAiFoodSafety) cardAiFoodSafety.style.display = "flex";
            if (rewardsSection) rewardsSection.style.display = "block";
            if (volunteerRatingCard) volunteerRatingCard.style.display = "block";
        } else if (normalizedRole === "admin") {
            if (cardTotalDonations) cardTotalDonations.style.display = "flex";
            if (cardMealsSaved) cardMealsSaved.style.display = "flex";
            if (cardConnectedNgos) cardConnectedNgos.style.display = "flex";
            if (cardAiFoodSafety) cardAiFoodSafety.style.display = "flex";
            if (rewardsSection) rewardsSection.style.display = "block";
            if (volunteerRatingCard) volunteerRatingCard.style.display = "block";
        }
    }
    applyRoleDashboardFilters(role);

    // ==========================
    // Logout
    // ==========================
    const logoutBtns = document.querySelectorAll("#logoutBtn, #profileLogoutBtn, .logout");
    logoutBtns.forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            alert("Logged out successfully.");
            window.location.href = "login.html";
        });
    });

    // ==========================================
    // SIDEBAR TAB SWITCHING WITH ROLE GUARDS
    // ==========================================
    const currentRole = (localStorage.getItem("role") || "donor").toLowerCase().trim();

    const sections = {
        sidebarHome: { el: document.getElementById("dashboardHomeSection"), roles: ["donor", "ngo", "volunteer", "admin"] },
        sidebarDonate: { el: document.getElementById("donateSection"), roles: ["donor", "admin"] },
        sidebarMyDonations: { el: document.getElementById("myDonationsSection"), roles: ["donor", "admin"] },
        sidebarNGO: { el: document.getElementById("ngoSection"), roles: ["ngo", "volunteer", "admin"] },
        sidebarNgoAccepted: { el: document.getElementById("ngoAcceptedSection"), roles: ["ngo", "admin"] },
        sidebarNearbyDonors: { el: document.getElementById("nearbyDonorsSection"), roles: ["ngo", "admin"] },
        sidebarVolunteer: { el: document.getElementById("volunteerSection"), roles: ["volunteer", "ngo", "admin"] },
        sidebarDeliveries: { el: document.getElementById("volunteerSection"), roles: ["volunteer", "admin"] },
        sidebarAI: { el: document.getElementById("aiSection") || document.querySelector(".ai-assistant"), roles: ["donor", "ngo", "volunteer", "admin"] },
        sidebarReports: { el: document.getElementById("reportsSection"), roles: ["donor", "ngo", "volunteer", "admin"] },
        sidebarAdminUsers: { el: document.getElementById("adminUsersSection"), roles: ["admin"] },
        sidebarAdminNGOs: { el: document.getElementById("adminUsersSection"), roles: ["admin"] },
        sidebarAdminDonations: { el: document.getElementById("myDonationsSection"), roles: ["admin"] },
        sidebarAdminVolunteers: { el: document.getElementById("adminUsersSection"), roles: ["admin"] },
        sidebarSettings: { el: document.getElementById("settingsSection"), roles: ["donor", "ngo", "volunteer", "admin"] },
        sidebarProfile: { el: document.getElementById("profileSection"), roles: ["donor", "ngo", "volunteer", "admin"] },
        profileSection: { el: document.getElementById("profileSection"), roles: ["donor", "ngo", "volunteer", "admin"] }
    };

    // ==========================================
    // MOBILE NAVIGATION DRAWER CONTROLS
    // ==========================================
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileSidebarClose = document.getElementById("mobileSidebarClose");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebar = document.querySelector(".sidebar");

    function openMobileMenu() {
        if (sidebar) sidebar.classList.add("mobile-open");
        if (sidebarOverlay) sidebarOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeMobileMenu() {
        if (sidebar) sidebar.classList.remove("mobile-open");
        if (sidebarOverlay) sidebarOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openMobileMenu();
        });
    }

    if (mobileSidebarClose) {
        mobileSidebarClose.addEventListener("click", (e) => {
            e.stopPropagation();
            closeMobileMenu();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", () => {
            closeMobileMenu();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMobileMenu();
        }
    });

    async function loadNgoVolunteersList() {
        const container = document.getElementById("ngoVolunteersContainer");
        if (!container) return;
        container.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-light);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #16a34a;"></i><p style="margin-top: 10px;">Loading volunteers network...</p></div>`;

        let volunteers = [
            { name: "Vikas Dubey", phone: "+91 98765 43210", vehicle: "Two Wheeler (Bike)", city: "Madurai", status: "Active & Available", rating: 4.9, completed: 34 },
            { name: "Arun Kumar", phone: "+91 98765 12345", vehicle: "Mini Van / Four Wheeler", city: "Madurai", status: "In Transit", rating: 4.8, completed: 28 },
            { name: "Meera Krishnan", phone: "+91 98123 45678", vehicle: "Electric Scooter", city: "Madurai", status: "Active & Available", rating: 5.0, completed: 42 },
            { name: "Rajesh Sharma", phone: "+91 97890 12345", vehicle: "Cargo Auto", city: "Madurai", status: "Active & Available", rating: 4.7, completed: 19 }
        ];

        try {
            const response = await fetch("https://food-donation-ai1.onrender.com/allusers");
            if (response.ok) {
                const users = await response.json();
                const realVols = users.filter(u => u.role === "volunteer");
                if (realVols.length > 0) {
                    volunteers = realVols.map((v, i) => ({
                        name: v.name || `Volunteer ${i+1}`,
                        phone: v.phone || "+91 98765 43210",
                        vehicle: v.vehicle || "Motorbike / Scooter",
                        city: v.city || "Madurai",
                        status: "Active & Available",
                        rating: 4.8 + (i % 3) * 0.1,
                        completed: 15 + i * 7
                    }));
                }
            }
        } catch (err) {
            console.log("Using default volunteers dataset:", err);
        }

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                ${volunteers.map(vol => `
                    <div class="premium-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 46px; height: 46px; background: rgba(22, 163, 74, 0.1); color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700;">
                                    <i class="fa-solid fa-user-check"></i>
                                </div>
                                <div>
                                    <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${vol.name}</h3>
                                    <span style="font-size: 12px; color: #16a34a; font-weight: 600;">🟢 ${vol.status}</span>
                                </div>
                            </div>
                            <span style="background: #fef3c7; color: #d97706; border: 1px solid #fde68a; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px;">
                                ${vol.rating.toFixed(1)} ★
                            </span>
                        </div>

                        <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px; margin-bottom: 15px; font-size: 13px;">
                            <div style="margin-bottom: 6px; color: #334155;"><i class="fa-solid fa-truck" style="color: #64748b; width: 20px;"></i> <b>Vehicle:</b> ${vol.vehicle}</div>
                            <div style="margin-bottom: 6px; color: #334155;"><i class="fa-solid fa-phone" style="color: #64748b; width: 20px;"></i> <b>Contact:</b> ${vol.phone}</div>
                            <div style="color: #334155;"><i class="fa-solid fa-circle-check" style="color: #16a34a; width: 20px;"></i> <b>Deliveries Completed:</b> ${vol.completed}</div>
                        </div>

                        <a href="tel:${vol.phone.replace(/[^0-9+]/g, '')}" class="submit-btn" style="width: 100%; padding: 10px; margin: 0; background: #16a34a; text-align: center; text-decoration: none; display: block; font-size: 13px; font-weight: 600;">
                            <i class="fa-solid fa-phone" style="margin-right: 6px;"></i> Call Volunteer for Pickup
                        </a>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function switchTab(clickedId) {
        const activeRole = (localStorage.getItem("role") || "donor").toLowerCase().trim();
        const target = sections[clickedId];
        if (!target) return;

        // Auto close mobile drawer and profile dropdown on selection
        closeMobileMenu();
        const pm = document.getElementById("profileMenu");
        if (pm) pm.classList.remove("show", "active");

        // Check Role Guard (Admin has access to everything)
        const isAuthorized = activeRole === "admin" || target.roles.includes(activeRole);

        // Deactivate all menu items
        document.querySelectorAll(".menu li").forEach(item => item.classList.remove("active"));
        
        // Activate clicked item
        const clickedItem = document.getElementById(clickedId);
        if (clickedItem) clickedItem.classList.add("active");

        // Hide all known main dashboard sections strictly
        const allDashSectionIds = [
            "dashboardHomeSection", "donateSection", "myDonationsSection",
            "ngoSection", "ngoAcceptedSection", "nearbyDonorsSection",
            "volunteerSection", "reportsSection", "adminUsersSection",
            "settingsSection", "profileSection", "aiSection", "unauthorizedSection"
        ];
        allDashSectionIds.forEach(secId => {
            const sec = document.getElementById(secId);
            if (sec) sec.style.setProperty("display", "none", "important");
        });
        Object.values(sections).forEach(sec => {
            if (sec.el) sec.el.style.setProperty("display", "none", "important");
        });

        if (!target.el) {
            const sectionMap = {
                sidebarHome: "dashboardHomeSection",
                sidebarDonate: "donateSection",
                sidebarMyDonations: "myDonationsSection",
                sidebarNGO: "ngoSection",
                sidebarNgoAccepted: "ngoAcceptedSection",
                sidebarNearbyDonors: "nearbyDonorsSection",
                sidebarVolunteer: "volunteerSection",
                sidebarDeliveries: "volunteerSection",
                sidebarReports: "reportsSection",
                sidebarSettings: "settingsSection",
                sidebarProfile: "profileSection",
                sidebarAI: "aiSection",
                aiSection: "aiSection",
                ai: "aiSection",
                profileSection: "profileSection",
                profile: "profileSection",
                myProfile: "profileSection"
            };
            if (sectionMap[clickedId]) {
                target.el = document.getElementById(sectionMap[clickedId]);
            }
        }

        if (isAuthorized) {
            // Show target section cleanly
            if (target.el) {
                target.el.style.setProperty("display", "block", "important");
                
                if ((clickedId === "sidebarSettings" || clickedId === "profileSection" || clickedId === "sidebarProfile") && typeof loadFullUserProfile === "function") {
                    loadFullUserProfile();
                }

                // SPECIAL LOGIC FOR VOLUNTEER SECTION BASED ON ROLE
                if (clickedId === "sidebarVolunteer") {
                    const volDashView = document.querySelector("#volunteerSection .volunteer-dashboard-view");
                    const ngoVolView = document.querySelector("#volunteerSection .ngo-volunteers-view");

                    if (activeRole === "ngo") {
                        if (volDashView) volDashView.style.display = "none";
                        if (ngoVolView) ngoVolView.style.display = "block";
                        loadNgoVolunteersList();
                    } else if (activeRole === "volunteer" || activeRole === "admin") {
                        if (ngoVolView) ngoVolView.style.display = "none";
                        if (volDashView) volDashView.style.display = "block";
                        if (typeof loadVolunteerTasks === "function") loadVolunteerTasks();
                        if (typeof loadVolunteerRating === "function") loadVolunteerRating();
                    }
                }
                
                // Reload tab contents dynamically to fetch fresh data
                if ((clickedId === "sidebarMyDonations" || clickedId === "sidebarAdminDonations") && typeof loadDonorDonations === "function") {
                    loadDonorDonations();
                } else if (clickedId === "sidebarNGO" && typeof loadDonations === "function") {
                    loadDonations();
                } else if (clickedId === "sidebarNgoAccepted" && typeof loadNgoAcceptedDonations === "function") {
                    loadNgoAcceptedDonations();
                } else if (clickedId === "sidebarNearbyDonors" && typeof loadNearbyDonors === "function") {
                    loadNearbyDonors();
                } else if ((clickedId === "sidebarAdminUsers" || clickedId === "sidebarAdminNGOs" || clickedId === "sidebarAdminVolunteers") && typeof loadAdminUsersVerification === "function") {
                    loadAdminUsersVerification();
                }
                
                // Special fix for Leaflet map display issues when shown
                if (clickedId === "sidebarDonate" && typeof pickupMap !== "undefined" && pickupMap) {
                    setTimeout(() => {
                        pickupMap.invalidateSize();
                    }, 250);
                } else if (clickedId === "sidebarNearbyDonors" && typeof nearbyDonorsMapInstance !== "undefined" && nearbyDonorsMapInstance) {
                    setTimeout(() => {
                        nearbyDonorsMapInstance.invalidateSize();
                    }, 250);
                } else if (clickedId === "sidebarHome" && window.donationChartInstance) {
                    setTimeout(() => {
                        window.donationChartInstance.resize();
                    }, 100);
                }
            }
        } else {
            // Quiet fallback to home dashboard without displaying any error banner
            const homeTarget = sections["sidebarHome"];
            if (homeTarget && homeTarget.el) {
                homeTarget.el.style.display = "block";
            }
        }
    }
    window.switchTab = switchTab;
    window.navigateToSection = function(targetId) {
        switchTab(targetId);
    };

    // Attach listeners to sidebar items
    Object.keys(sections).forEach(id => {
        const item = document.getElementById(id);
        if (item) {
            item.addEventListener("click", () => switchTab(id));
        }
    });

    // ==========================================
    // FULL ROLE-AWARE USER PROFILE LOGIC
    // ==========================================
    async function loadFullUserProfile() {
        const userEmail = localStorage.getItem("email");
        const activeRole = (localStorage.getItem("role") || "donor").toLowerCase().trim();

        if (!userEmail) return;

        try {
            const res = await fetch(`https://food-donation-ai1.onrender.com/user/profile?email=${encodeURIComponent(userEmail)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "success") {
                    // Update LocalStorage with server profile truth
                    if (data.name) localStorage.setItem("name", data.name);
                    if (data.role) localStorage.setItem("role", data.role);
                    if (data.profile_image) {
                        localStorage.setItem("profile_image", data.profile_image);
                    }

                    // Update UI Labels
                    const nameVal = data.name || localStorage.getItem("name") || "User";
                    const roleVal = (data.role || activeRole).toUpperCase();

                    if (userName) userName.innerText = nameVal;
                    if (userRole) userRole.innerText = roleVal;
                    if (sidebarUser) sidebarUser.innerText = nameVal;
                    if (profileName) profileName.innerText = nameVal;
                    if (profileRole) profileRole.innerText = roleVal;

                    const profileEmailEl = document.getElementById("profileEmail");
                    if (profileEmailEl) profileEmailEl.innerText = data.email || userEmail;

                    const profileRoleBadgeEl = document.getElementById("profileRoleBadge");
                    if (profileRoleBadgeEl) {
                        let roleBadgeText = roleVal;
                        if (roleVal.toLowerCase() === "admin") roleBadgeText = "ADMINISTRATOR";
                        profileRoleBadgeEl.innerText = roleBadgeText;
                    }

                    const settingsNameInput = document.getElementById("settingsName");
                    const settingsEmailInput = document.getElementById("settingsEmail");
                    const settingsRoleInput = document.getElementById("settingsRole");
                    const settingsPhoneInput = document.getElementById("settingsPhone");
                    const settingsAddressInput = document.getElementById("settingsAddress");
                    const settingsCityInput = document.getElementById("settingsCity");
                    const settingsPincodeInput = document.getElementById("settingsPincode");
                    const settingsProfileNameHeader = document.getElementById("settingsProfileName");

                    if (settingsNameInput) settingsNameInput.value = nameVal;
                    if (settingsEmailInput) settingsEmailInput.value = data.email || userEmail;
                    if (settingsRoleInput) settingsRoleInput.value = roleVal;
                    if (settingsPhoneInput) settingsPhoneInput.value = data.phone || "";
                    if (settingsAddressInput) settingsAddressInput.value = data.address || "";
                    if (settingsCityInput) settingsCityInput.value = data.city || "";
                    if (settingsPincodeInput) settingsPincodeInput.value = data.pincode || "";
                    if (settingsProfileNameHeader) settingsProfileNameHeader.innerText = nameVal;

                    // Achievement Stats
                    const settingsPointsEl = document.getElementById("settingsPoints");
                    const settingsRankEl = document.getElementById("settingsRank");
                    const settingsPrizeEl = document.getElementById("settingsPrize");
                    const settingsStatusEl = document.getElementById("settingsStatus");

                    if (settingsPointsEl) settingsPointsEl.innerText = data.points || 0;
                    if (settingsRankEl) settingsRankEl.innerText = data.certificate || "Contributor";
                    if (settingsPrizeEl) settingsPrizeEl.innerText = data.prize || "None";
                    if (settingsStatusEl) {
                        settingsStatusEl.innerText = data.user_status || "Approved";
                        settingsStatusEl.style.color = (data.user_status === "Approved") ? "#16a34a" : "#d97706";
                    }

                    // Role Specific Inputs Display & Value Assignment
                    const donorFields = document.getElementById("settingsDonorFields");
                    const ngoFields = document.getElementById("settingsNgoFields");
                    const volunteerFields = document.getElementById("settingsVolunteerFields");

                    if (donorFields) donorFields.style.display = (activeRole === "donor") ? "block" : "none";
                    if (ngoFields) ngoFields.style.display = (activeRole === "ngo") ? "flex" : "none";
                    if (volunteerFields) volunteerFields.style.display = (activeRole === "volunteer") ? "block" : "none";

                    if (activeRole === "donor") {
                        const donorTypeSelect = document.getElementById("settingsDonorType");
                        if (donorTypeSelect && data.donor_type) donorTypeSelect.value = data.donor_type;
                    } else if (activeRole === "ngo") {
                        const ngoNameInput = document.getElementById("settingsNgoName");
                        const regNumInput = document.getElementById("settingsRegNumber");
                        if (ngoNameInput) ngoNameInput.value = data.ngo_name || "";
                        if (regNumInput) regNumInput.value = data.registration_number || "";
                    } else if (activeRole === "volunteer") {
                        const vehicleSelect = document.getElementById("settingsVehicle");
                        if (vehicleSelect && data.vehicle) vehicleSelect.value = data.vehicle;
                    }

                    // Update Avatars
                    let avatarImage = data.profile_image || localStorage.getItem("profile_image");
                    if (!avatarImage) {
                        avatarImage = "images/user1.png";
                        if (activeRole === "ngo") avatarImage = "images/user2.png";
                        else if (activeRole === "volunteer") avatarImage = "images/user3.png";
                        else if (activeRole === "admin") avatarImage = "images/logo.png";
                    }
                    updateAllAvatars(avatarImage);
                }
            }
        } catch (err) {
            console.error("Error loading user profile:", err);
        }
    }
    loadFullUserProfile();

    // Edit Profile Toggle Handler
    const editProfileBtn = document.getElementById("editProfileBtn");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const profileSaveContainer = document.getElementById("profileSaveContainer");
    const profileSaveMsg = document.getElementById("profileSaveMsg");

    let isEditingProfile = false;

    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => {
            isEditingProfile = !isEditingProfile;
            const editableInputs = document.querySelectorAll("#profileEditForm input:not(#settingsEmail):not(#settingsRole), #profileEditForm select");
            
            editableInputs.forEach(input => {
                input.disabled = !isEditingProfile;
            });

            if (isEditingProfile) {
                editProfileBtn.style.background = "#dc2626";
                editProfileBtn.innerHTML = `<i class="fa-solid fa-xmark"></i> Cancel`;
                if (profileSaveContainer) profileSaveContainer.style.display = "block";
            } else {
                editProfileBtn.style.background = "#2563eb";
                editProfileBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit`;
                if (profileSaveContainer) profileSaveContainer.style.display = "none";
            }
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", async () => {
            const userEmail = localStorage.getItem("email");
            const activeRole = (localStorage.getItem("role") || "donor").toLowerCase().trim();

            if (!userEmail) return;

            saveProfileBtn.disabled = true;
            saveProfileBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

            const payload = {
                email: userEmail,
                name: document.getElementById("settingsName")?.value || "",
                phone: document.getElementById("settingsPhone")?.value || "",
                address: document.getElementById("settingsAddress")?.value || "",
                city: document.getElementById("settingsCity")?.value || "",
                pincode: document.getElementById("settingsPincode")?.value || ""
            };

            if (activeRole === "donor") {
                payload.donor_type = document.getElementById("settingsDonorType")?.value || "";
            } else if (activeRole === "ngo") {
                payload.ngo_name = document.getElementById("settingsNgoName")?.value || "";
                payload.registration_number = document.getElementById("settingsRegNumber")?.value || "";
            } else if (activeRole === "volunteer") {
                payload.vehicle = document.getElementById("settingsVehicle")?.value || "";
            }

            try {
                const res = await fetch("https://food-donation-ai1.onrender.com/user/profile/update", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-User-Email": userEmail
                    },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                if (res.ok && result.status === "success") {
                    if (result.name) localStorage.setItem("name", result.name);
                    
                    if (profileSaveMsg) {
                        profileSaveMsg.style.display = "block";
                        profileSaveMsg.style.background = "#dcfce7";
                        profileSaveMsg.style.color = "#15803d";
                        profileSaveMsg.innerText = "✓ Profile updated successfully!";
                        setTimeout(() => { profileSaveMsg.style.display = "none"; }, 4000);
                    }

                    // Reload full profile to sync all UI elements
                    await loadFullUserProfile();

                    // Re-lock form inputs
                    if (editProfileBtn) editProfileBtn.click();
                } else {
                    if (profileSaveMsg) {
                        profileSaveMsg.style.display = "block";
                        profileSaveMsg.style.background = "#fee2e2";
                        profileSaveMsg.style.color = "#dc2626";
                        profileSaveMsg.innerText = result.message || "Failed to update profile";
                    }
                }
            } catch (err) {
                console.error("Profile save error:", err);
                if (profileSaveMsg) {
                    profileSaveMsg.style.display = "block";
                    profileSaveMsg.style.background = "#fee2e2";
                    profileSaveMsg.style.color = "#dc2626";
                    profileSaveMsg.innerText = "Error connecting to server.";
                }
            } finally {
                saveProfileBtn.disabled = false;
                saveProfileBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Profile Changes`;
            }
        });
    }

    // ==========================================
    // TOPBAR PROFILE MENU DROPDOWN & MODALS
    // ==========================================
    function positionProfileMenu() {
        const btn = document.getElementById("profileBtn");
        const menu = document.getElementById("profileMenu");
        if (!btn || !menu) return;

        const rect = btn.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        menu.style.position = "fixed";
        menu.style.top = (rect.bottom + 8) + "px";
        
        const rightDist = viewportWidth - rect.right;
        if (rightDist < 12) {
            menu.style.right = "12px";
        } else {
            menu.style.right = rightDist + "px";
        }
        menu.style.left = "auto";
        
        if (viewportWidth <= 768) {
            menu.style.width = "min(280px, calc(100vw - 24px))";
        } else {
            menu.style.width = "280px";
        }
    }

    const profileBtn = document.getElementById("profileBtn");
    const profileMenu = document.getElementById("profileMenu");
    const profileOverlay = document.getElementById("profileOverlay");

    function closeProfileMenu() {
        if (profileMenu) profileMenu.classList.remove("show", "active");
        if (profileOverlay) profileOverlay.classList.remove("show", "active");
    }

    function openProfileMenu() {
        if (!profileMenu) return;
        positionProfileMenu();
        profileMenu.classList.add("show", "active");
        if (profileOverlay) profileOverlay.classList.add("show", "active");
    }

    if (profileBtn && profileMenu) {
        profileMenu.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        let isTouchHandled = false;
        profileBtn.addEventListener("touchend", (e) => {
            e.preventDefault();
            e.stopPropagation();
            isTouchHandled = true;
            const isOpen = profileMenu.classList.contains("show") || profileMenu.classList.contains("active");
            if (isOpen) {
                closeProfileMenu();
            } else {
                openProfileMenu();
            }
            setTimeout(() => { isTouchHandled = false; }, 400);
        });

        profileBtn.addEventListener("click", (e) => {
            if (isTouchHandled) return;
            e.stopPropagation();
            const isOpen = profileMenu.classList.contains("show") || profileMenu.classList.contains("active");
            if (isOpen) {
                closeProfileMenu();
            } else {
                openProfileMenu();
            }
        });

        if (profileOverlay) {
            profileOverlay.addEventListener("click", () => {
                closeProfileMenu();
            });
        }

        document.addEventListener("click", (e) => {
            if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
                closeProfileMenu();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeProfileMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (profileMenu.classList.contains("show") || profileMenu.classList.contains("active")) {
                positionProfileMenu();
            }
        });
    }

    const profileMenuEditProfile = document.getElementById("profileMenuEditProfile");
    if (profileMenuEditProfile) {
        profileMenuEditProfile.addEventListener("click", (e) => {
            e.preventDefault();
            closeProfileMenu();
            if (typeof switchTab === "function") switchTab("profileSection");
        });
    }

    const profileMenuChangePassword = document.getElementById("profileMenuChangePassword");
    const changePasswordModal = document.getElementById("changePasswordModal");
    const closeChangePasswordModal = document.getElementById("closeChangePasswordModal");

    if (profileMenuChangePassword && changePasswordModal) {
        profileMenuChangePassword.addEventListener("click", (e) => {
            e.preventDefault();
            closeProfileMenu();
            changePasswordModal.style.display = "flex";
        });
    }

    if (closeChangePasswordModal && changePasswordModal) {
        closeChangePasswordModal.addEventListener("click", () => {
            changePasswordModal.style.display = "none";
        });
    }

    const profileMenuHelp = document.getElementById("profileMenuHelp");
    const helpCenterModal = document.getElementById("helpCenterModal");
    const closeHelpCenterModal = document.getElementById("closeHelpCenterModal");

    if (profileMenuHelp && helpCenterModal) {
        profileMenuHelp.addEventListener("click", (e) => {
            e.preventDefault();
            closeProfileMenu();
            helpCenterModal.style.display = "flex";
        });
    }

    if (closeHelpCenterModal && helpCenterModal) {
        closeHelpCenterModal.addEventListener("click", () => {
            helpCenterModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === changePasswordModal) {
            changePasswordModal.style.display = "none";
        }
        if (e.target === helpCenterModal) {
            helpCenterModal.style.display = "none";
        }
    });

    // ==========================================
    // CHANGE PASSWORD FORM HANDLER
    // ==========================================
    const changePasswordForm = document.getElementById("changePasswordForm");
    const changePasswordMsg = document.getElementById("changePasswordMsg");
    const savePasswordBtn = document.getElementById("savePasswordBtn");

    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = localStorage.getItem("email");
            const currentPassword = document.getElementById("currentPasswordInput")?.value || "";
            const newPassword = document.getElementById("newPasswordInput")?.value || "";
            const confirmPassword = document.getElementById("confirmPasswordInput")?.value || "";

            if (!email) {
                if (changePasswordMsg) {
                    changePasswordMsg.style.display = "block";
                    changePasswordMsg.style.background = "#fee2e2";
                    changePasswordMsg.style.color = "#dc2626";
                    changePasswordMsg.innerText = "Error: User session not found. Please log in again.";
                }
                return;
            }

            if (newPassword !== confirmPassword) {
                if (changePasswordMsg) {
                    changePasswordMsg.style.display = "block";
                    changePasswordMsg.style.background = "#fee2e2";
                    changePasswordMsg.style.color = "#dc2626";
                    changePasswordMsg.innerText = "New password and confirm password do not match.";
                }
                return;
            }

            if (newPassword.length < 6) {
                if (changePasswordMsg) {
                    changePasswordMsg.style.display = "block";
                    changePasswordMsg.style.background = "#fee2e2";
                    changePasswordMsg.style.color = "#dc2626";
                    changePasswordMsg.innerText = "New password must be at least 6 characters long.";
                }
                return;
            }

            if (savePasswordBtn) {
                savePasswordBtn.disabled = true;
                savePasswordBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Updating...`;
            }

            try {
                const response = await fetch("https://food-donation-ai1.onrender.com/user/change-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        current_password: currentPassword,
                        new_password: newPassword
                    })
                });

                const result = await response.json();

                if (response.ok && result.status === "success") {
                    if (changePasswordMsg) {
                        changePasswordMsg.style.display = "block";
                        changePasswordMsg.style.background = "#dcfce7";
                        changePasswordMsg.style.color = "#15803d";
                        changePasswordMsg.innerText = "✓ Password changed successfully!";
                    }
                    document.getElementById("currentPasswordInput").value = "";
                    document.getElementById("newPasswordInput").value = "";
                    document.getElementById("confirmPasswordInput").value = "";
                    setTimeout(() => {
                        if (changePasswordModal) changePasswordModal.style.display = "none";
                        if (changePasswordMsg) changePasswordMsg.style.display = "none";
                    }, 2000);
                } else {
                    if (changePasswordMsg) {
                        changePasswordMsg.style.display = "block";
                        changePasswordMsg.style.background = "#fee2e2";
                        changePasswordMsg.style.color = "#dc2626";
                        changePasswordMsg.innerText = result.message || "Failed to change password.";
                    }
                }
            } catch (err) {
                console.error("Change password error:", err);
                if (changePasswordMsg) {
                    changePasswordMsg.style.display = "block";
                    changePasswordMsg.style.background = "#fee2e2";
                    changePasswordMsg.style.color = "#dc2626";
                    changePasswordMsg.innerText = "Error connecting to server.";
                }
            } finally {
                if (savePasswordBtn) {
                    savePasswordBtn.disabled = false;
                    savePasswordBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Update Password`;
                }
            }
        });
    }

    // ==========================================
    // UPDATE DASHBOARD STATS WITH REAL DATA
    // ==========================================
    async function updateDashboardStats() {
        try {
            const response = await fetch("https://food-donation-ai1.onrender.com/donations");
            if (!response.ok) return;
            const result = await response.json();
            const allDonations = result.data || [];

            const userEmail = localStorage.getItem("email");
            const activeRole = (localStorage.getItem("role") || "donor").toLowerCase().trim();

            let roleDonations = allDonations;
            if (activeRole === "donor" && userEmail) {
                roleDonations = allDonations.filter(d => d.donor_email === userEmail);
            }

            // 1. Total Donations
            const totalDonations = roleDonations.length;
            const totalDonationsEl = document.getElementById("totalDonations");
            if (totalDonationsEl) {
                totalDonationsEl.innerText = totalDonations;
                totalDonationsEl.setAttribute("data-target", totalDonations);
            }

            // 2. Meals Saved (sum of quantity of all delivered donations)
            const deliveredDonations = roleDonations.filter(d => d.status === "Delivered");
            const mealsSaved = deliveredDonations.reduce((sum, d) => sum + parseInt(d.quantity || 0), 0);
            const mealsSavedEl = document.getElementById("mealsSaved");
            if (mealsSavedEl) {
                mealsSavedEl.innerText = mealsSaved;
                mealsSavedEl.setAttribute("data-target", mealsSaved);
            }

            // 3. Connected NGOs
            const activeNgos = new Set();
            roleDonations.forEach(d => {
                if (d.ngo) activeNgos.add(d.ngo);
                if (d.recommended_ngo) activeNgos.add(d.recommended_ngo);
            });
            const connectedNgos = activeNgos.size || (activeRole === "donor" ? (roleDonations.length > 0 ? activeNgos.size : 0) : 4);
            const connectedNgosEl = document.getElementById("connectedNgos");
            if (connectedNgosEl) {
                connectedNgosEl.innerText = connectedNgos;
                connectedNgosEl.setAttribute("data-target", connectedNgos);
            }

            // 4. AI Food Safety (average freshness percentage)
            const freshDonations = roleDonations.filter(d => typeof d.freshness === "number");
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



});
/*=========================================
        DONATION ANALYTICS CHART
=========================================*/

const chartCanvas = document.getElementById("donationChart");

if (chartCanvas && typeof Chart !== "undefined") {

    window.donationChartInstance = new Chart(chartCanvas, {

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

    // Auto-resize chart on window resize and mobile orientation change
    window.addEventListener("resize", () => {
        if (window.donationChartInstance) {
            window.donationChartInstance.resize();
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
        const response = await fetch("https://food-donation-ai1.onrender.com/donations");
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
// USER PROFILE POPULATION ENGINE
// =======================================
async function loadFullUserProfile() {
    const email = localStorage.getItem("email") || "";
    const role = (localStorage.getItem("role") || "donor").toLowerCase().trim();
    const name = localStorage.getItem("name") || "User";

    // Set header banner info
    const settingsProfileName = document.getElementById("settingsProfileName");
    if (settingsProfileName) settingsProfileName.innerText = name;

    const profileName = document.getElementById("profileName");
    if (profileName) profileName.innerText = name;

    const userName = document.getElementById("userName");
    if (userName) userName.innerText = name;

    const userRole = document.getElementById("userRole");
    if (userRole) userRole.innerText = role.toUpperCase();

    const profileRole = document.getElementById("profileRole");
    if (profileRole) profileRole.innerText = role.toUpperCase();

    // Set form fields
    const settingsName = document.getElementById("settingsName");
    if (settingsName) settingsName.value = name;

    const settingsEmail = document.getElementById("settingsEmail");
    if (settingsEmail) settingsEmail.value = email;

    const settingsRole = document.getElementById("settingsRole");
    if (settingsRole) settingsRole.value = role.toUpperCase();

    // Toggle role-specific fields
    const donorFields = document.getElementById("settingsDonorFields");
    const ngoFields = document.getElementById("settingsNgoFields");
    const volFields = document.getElementById("settingsVolunteerFields");

    if (donorFields) donorFields.style.display = role === "donor" ? "block" : "none";
    if (ngoFields) ngoFields.style.display = role === "ngo" ? "flex" : "none";
    if (volFields) volFields.style.display = role === "volunteer" ? "block" : "none";

    // Fetch live user data from server API
    if (email) {
        try {
            const res = await fetch(`https://food-donation-ai1.onrender.com/user/profile?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "success") {
                    if (data.name) {
                        localStorage.setItem("name", data.name);
                        if (settingsProfileName) settingsProfileName.innerText = data.name;
                        if (settingsName) settingsName.value = data.name;
                    }
                    const settingsPhone = document.getElementById("settingsPhone");
                    if (settingsPhone) settingsPhone.value = data.phone || "";

                    const settingsAddress = document.getElementById("settingsAddress");
                    if (settingsAddress) settingsAddress.value = data.address || "";

                    const settingsCity = document.getElementById("settingsCity");
                    if (settingsCity) settingsCity.value = data.city || "Madurai";

                    const settingsPincode = document.getElementById("settingsPincode");
                    if (settingsPincode) settingsPincode.value = data.pincode || "625001";

                    if (role === "donor") {
                        const donorType = document.getElementById("settingsDonorType");
                        if (donorType && data.donor_type) donorType.value = data.donor_type;
                    } else if (role === "ngo") {
                        const ngoName = document.getElementById("settingsNgoName");
                        if (ngoName) ngoName.value = data.ngo_name || data.name || "";
                        const regNum = document.getElementById("settingsRegNumber");
                        if (regNum) regNum.value = data.reg_number || "";
                    } else if (role === "volunteer") {
                        const vehicle = document.getElementById("settingsVehicle");
                        if (vehicle && data.vehicle) vehicle.value = data.vehicle;
                    }

                    if (data.profile_image) {
                        localStorage.setItem("profile_image", data.profile_image);
                        if (typeof updateAllAvatars === "function") updateAllAvatars(data.profile_image);
                    }
                }
            }
        } catch (err) {
            console.warn("Could not fetch server profile data:", err);
        }
    }

    if (typeof loadUserProfileAndRewards === "function") {
        loadUserProfileAndRewards();
    }
}
window.loadFullUserProfile = loadFullUserProfile;

// =======================================
// REWARDS & CERTIFICATIONS MANAGEMENT
// =======================================
async function loadUserProfileAndRewards() {
    const userEmail = localStorage.getItem("email");
    const userRole = (localStorage.getItem("role") || "").toLowerCase();
    
    if (!userEmail) return;
    
    try {
        const response = await fetch(`https://food-donation-ai1.onrender.com/user/profile?email=${encodeURIComponent(userEmail)}`);
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
        const response = await fetch("https://food-donation-ai1.onrender.com/admin/users");
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
        const response = await fetch("https://food-donation-ai1.onrender.com/admin/users/verify", {
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
                const response = await fetch("https://food-donation-ai1.onrender.com/donations");
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

// ==========================================
// NGO DEDICATED MODULES: ACCEPTED DONATIONS & NEARBY DONORS
// ==========================================

async function loadNgoAcceptedDonations() {
    const container = document.getElementById("ngoAcceptedContainer");
    if (!container) return;

    container.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-light);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #16a34a;"></i><p style="margin-top: 10px;">Loading your accepted donations...</p></div>`;

    const loggedInNgo = localStorage.getItem("name") || "Demo NGO Trust";

    try {
        const response = await fetch("https://food-donation-ai1.onrender.com/donations");
        if (response.ok) {
            const result = await response.json();
            const allDonations = result.data || [];
            // Filter accepted/claimed donations for this NGO
            const accepted = allDonations.filter(d => 
                (d.ngo === loggedInNgo || d.ngo === "Demo NGO Trust" || d.ngo === "Helping Hands NGO") && 
                ["Accepted", "Picked", "Delivered", "In Transit"].includes(d.status)
            );

            if (accepted.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                        <i class="fa-solid fa-box-open" style="font-size: 40px; color: #94a3b8; margin-bottom: 12px;"></i>
                        <h3 style="margin: 0; color: #334155; font-size: 18px;">No Accepted Donations Yet</h3>
                        <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Browse Available Donations to claim food for your NGO.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${accepted.map(d => {
                        let statusClass = "progress";
                        if (d.status === "Delivered") statusClass = "delivered";

                        const foodNameText = Array.isArray(d.food_name) 
                            ? d.food_name.map(f => typeof f === 'object' ? f.name : f).join(", ") 
                            : (d.food_name || "Food Items");

                        return `
                            <div class="premium-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                    <div>
                                        <span class="card-badge category-veg" style="background: #e0f2fe; color: #0284c7; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${d.category || 'Surplus Food'}</span>
                                        <h3 style="margin: 6px 0 0 0; font-size: 17px; font-weight: 700; color: #0f172a;">${foodNameText}</h3>
                                    </div>
                                    <span class="status ${statusClass}" style="padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                                        ${d.status}
                                    </span>
                                </div>

                                <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px; margin-bottom: 0px; font-size: 13px;">
                                    <div style="margin-bottom: 6px; color: #334155;"><i class="fa-solid fa-users" style="color: #64748b; width: 20px;"></i> <b>Quantity:</b> ${d.quantity || 50} servings</div>
                                    <div style="margin-bottom: 6px; color: #334155;"><i class="fa-solid fa-user-heart" style="color: #64748b; width: 20px;"></i> <b>Donor:</b> ${d.donor_email ? d.donor_email.split('@')[0] : 'Murugan Idli Shop'}</div>
                                    <div style="margin-bottom: 6px; color: #334155;"><i class="fa-solid fa-location-dot" style="color: #16a34a; width: 20px;"></i> <b>Pickup Address:</b> ${d.address || 'Madurai Central'}</div>
                                    <div style="color: #334155;"><i class="fa-solid fa-truck" style="color: #0284c7; width: 20px;"></i> <b>Logistics:</b> ${d.volunteer ? `${d.volunteer} (Assigned)` : 'Waiting for Volunteer Assignment'}</div>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            `;
        }
    } catch (err) {
        console.error("Error loading accepted donations:", err);
    }
}

let nearbyDonorsMapInstance = null;

async function loadNearbyDonors() {
    const container = document.getElementById("nearbyDonorsContainer");
    if (!container) return;

    container.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-light);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #16a34a;"></i><p style="margin-top: 10px;">Finding donors near your location...</p></div>`;

    const nearbyDonorsList = [
        { name: "Rohan Sharma (Individual Donor)", address: "Plot 14, Anna Nagar, Madurai", distance: "1.8 km", availableFood: "Rice Meals", category: "Veg", quantity: "50 portions", phone: "+91 98765 43210", lat: 9.9252, lng: 78.1198 },
        { name: "Murugan Idli Shop", address: "194 West Masi Street, Madurai", distance: "2.4 km", availableFood: "Idli & Sambar", category: "Veg", quantity: "80 portions", phone: "+91 98421 45671", lat: 9.9195, lng: 78.1193 },
        { name: "Priya Patel", address: "Green Meadows, Tallakulam, Madurai", distance: "3.1 km", availableFood: "Veg Meals & Chapathi", category: "Veg", quantity: "35 portions", phone: "+91 98420 11998", lat: 9.9380, lng: 78.1380 },
        { name: "Kumar Mess & Catering", address: "80 Feet Road, KK Nagar, Madurai", distance: "3.9 km", availableFood: "Vegetable Biryani", category: "Veg", quantity: "100 portions", phone: "+91 98432 12345", lat: 9.9280, lng: 78.1450 },
        { name: "Modern Supermarket & Fresh Bakery", address: "Mattuthavani, Madurai", distance: "4.5 km", availableFood: "Fresh Bread & Bakery Items", category: "Bakery", quantity: "60 items", phone: "+91 97900 11224", lat: 9.9520, lng: 78.1520 }
    ];

    // Initialize or resize map
    setTimeout(() => {
        const mapEl = document.getElementById("nearbyDonorsMap");
        if (mapEl && typeof L !== "undefined") {
            if (!nearbyDonorsMapInstance) {
                nearbyDonorsMapInstance = L.map("nearbyDonorsMap").setView([9.9252, 78.1198], 13);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(nearbyDonorsMapInstance);

                // Add donor markers
                nearbyDonorsList.forEach(donor => {
                    L.marker([donor.lat, donor.lng])
                        .addTo(nearbyDonorsMapInstance)
                        .bindPopup(`<b>${donor.name}</b><br>${donor.availableFood} (${donor.quantity})<br>📍 ${donor.distance} away`);
                });
            }
            nearbyDonorsMapInstance.invalidateSize();
        }
    }, 250);

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${nearbyDonorsList.map(donor => `
                <div class="premium-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 44px; height: 44px; background: rgba(22, 163, 74, 0.1); color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700;">
                                <i class="fa-solid fa-store"></i>
                            </div>
                            <div>
                                <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${donor.name}</h3>
                                <span style="font-size: 12px; color: #16a34a; font-weight: 600;">📍 ${donor.distance} away</span>
                            </div>
                        </div>
                        <span style="background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;">
                            ${donor.category}
                        </span>
                    </div>

                    <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px; margin-bottom: 15px; font-size: 13px;">
                        <div style="margin-bottom: 6px; color: #334155;"><i class="fa-solid fa-bowl-food" style="color: #64748b; width: 20px;"></i> <b>Available Food:</b> ${donor.availableFood}</div>
                        <div style="margin-bottom: 6px; color: #334155;"><i class="fa-solid fa-layer-group" style="color: #64748b; width: 20px;"></i> <b>Quantity:</b> ${donor.quantity}</div>
                        <div style="color: #334155;"><i class="fa-solid fa-location-dot" style="color: #16a34a; width: 20px;"></i> <b>Location:</b> ${donor.address}</div>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button onclick="document.getElementById('sidebarNGO').click()" class="submit-btn" style="flex: 1; padding: 10px; margin: 0; background: #16a34a; font-size: 12.5px; font-weight: 600;">
                            <i class="fa-solid fa-eye" style="margin-right: 4px;"></i> View Donations
                        </button>
                        <a href="tel:${donor.phone.replace(/[^0-9+]/g, '')}" class="submit-btn" style="flex: 1; padding: 10px; margin: 0; background: #0284c7; text-align: center; text-decoration: none; display: block; font-size: 12.5px; font-weight: 600;">
                            <i class="fa-solid fa-phone" style="margin-right: 4px;"></i> Call Donor
                        </a>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

window.loadNgoAcceptedDonations = loadNgoAcceptedDonations;
window.loadNearbyDonors = loadNearbyDonors;
