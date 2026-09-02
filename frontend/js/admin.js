let statusChart = null;
let categoryChart = null;
// =======================================
// LOAD ADMIN DASHBOARD
// =======================================

async function loadDashboard(){

    try{

        const response = await fetch(
            "http://127.0.0.1:5000/admin/dashboard"
        );

        const data = await response.json();
loadStatusChart(data);

loadCategoryChart(data);
        // Statistics

        document.getElementById("users").innerHTML =
            data.total_users;

        document.getElementById("donations").innerHTML =
            data.total_donations;

        document.getElementById("waiting").innerHTML =
            data.waiting;

        document.getElementById("accepted").innerHTML =
            data.accepted;

        document.getElementById("picked").innerHTML =
            data.picked;

        document.getElementById("delivered").innerHTML =
            data.delivered;

        // Recent Donations

        const table =
            document.getElementById("recentData");

        table.innerHTML = "";

        data.recent.forEach(item => {
            const foodNameText = Array.isArray(item.food_name) 
                ? item.food_name.map(f => typeof f === 'object' ? `${f.name} (${f.category})` : f).join(", ") 
                : (item.food_name || "");
            table.innerHTML += `

            <tr>

                <td>${foodNameText}</td>

                <td>${item.category}</td>

                <td>${item.freshness}%</td>

                <td>

                    <span class="badge ${item.ai_result.toLowerCase()}">

                        ${item.ai_result}

                    </span>

                </td>

                <td>${item.recommendation}</td>

                <td>${item.status}</td>

                <td>${item.donor_email}</td>

            </tr>

            `;

        });

    }

    catch(error){

        console.log(error);

        alert("Unable to load dashboard.");

    }

}

// =======================================
// USER VERIFICATIONS FLOW (Separated by role)
// =======================================

// Global store for base64 documents to avoid HTML markup bloat/crashes
window.adminUserDocuments = {};

