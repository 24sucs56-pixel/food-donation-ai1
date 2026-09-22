// ======================================
// State and Event Listeners
// ======================================

let activeNgoTab = "Available";
const loggedInNgoName = localStorage.getItem("name") || "Helping Hands NGO";

document.addEventListener("DOMContentLoaded", () => {
    const btnAvail = document.getElementById("ngoTabAvailable");
    const btnAcc = document.getElementById("ngoTabAccepted");

    if (btnAvail) {
        btnAvail.addEventListener("click", () => {
            activeNgoTab = "Available";
            updateNgoTabButtons();
            loadDonations();
        });
    }

    if (btnAcc) {
        btnAcc.addEventListener("click", () => {
            activeNgoTab = "Accepted";
            updateNgoTabButtons();
            loadDonations();
        });
    }
});

function updateNgoTabButtons() {
    const btnAvail = document.getElementById("ngoTabAvailable");
    const btnAcc = document.getElementById("ngoTabAccepted");
    if (!btnAvail || !btnAcc) return;

    if (activeNgoTab === "Available") {
        btnAvail.style.background = "#16a34a";
        btnAvail.style.color = "white";
        btnAvail.style.border = "none";
        btnAvail.style.fontWeight = "600";

        btnAcc.style.background = "transparent";
        btnAcc.style.color = "var(--text-light)";
        btnAcc.style.border = "1px solid var(--border)";
        btnAcc.style.fontWeight = "500";
    } else {
        btnAcc.style.background = "#16a34a";
        btnAcc.style.color = "white";
        btnAcc.style.border = "none";
        btnAcc.style.fontWeight = "600";

        btnAvail.style.background = "transparent";
        btnAvail.style.color = "var(--text-light)";
        btnAvail.style.border = "1px solid var(--border)";
        btnAvail.style.fontWeight = "500";
    }
}

// ======================================
// Load Donations
// ======================================

