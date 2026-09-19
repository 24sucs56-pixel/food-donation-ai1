// ======================================
// LOAD DONOR DONATIONS
// ======================================

async function loadDonorDonations(){

    try{

        const response = await fetch("https://food-donation-ai1.onrender.com/donations");

        const result = await response.json();

        const container = document.getElementById("donorContainer");

        container.innerHTML = "";

        // Dynamic donor email from localStorage with fallback
        const donorEmail = localStorage.getItem("email") || "rohan.sharma.donor@gmail.com";
        const role = (localStorage.getItem("role") || "donor").toLowerCase();

        // Admin sees all donations; donors see only their own
        let myDonations = [];
        if (role === "admin") {
            myDonations = result.data || [];
        } else {
            myDonations = result.data.filter(
                donation => donation.donor_email === donorEmail
            );
        }

        if(myDonations.length === 0){

            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light); width: 100%;">
                    <h2>No Donations Found</h2>
                    <p style="margin-top: 10px;">Select another tab or make a new donation.</p>
                </div>
            `;

            return;

        }

        myDonations.forEach(donation =>{

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

            // Calculate Volunteer Rating HTML
            let ratingHtml = "";
            if (donation.status === "Delivered" && donation.volunteer) {
                if (donation.donor_rating) {
                    ratingHtml = `
                        <div class="rating-section" style="margin-top: 15px; padding: 12px; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px;">
                            <div style="font-size: 13.5px; font-weight: 600; color: #b45309; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-star" style="color: #f59e0b;"></i>
                                <span>You rated the volunteer: <b>${donation.donor_rating} ★</b></span>
                            </div>
                        </div>
                    `;
                } else {
                    ratingHtml = `
                        <div class="rating-section" style="margin-top: 15px; padding: 12px; background: rgba(245, 158, 11, 0.03); border: 1px dashed rgba(245, 158, 11, 0.4); border-radius: 12px;">
                            <div style="font-size: 13px; font-weight: 600; color: #b45309; margin-bottom: 8px;">
                                <i class="fa-regular fa-star" style="color: #f59e0b;"></i> Rate Volunteer (${donation.volunteer}):
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${[1, 2, 3, 3.5, 4, 4.5, 5].map(val => `
                                    <button onclick="submitVolunteerRating('${donation._id}', 'donor', ${val})" style="background: white; border: 1px solid #f59e0b; color: #b45309; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11.5px; transition: all 0.2s;" onmouseover="this.style.background='#f59e0b'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#b45309';">
                                        ${val} ★
                                    </button>
                                `).join("")}
                            </div>
                        </div>
                    `;
                }
            }

            container.innerHTML += `
                <div class="premium-card donor-card">
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
                            <i class="fa-solid fa-location-dot"></i>
                            <span><b>Address:</b> ${donation.address}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-building"></i>
                            <span><b>NGO Target:</b> ${donation.ngo || donation.recommended_ngo || "-"}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-user-nurse"></i>
                            <span><b>Volunteer:</b> ${donation.volunteer ? `${donation.volunteer} ${donation.volunteer_rating ? `(${donation.volunteer_rating} ★)` : '(No ratings yet)'}` : "<i>Waiting for assignment</i>"}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-robot"></i>
                            <span><b>AI Safety:</b> ${donation.ai_result} (${donation.priority} Priority)</span>
                        </div>
                        <div class="detail-row" style="margin-top: 5px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0; font-style: italic; font-size: 12px;">
                            <i class="fa-solid fa-lightbulb" style="color: #f59e0b;"></i>
                            <span>${donation.recommendation || "Maintain storage temperature."}</span>
                        </div>
                    </div>

                    <!-- Courier logistics timeline -->
                    <div class="logistics-timeline">
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
                    </div>

                    <!-- Volunteer Rating -->
                    ${ratingHtml}
                </div>
            `;

        });

    }

    catch(error){

        console.log(error);

        alert("Cannot connect to backend.");

    }

}

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
            loadDonorDonations();
            // Also update dashboard stats if on dashboard
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

// Initial Load (Only for Donor and Admin roles)
(function initDonorDonations() {
    const currentRole = (localStorage.getItem("role") || "").toLowerCase().trim();
    if (currentRole === "donor" || currentRole === "admin") {
        loadDonorDonations();
    }
})();