async function loadVerifications() {
    try {
        const response = await fetch("http://127.0.0.1:5000/admin/users");
        const res = await response.json();
        
        if (res.status !== "success") {
            console.error("Failed to load users");
            return;
        }
        
        const donorTbody = document.getElementById("donorVerificationData");
        const ngoTbody = document.getElementById("ngoVerificationData");
        const volunteerTbody = document.getElementById("volunteerVerificationData");
        
        if (donorTbody) donorTbody.innerHTML = "";
        if (ngoTbody) ngoTbody.innerHTML = "";
        if (volunteerTbody) volunteerTbody.innerHTML = "";
        
        const usersList = res.data || [];
        
        // Reset documents store
        window.adminUserDocuments = {};
        
        let donorCount = 0;
        let ngoCount = 0;
        let volunteerCount = 0;

        usersList.forEach(user => {
            // Save document in memory if it exists
            if (user.document_image) {
                window.adminUserDocuments[user.email] = {
                    name: user.name,
                    document: user.document_image,
                    role: user.role
                };
            }

            // Build full address formatting
            let fullAddress = `
                ${user.address || '-'}<br>
                ${user.city || ''}, ${user.district || ''}<br>
                ${user.state || ''} - ${user.pincode || ''}
            `;

            let statusBadge = "";
            let actionButtons = "";
            
            if (user.status === "Pending Approval") {
                statusBadge = `<span class="badge-status badge-pending">Pending Approval</span>`;
                actionButtons = `
                    <button class="btn-action btn-approve" onclick="verifyUser('${user.email}', 'Approved')">Approve</button>
                    <button class="btn-action btn-reject" onclick="verifyUser('${user.email}', 'Rejected')">Reject</button>
                `;
            } else if (user.status === "Approved") {
                statusBadge = `<span class="badge-status badge-approved">Approved</span>`;
                actionButtons = `
                    <button class="btn-action btn-reject" onclick="verifyUser('${user.email}', 'Rejected')">Reject</button>
                `;
            } else {
                statusBadge = `<span class="badge-status badge-rejected">Rejected</span>`;
                actionButtons = `
                    <button class="btn-action btn-approve" onclick="verifyUser('${user.email}', 'Approved')">Approve</button>
                `;
            }

            let documentCol = "<span style='color:#94a3b8;'>No document</span>";
            
            if (user.role === "donor") {
                donorCount++;
                if (user.document_image) {
                    documentCol = `<button class="btn-action btn-view" onclick="viewDocument('${user.email}')">View FSSAI / Aadhar</button>`;
                }
                if (donorTbody) {
                    donorTbody.innerHTML += `
                        <tr>
                            <td><strong>${user.name}</strong></td>
                            <td>${user.email}</td>
                            <td>${user.phone || '-'}</td>
                            <td>${fullAddress}</td>
                            <td><strong>${user.donor_type || 'General'}</strong></td>
                            <td>${documentCol}</td>
                            <td>${statusBadge}</td>
                            <td>${actionButtons}</td>
                        </tr>
                    `;
                }
            } else if (user.role === "ngo") {
                ngoCount++;
                if (user.document_image) {
                    documentCol = `<button class="btn-action btn-view" onclick="viewDocument('${user.email}')">View Certificate / Aadhar</button>`;
                }
                if (ngoTbody) {
                    ngoTbody.innerHTML += `
                        <tr>
                            <td><strong>${user.ngo_name || '-'}</strong></td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.phone || '-'}</td>
                            <td>${fullAddress}</td>
                            <td><strong>${user.registration_number || '-'}</strong></td>
                            <td>${documentCol}</td>
                            <td>${statusBadge}</td>
                            <td>${actionButtons}</td>
                        </tr>
                    `;
                }
            } else if (user.role === "volunteer") {
                volunteerCount++;
                if (user.document_image) {
                    documentCol = `<button class="btn-action btn-view" onclick="viewDocument('${user.email}')">View License / Aadhar</button>`;
                }
                if (volunteerTbody) {
                    volunteerTbody.innerHTML += `
                        <tr>
                            <td><strong>${user.name}</strong></td>
                            <td>${user.email}</td>
                            <td>${user.phone || '-'}</td>
                            <td>${fullAddress}</td>
                            <td><strong>${user.vehicle || 'None'}</strong></td>
                            <td>${documentCol}</td>
                            <td>${statusBadge}</td>
                            <td>${actionButtons}</td>
                        </tr>
                    `;
                }
            }
        });

        // Insert empty rows if counts are zero
        if (donorCount === 0 && donorTbody) {
            donorTbody.innerHTML = `<tr><td colspan="8" style="padding: 20px; color: #64748b; text-align: center;">No donor registration requests found.</td></tr>`;
        }
        if (ngoCount === 0 && ngoTbody) {
            ngoTbody.innerHTML = `<tr><td colspan="9" style="padding: 20px; color: #64748b; text-align: center;">No NGO registration requests found.</td></tr>`;
        }
        if (volunteerCount === 0 && volunteerTbody) {
            volunteerTbody.innerHTML = `<tr><td colspan="8" style="padding: 20px; color: #64748b; text-align: center;">No volunteer registration requests found.</td></tr>`;
        }

    } catch (error) {
        console.error("Error loading verification requests:", error);
    }
}

window.viewDocument = function(email) {
    const docData = window.adminUserDocuments[email];
    if (!docData) return;
    
    const modal = document.getElementById("documentModal");
    const img = document.getElementById("modalDocImg");
    const title = document.getElementById("modalDocTitle");
    
    let docLabel = "Verification Document";
    if (docData.role === "volunteer") docLabel = "License / Aadhar Card";
    else if (docData.role === "ngo") docLabel = "NGO Certificate / Aadhar Card";
    else if (docData.role === "donor") docLabel = "FSSAI License / Aadhar Card";
    
    title.innerText = `${docData.name}'s ${docLabel}`;
    img.src = docData.document;
    modal.style.display = "flex";
};

window.verifyUser = async function(email, status) {
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
            loadVerifications();
            loadDashboard(); // Refresh metrics
        }
    } catch (error) {
        console.error(error);
        alert("Failed to update verification status.");
    }
};

// Close modal handlers
document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("closeDocModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.getElementById("documentModal").style.display = "none";
        });
    }

    // Close when clicking outside content
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("documentModal");
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});