async function loadDonations() {
    try {
        const response = await fetch("https://food-donation-ai1.onrender.com/donations");
        const result = await response.json();
        const container = document.getElementById("donationContainer");
        if (!container) return;

        container.innerHTML = "";

        let filtered = [];
        if (activeNgoTab === "Available") {
            filtered = result.data.filter(donation => donation.status === "Waiting");
        } else {
            // Match both exact NGO name and recommended NGO as fallback if NGO name matches
            filtered = result.data.filter(donation => 
                donation.ngo === loggedInNgoName || 
                (donation.status !== "Waiting" && donation.ngo === loggedInNgoName)
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light); width: 100%;">
                    <h2>No Food Donations Found</h2>
                    <p style="margin-top: 10px;">Check back later or explore other sections.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(donation => {
            let actionHtml = "";
            
            if (activeNgoTab === "Available") {
                actionHtml = `
                    <button
                        class="accept-btn"
                        style="width: 100%; margin-top: 15px;"
                        onclick="acceptDonation('${donation._id}')">
                        Accept Donation
                    </button>
                `;
            } else {
                // Show status timeline in claim history tab
                let statusClass = "pending";
                if (donation.status === "Delivered") statusClass = "delivered";
                else if (donation.status === "Picked" || donation.status === "Accepted") statusClass = "progress";
                
                let ratingHtml = "";
                if (donation.status === "Delivered" && donation.volunteer) {
                    if (donation.ngo_rating) {
                        ratingHtml = `
                            <div class="rating-section" style="margin-top: 10px; padding: 10px; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px;">
                                <div style="font-size: 12.5px; font-weight: 600; color: #b45309; display: flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-star" style="color: #f59e0b;"></i>
                                    <span>You rated the volunteer: <b>${donation.ngo_rating} ★</b></span>
                                </div>
                            </div>
                        `;
                    } else {
                        ratingHtml = `
                            <div class="rating-section" style="margin-top: 10px; padding: 10px; background: rgba(245, 158, 11, 0.03); border: 1px dashed rgba(245, 158, 11, 0.4); border-radius: 8px;">
                                <div style="font-size: 12.5px; font-weight: 600; color: #b45309; margin-bottom: 6px;">
                                    <i class="fa-regular fa-star" style="color: #f59e0b;"></i> Rate Volunteer (${donation.volunteer}):
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${[1, 2, 3, 3.5, 4, 4.5, 5].map(val => `
                                        <button onclick="submitVolunteerRating('${donation._id}', 'ngo', ${val})" style="background: white; border: 1px solid #f59e0b; color: #b45309; padding: 3px 6px; border-radius: 5px; cursor: pointer; font-weight: 600; font-size: 11px; transition: all 0.2s;" onmouseover="this.style.background='#f59e0b'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#b45309';">
                                            ${val} ★
                                        </button>
                                    `).join("")}
                                </div>
                            </div>
                        `;
                    }
                }

                let volunteerReqHtml = "";
                if (donation.status === "Delivered") {
                    if (donation.ngo_delivery_confirmation === "Confirmed") {
                        volunteerReqHtml = `
                            <div style="margin-top: 10px; padding: 10px; background: rgba(22, 163, 74, 0.08); border: 1px solid #16a34a; border-radius: 8px; color: #15803d; font-size: 13px; font-weight: 600;">
                                <i class="fa-solid fa-circle-check"></i> Delivery Confirmed (${donation.ngo_confirmed_at || 'Confirmed'})
                            </div>
                        `;
                    } else {
                        volunteerReqHtml = `
                            <div style="margin-top: 10px; padding: 12px; background: rgba(59, 130, 246, 0.08); border: 1px solid #3b82f6; border-radius: 8px;">
                                <div style="font-size: 13px; font-weight: 600; color: #1d4ed8; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                                    <span><i class="fa-solid fa-truck-ramp-box"></i> Delivery Confirmation</span>
                                    <span class="card-badge" style="background: #3b82f6; color: white;">Delivered by Volunteer</span>
                                </div>
                                <p style="font-size: 12.5px; color: #1e40af; margin-bottom: 8px;">
                                    Volunteer <b>${donation.volunteer || 'Assigned Volunteer'}</b> delivered this food on <b>${donation.delivered_at || 'recently'}</b>.
                                </p>
                                <button onclick="confirmDelivery('${donation._id}')" class="accept-btn" style="width: 100%; font-size: 13px; padding: 8px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                                    <i class="fa-solid fa-check-double"></i> Confirm Delivery
                                </button>
                            </div>
                        `;
                    }
                } else if (donation.volunteer_status === "Requested" && donation.requested_volunteer) {
                    volunteerReqHtml = `
                        <div style="margin-top: 10px; padding: 12px; background: rgba(234, 179, 8, 0.08); border: 1px solid #eab308; border-radius: 8px;">
                            <div style="font-size: 13px; font-weight: 600; color: #854d0e; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                                <span><i class="fa-solid fa-hand-raising"></i> Volunteer Pickup Request</span>
                                <span class="card-badge" style="background: #eab308; color: white;">Requested</span>
                            </div>
                            <p style="font-size: 13px; color: #713f12; margin-bottom: 8px;">
                                <b>${donation.requested_volunteer}</b> requested to pick up this food donation.
                            </p>
                            <button onclick="approveVolunteer('${donation._id}')" class="accept-btn" style="width: 100%; font-size: 13px; padding: 8px; background: #16a34a; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                                <i class="fa-solid fa-user-check"></i> Accept Volunteer
                            </button>
                        </div>
                    `;
                } else if (donation.volunteer_status === "Approved") {
                    volunteerReqHtml = `
                        <div style="margin-top: 10px; padding: 10px; background: rgba(22, 163, 74, 0.08); border: 1px solid #16a34a; border-radius: 8px; color: #15803d; font-size: 13px; font-weight: 600;">
                            <i class="fa-solid fa-circle-check"></i> Volunteer Approved: ${donation.volunteer}
                        </div>
                    `;
                }

                actionHtml = `
                    <div style="background: var(--bg); padding: 15px; border-radius: 12px; margin-top: 15px; border: 1px solid var(--border);">
                        <h4 style="color: #15803d; font-size: 14px; margin-bottom: 8px;">Claim Details</h4>
                        <p style="font-size: 13px; color: var(--text-light); margin-bottom: 4px;">
                            <b>Volunteer:</b> ${donation.volunteer ? `${donation.volunteer} ${donation.volunteer_rating ? `(${donation.volunteer_rating} ★)` : '(No ratings yet)'}` : (donation.requested_volunteer ? `${donation.requested_volunteer} (Pending Approval)` : "<i>Waiting for assignment</i>")}
                        </p>
                        <p style="font-size: 13px; color: var(--text-light); margin-bottom: 4px;">
                            <b>Accepted At:</b> ${donation.accepted_at || "-"}
                        </p>
                        <p style="font-size: 13px; color: var(--text-light); margin-bottom: 4px;">
                            <b>Picked At:</b> ${donation.picked_at || "-"}
                        </p>
                        <p style="font-size: 13px; color: var(--text-light); margin-bottom: 8px;">
                            <b>Delivered At:</b> ${donation.delivered_at || "-"}
                        </p>
                        ${volunteerReqHtml}
                        ${ratingHtml}
                    </div>
                `;
            }

            let statusClass = "waiting";
            if (donation.status === "Delivered") statusClass = "delivered";
            else if (donation.status === "Picked") statusClass = "picked";
            else if (donation.status === "Accepted") statusClass = "accepted";

            let freshnessColorClass = "fresh-high";
            if (donation.freshness < 50) freshnessColorClass = "fresh-low";
            else if (donation.freshness < 80) freshnessColorClass = "fresh-med";

            const foodItemsHtml = Array.isArray(donation.food_name) 
                ? donation.food_name.map(f => {
                    const name = typeof f === 'object' ? f.name : f;
                    const cat = typeof f === 'object' ? f.category : (donation.category || 'Veg');
                    const catClass = cat ? cat.toLowerCase().replace(' ', '-') : 'veg';
                    return `<span class="food-tag" style="display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-bowl-food" style="font-size: 11px;"></i>${name} <span class="card-badge category-${catClass}" style="font-size: 9px !important; padding: 2px 6px !important; margin: 0 !important; border-radius: 4px !important; display: inline-block !important; height: auto !important; line-height: 1 !important; pointer-events: none;">${cat}</span></span>`;
                }).join("") 
                : `<span class="food-tag" style="display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-bowl-food" style="font-size: 11px;"></i>${donation.food_name || ""} <span class="card-badge category-${donation.category ? donation.category.toLowerCase().replace(' ', '-') : 'veg'}" style="font-size: 9px !important; padding: 2px 6px !important; margin: 0 !important; border-radius: 4px !important; display: inline-block !important; height: auto !important; line-height: 1 !important; pointer-events: none;">${donation.category || 'Veg'}</span></span>`;

            container.innerHTML += `
                <div class="premium-card ngo-card">
                    <div class="card-header">
                        <div>
                            <span class="card-badge category-${donation.category.toLowerCase().replace(' ', '-')}">${donation.category}</span>
                            <h2 class="card-title" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px !important; line-height: 1.6 !important;">${foodItemsHtml}</h2>
                        </div>
                        <span class="status-badge ${statusClass}">${donation.status}</span>
                    </div>
                    
                    <div class="card-stats-grid">
                        <div class="stat-item">
                            <i class="fa-solid fa-weight-hanging"></i>
                            <div>
                                <span class="stat-label">Quantity</span>
                                <span class="stat-val">${donation.quantity} units</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fa-solid fa-snowflake"></i>
                            <div>
                                <span class="stat-label">Storage</span>
                                <span class="stat-val">${donation.storage}</span>
                            </div>
                        </div>
                    </div>

                    <div class="freshness-section">
                        <div class="freshness-header">
                            <span>Freshness Index</span>
                            <span class="freshness-val ${freshnessColorClass}">${donation.freshness}%</span>
                        </div>
                        <div class="freshness-bar-bg">
                            <div class="freshness-bar-fill ${freshnessColorClass}" style="width: ${donation.freshness}%"></div>
                        </div>
                    </div>

                    <div class="card-details-list">
                        <div class="detail-row">
                            <i class="fa-regular fa-clock"></i>
                            <span><b>Prepared:</b> ${donation.prepared_time}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-hourglass-half"></i>
                            <span><b>Expiry:</b> ${donation.expiry}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-location-dot"></i>
                            <span><b>Address:</b> ${donation.address}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-robot"></i>
                            <span><b>AI Safety:</b> ${donation.ai_result} (${donation.priority} Priority)</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-route"></i>
                            <span><b>Distance:</b> ${donation.distance}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-building-circle-check"></i>
                            <span><b>NGO Target:</b> ${donation.recommended_ngo || "-"}</span>
                        </div>
                        <div class="detail-row" style="margin-top: 5px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0; font-style: italic;">
                            <i class="fa-solid fa-lightbulb" style="color: #f59e0b;"></i>
                            <span>${donation.recommendation || "Deliver immediately to save food waste."}</span>
                        </div>
                    </div>

                    ${actionHtml}
                </div>
            `;
        });
    } catch(error) {
        console.log(error);
        alert("Cannot connect to Flask server.");
    }
}

// Initial Load (Only for NGO and Admin roles)
(function initNgoDonations() {
    const currentRole = (localStorage.getItem("role") || "").toLowerCase().trim();
    if (currentRole === "ngo" || currentRole === "admin") {
        loadDonations();
    }
})();

// ======================================
// Accept Button
// ======================================

async function acceptDonation(id) {
    try {
        const response = await fetch(`https://food-donation-ai1.onrender.com/accept/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ngo: loggedInNgoName })
        });

        const data = await response.json();
        alert(data.message);

        // Reload the grid
        loadDonations();
        if (window.updateDashboardStats) window.updateDashboardStats();
    } catch (error) {
        console.log(error);
        alert("Cannot connect to backend.");
    }
}
window.acceptDonation = acceptDonation;

async function approveVolunteer(id) {
    try {
        const response = await fetch(`https://food-donation-ai1.onrender.com/ngo/approve-volunteer/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        alert(data.message);

        loadDonations();
        if (window.updateDashboardStats) window.updateDashboardStats();
    } catch (error) {
        console.log(error);
        alert("Cannot connect to backend.");
    }
}
window.approveVolunteer = approveVolunteer;

async function confirmDelivery(id) {
    try {
        const response = await fetch(`https://food-donation-ai1.onrender.com/ngo/confirm-delivery/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ngo: loggedInNgoName })
        });

        const data = await response.json();
        alert(data.message);

        loadDonations();
        if (window.updateDashboardStats) window.updateDashboardStats();
    } catch (error) {
        console.log(error);
        alert("Cannot connect to backend.");
    }
}
window.confirmDelivery = confirmDelivery;

async function submitVolunteerRating(donationId, role, ratingValue) {
    if (!confirm(`Rate the volunteer ${ratingValue} stars?`)) return;
    try {
        const response = await fetch(`https://food-donation-ai1.onrender.com/rate-volunteer/${donationId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role: role, rating: ratingValue })
        });
        const result = await response.json();
        alert(result.message);
        if (response.ok) {
            if (typeof loadDonations === "function") {
                loadDonations();
            }
            if (typeof loadDonorDonations === "function") {
                loadDonorDonations();
            }
            if (window.updateDashboardStats) {
                window.updateDashboardStats();
            }
        }
    } catch (err) {
        console.error("Error rating volunteer:", err);
        alert("Failed to submit rating.");
    }
}
window.submitVolunteerRating = submitVolunteerRating;