// =======================================
// DONATION STATUS CHART
// =======================================

function loadStatusChart(data){
    const total = data.total_donations || 1;
    
    const deliveredRate = Math.round((data.delivered / total) * 100);
    const transitRate = Math.round((data.picked / total) * 100);
    const claimRate = Math.round(((data.accepted + data.picked + data.delivered) / total) * 100);
    
    const deliveryRateTxt = document.getElementById("deliverySuccessRateText");
    const deliveryRateBar = document.getElementById("deliverySuccessRateBar");
    if (deliveryRateTxt && deliveryRateBar) {
        deliveryRateTxt.innerText = `${deliveredRate}%`;
        deliveryRateBar.style.width = `${deliveredRate}%`;
    }
    
    const transitRateTxt = document.getElementById("transitRateText");
    const transitRateBar = document.getElementById("transitRateBar");
    if (transitRateTxt && transitRateBar) {
        transitRateTxt.innerText = `${transitRate}%`;
        transitRateBar.style.width = `${transitRate}%`;
    }
    
    const claimRateTxt = document.getElementById("claimRateText");
    const claimRateBar = document.getElementById("claimRateBar");
    if (claimRateTxt && claimRateBar) {
        claimRateTxt.innerText = `${claimRate}%`;
        claimRateBar.style.width = `${claimRate}%`;
    }
}

// =======================================
// FOOD CATEGORY CHART
// =======================================

function loadCategoryChart(data){
    const total = data.total_donations || 1;
    
    // Submitted (Waiting)
    const waiting = data.waiting || 0;
    // NGO Claimed (Accepted + Picked)
    const claimed = (data.accepted + data.picked) || 0;
    // Delivered (Completed)
    const delivered = data.delivered || 0;

    // Calculate simulated Volunteer Performance average
    // Can be: completed deliveries / (completed + picked || 1)
    const volPerf = Math.round((data.delivered / (data.delivered + data.picked || 1)) * 100);
    const volPerfClamped = Math.max(75, Math.min(volPerf, 98));
    
    const volPerfText = document.getElementById("volPerfAvgText");
    if (volPerfText) {
        volPerfText.innerText = `${volPerfClamped}%`;
    }

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(document.getElementById("categoryChart"), {
        type: "doughnut",
        data: {
            labels: [
                "Submitted (Waiting)",
                "NGO Claimed",
                "Delivered"
            ],
            datasets: [{
                data: [waiting, claimed, delivered],
                backgroundColor: [
                    "#38bdf8", // Light Blue
                    "#f43f5e", // Rose/Red
                    "#10b981"  // Emerald Green
                ],
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            cutout: "70%"
        }
    });
}

// =======================================
// ADMIN TAB SWITCHING & INITIALIZATION
// =======================================
function initAdmin() {
    // Load dashboard metrics and verification lists
    loadDashboard();
    loadVerifications();

    // Populate Admin Profile details & Sync Avatar
    const adminName = localStorage.getItem("name") || "Administrator";
    const adminEmail = localStorage.getItem("email") || "admin@smartfood.org";
    
    const sidebarAdminName = document.getElementById("sidebarAdminName");
    if (sidebarAdminName) sidebarAdminName.innerText = adminName;
    
    const topAdminName = document.getElementById("topAdminName");
    if (topAdminName) topAdminName.innerText = adminName;

    const profileAdminName = document.getElementById("profileAdminName");
    if (profileAdminName) profileAdminName.innerText = adminName;

    const settingsAdminProfileName = document.getElementById("settingsAdminProfileName");
    if (settingsAdminProfileName) settingsAdminProfileName.innerText = adminName;
    
    const adminSettingsName = document.getElementById("adminSettingsName");
    if (adminSettingsName) adminSettingsName.value = adminName;
    
    const adminSettingsEmail = document.getElementById("adminSettingsEmail");
    if (adminSettingsEmail) adminSettingsEmail.value = adminEmail;

    function updateAllAdminAvatars(src) {
        document.querySelectorAll("#sidebarAdminAvatar, #topAdminAvatar, #topMenuAdminAvatar, #settingsAdminAvatar").forEach(img => {
            img.src = src;
        });
    }

    let adminAvatar = localStorage.getItem("profile_image") || "images/logo.png";
    updateAllAdminAvatars(adminAvatar);

    async function syncAdminProfileFromServer() {
        if (!adminEmail) return;
        try {
            const response = await fetch(`http://127.0.0.1:5000/user/profile?email=${encodeURIComponent(adminEmail)}`);
            if (response.ok) {
                const res = await response.json();
                if (res.profile_image) {
                    localStorage.setItem("profile_image", res.profile_image);
                    updateAllAdminAvatars(res.profile_image);
                }
            }
        } catch (err) {
            console.error("Error syncing admin profile from server:", err);
        }
    }
    syncAdminProfileFromServer();

    const changeBtn = document.getElementById("changeAdminAvatarBtn");
    const fileInput = document.getElementById("adminProfileImageFileInput");
    if (changeBtn && fileInput) {
        changeBtn.addEventListener("click", () => {
            fileInput.click();
        });
        
        fileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 2 * 1024 * 1024) {
                alert("File size exceeds 2MB limit. Please choose a smaller image.");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result;
                updateAllAdminAvatars(base64Image);
                localStorage.setItem("profile_image", base64Image);
                
                try {
                    const response = await fetch("http://127.0.0.1:5000/user/profile/image", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: adminEmail,
                            profile_image: base64Image
                        })
                    });
                    if (response.ok) {
                        console.log("Admin profile picture synced successfully");
                    }
                } catch (err) {
                    console.error("Error updating admin profile image:", err);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Food Saving facts in admin topbar
    const foodFacts = [
        "Around 1/3 of all food produced globally is lost or wasted every year.",
        "Donating surplus food reduces landfill methane emissions, fighting climate change.",
        "Feeding people instead of landfills saves water, land, and energy resources.",
        "Every donation helps! Even small contributions can feed a family in need today.",
        "Over 800 million people suffer from hunger, while edible food is wasted.",
        "AI-powered freshness tracking safeguards beneficiaries and improves efficiency.",
        "Meal planning and proper storage can prevent up to 40% of household food waste."
    ];
    const factTextEl = document.getElementById("topbarFactText");
    if (factTextEl) {
        const randomFact = foodFacts[Math.floor(Math.random() * foodFacts.length)];
        factTextEl.innerText = randomFact;
    }

    // Tab Switching logic
    const menuItems = {
        sidebarAdminHome: "adminHomeSection",
        sidebarAdminDonors: "adminDonorsSection",
        sidebarAdminNGOs: "adminNGOsSection",
        sidebarAdminVolunteers: "adminVolunteersSection",
        sidebarAdminReports: "adminReportsSection",
        sidebarAdminSettings: "adminSettingsSection"
    };

    Object.keys(menuItems).forEach(clickedId => {
        const button = document.getElementById(clickedId);
        if (button) {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                
                // Set active sidebar item
                Object.keys(menuItems).forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) btn.classList.remove("active");
                });
                button.classList.add("active");
                
                // Show corresponding section, hide others
                Object.values(menuItems).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) section.style.display = "none";
                });
                
                const targetSection = document.getElementById(menuItems[clickedId]);
                if (targetSection) {
                    targetSection.style.display = "block";
                }
            });
        }
    });

    // Toggle Profile Menu
    const profileBtn = document.getElementById("profileBtn");
    const profileMenu = document.getElementById("profileMenu");
    
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            profileMenu.classList.toggle("active");
        });
        
        document.addEventListener("click", () => {
            if (profileMenu) profileMenu.classList.remove("active");
        });
    }

    // Connect profileSettingsBtn click to settings tab switch
    const profileSettingsBtn = document.getElementById("profileSettingsBtn");
    const sidebarAdminSettings = document.getElementById("sidebarAdminSettings");
    if (profileSettingsBtn && sidebarAdminSettings) {
        profileSettingsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            sidebarAdminSettings.click();
            profileMenu.classList.remove("active");
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmin);
} else {
    initAdmin();
}