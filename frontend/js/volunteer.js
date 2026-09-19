// ======================================
// State and Event Listeners
// ======================================

let activeVolTab = "Available";
const loggedInVolunteerName = localStorage.getItem("name") || "Vikas Dubey";

document.addEventListener("DOMContentLoaded", () => {
    const btnAvail = document.getElementById("volTabAvailable");
    const btnActive = document.getElementById("volTabActive");
    const btnComp = document.getElementById("volTabCompleted");

    if (btnAvail) {
        btnAvail.addEventListener("click", () => {
            activeVolTab = "Available";
            updateVolTabButtons();
            loadVolunteerTasks();
        });
    }

    if (btnActive) {
        btnActive.addEventListener("click", () => {
            activeVolTab = "Active";
            updateVolTabButtons();
            loadVolunteerTasks();
        });
    }

    if (btnComp) {
        btnComp.addEventListener("click", () => {
            activeVolTab = "Completed";
            updateVolTabButtons();
            loadVolunteerTasks();
        });
    }
});

function updateVolTabButtons() {
    const btnAvail = document.getElementById("volTabAvailable");
    const btnActive = document.getElementById("volTabActive");
    const btnComp = document.getElementById("volTabCompleted");
    if (!btnAvail || !btnActive || !btnComp) return;

    const tabs = [btnAvail, btnActive, btnComp];
    const activeBtn = activeVolTab === "Available" ? btnAvail : activeVolTab === "Active" ? btnActive : btnComp;

    tabs.forEach(tab => {
        if (tab === activeBtn) {
            tab.style.background = "#16a34a";
            tab.style.color = "white";
            tab.style.border = "none";
            tab.style.fontWeight = "600";
        } else {
            tab.style.background = "transparent";
            tab.style.color = "var(--text-light)";
            tab.style.border = "1px solid var(--border)";
            tab.style.fontWeight = "500";
        }
    });
}

// ======================================
// Load Accepted / Picked / Delivered Tasks
// ======================================

async function loadVolunteerTasks() {
    try {
        const response = await fetch("https://food-donation-ai1.onrender.com/accepted-donations");
        const result = await response.json();
        
        const container = document.getElementById("volunteerContainer");
        const taskCountEl = document.getElementById("taskCount");
        if (!container) return;

        container.innerHTML = "";

        // Today's active tasks count for this logged-in volunteer (status is Picked)
        const myActiveCount = result.data.filter(
            d => d.status === "Picked" && d.volunteer === loggedInVolunteerName
        ).length;
        
        if (taskCountEl) {
            taskCountEl.innerHTML = myActiveCount;
        }

        // Filter based on active tab
        let filtered = [];
        if (activeVolTab === "Available") {
            filtered = result.data.filter(donation => donation.status === "Accepted");
        } else if (activeVolTab === "Active") {
            filtered = result.data.filter(
                donation => donation.status === "Picked" && donation.volunteer === loggedInVolunteerName
            );
        } else {
            filtered = result.data.filter(
                donation => donation.status === "Delivered" && donation.volunteer === loggedInVolunteerName
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light); width: 100%;">
                    <h2>No Deliveries Found</h2>
                    <p style="margin-top: 10px;">Select another tab or wait for new claims from NGOs.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(donation => {
            let actionButtonHtml = "";
            if (donation.status === "Accepted") {
                actionButtonHtml = `
                    <button class="pick-btn" style="width: 100%; margin-top: 15px;" onclick="pickupFood('${donation._id}')">
                        Pick Up Food
                    </button>
                `;
            } else if (donation.status === "Picked") {
                actionButtonHtml = `
                    <button class="deliver-btn" style="width: 100%; margin-top: 15px;" onclick="deliverFood('${donation._id}')">
                        Deliver Food
                    </button>
                `;
            } else {
                actionButtonHtml = `
                    <div style="background: rgba(22, 163, 74, 0.05); border: 1px solid #16a34a; padding: 12px; border-radius: 12px; text-align: center; color: #16a34a; font-weight: 600; margin-top: 15px;">
                        <i class="fa-solid fa-circle-check"></i> Delivered Successfully
                    </div>
                `;
            }

            let statusClass = "waiting";
            if (donation.status === "Delivered") statusClass = "delivered";
            else if (donation.status === "Picked") statusClass = "picked";
            else if (donation.status === "Accepted") statusClass = "accepted";

            const foodItemsHtml = Array.isArray(donation.food_name) 
                ? donation.food_name.map(f => {
                    const name = typeof f === 'object' ? f.name : f;
                    const cat = typeof f === 'object' ? f.category : (donation.category || 'Veg');
                    const catClass = cat ? cat.toLowerCase().replace(' ', '-') : 'veg';
                    return `<span class="food-tag" style="display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-bowl-food" style="font-size: 11px;"></i>${name} <span class="card-badge category-${catClass}" style="font-size: 9px !important; padding: 2px 6px !important; margin: 0 !important; border-radius: 4px !important; display: inline-block !important; height: auto !important; line-height: 1 !important; pointer-events: none;">${cat}</span></span>`;
                }).join("") 
                : `<span class="food-tag" style="display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-bowl-food" style="font-size: 11px;"></i>${donation.food_name || ""} <span class="card-badge category-${donation.category ? donation.category.toLowerCase().replace(' ', '-') : 'veg'}" style="font-size: 9px !important; padding: 2px 6px !important; margin: 0 !important; border-radius: 4px !important; display: inline-block !important; height: auto !important; line-height: 1 !important; pointer-events: none;">${donation.category || 'Veg'}</span></span>`;

            container.innerHTML += `
                <div class="premium-card volunteer-card">
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

                    <div class="card-details-list">
                        <div class="detail-row">
                            <i class="fa-solid fa-location-dot"></i>
                            <span><b>Address:</b> ${donation.address}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-building"></i>
                            <span><b>NGO Target:</b> ${donation.ngo || donation.recommended_ngo}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-regular fa-clock"></i>
                            <span><b>Prepared:</b> ${donation.prepared_time}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fa-solid fa-hourglass-half"></i>
                            <span><b>Expiry:</b> ${donation.expiry}</span>
                        </div>
                    </div>

                    <!-- Courier logistics timeline -->
                    <div class="logistics-timeline">
                        <div class="timeline-step ${donation.accepted_at ? 'completed' : ''}">
                            <div class="step-dot"></div>
                            <div class="step-info">
                                <span class="step-label">NGO Claimed / Accepted</span>
                                <span class="step-time">${donation.accepted_at || 'Waiting'}</span>
                            </div>
                        </div>
                        <div class="timeline-step ${donation.picked_at ? 'completed' : ''}">
                            <div class="step-dot"></div>
                            <div class="step-info">
                                <span class="step-label">Picked Up by Volunteer</span>
                                <span class="step-time">${donation.picked_at || 'Awaiting Pickup'}</span>
                            </div>
                        </div>
                        <div class="timeline-step ${donation.delivered_at ? 'completed' : ''}">
                            <div class="step-dot"></div>
                            <div class="step-info">
                                <span class="step-label">Delivered safely</span>
                                <span class="step-time">${donation.delivered_at || 'In Transit'}</span>
                            </div>
                        </div>
                    </div>

                    ${actionButtonHtml}
                </div>
            `;
        });
    } catch(error) {
        console.log(error);
        alert("Cannot connect to backend.");
    }
}

// Initial Load (Only for Volunteer and Admin roles)
(function initVolunteerTasks() {
    const currentRole = (localStorage.getItem("role") || "").toLowerCase().trim();
    if (currentRole === "volunteer" || currentRole === "admin") {
        loadVolunteerTasks();
    }
})();

// ======================================
// Pickup
// ======================================

async function pickupFood(id) {
    try {
        const response = await fetch(`https://food-donation-ai1.onrender.com/pickup/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ volunteer: loggedInVolunteerName })
        });

        const data = await response.json();
        alert(data.message);

        loadVolunteerTasks();
        if (window.updateDashboardStats) window.updateDashboardStats();
    } catch (error) {
        console.log(error);
        alert("Cannot connect to backend.");
    }
}

// ======================================
// Deliver
// ======================================

async function deliverFood(id) {
    try {
        const response = await fetch(`https://food-donation-ai1.onrender.com/deliver/${id}`, {
            method: "PUT"
        });

        const data = await response.json();
        alert(data.message);

        loadVolunteerTasks();
        loadVolunteerRating();
        if (window.updateDashboardStats) window.updateDashboardStats();
    } catch (error) {
        console.log(error);
        alert("Cannot connect to backend.");
    }
}

// ======================================
// Volunteer Reviews & Ratings Logic
// ======================================

let currentVolunteerReviewsData = null;
let activeReviewFilter = "all";

async function loadVolunteerRating() {
    const email = localStorage.getItem("email");
    const volunteerName = localStorage.getItem("name") || loggedInVolunteerName;
    
    try {
        const query = email ? `email=${encodeURIComponent(email)}` : `name=${encodeURIComponent(volunteerName)}`;
        const response = await fetch(`https://food-donation-ai1.onrender.com/volunteer/reviews?${query}`);
        const data = await response.json();
        
        if (response.ok && data.status === "success") {
            currentVolunteerReviewsData = data;
            
            const ratingBox = document.getElementById("ratingBox");
            const volunteerRatingVal = document.getElementById("volunteerRatingVal");
            const volunteerRatingCount = document.getElementById("volunteerRatingCount");
            
            if (ratingBox) ratingBox.style.display = "block";
            
            if (volunteerRatingVal) {
                if (data.total_reviews > 0) {
                    volunteerRatingVal.innerHTML = `${data.average_rating.toFixed(1)} <span style="color: #d97706; font-size: 20px;">★</span>`;
                } else {
                    volunteerRatingVal.innerHTML = `N/A`;
                }
            }
            
            if (volunteerRatingCount) {
                volunteerRatingCount.innerText = `(${data.total_reviews} reviews)`;
            }
        }
    } catch (err) {
        console.error("Error loading volunteer rating:", err);
    }
}

async function openVolunteerReviewsModal() {
    const modal = document.getElementById("volunteerReviewsModal");
    if (!modal) return;
    
    modal.style.display = "flex";
    
    // Ensure we have fresh review data
    const email = localStorage.getItem("email");
    const volunteerName = localStorage.getItem("name") || loggedInVolunteerName;
    
    try {
        const query = email ? `email=${encodeURIComponent(email)}` : `name=${encodeURIComponent(volunteerName)}`;
        const response = await fetch(`https://food-donation-ai1.onrender.com/volunteer/reviews?${query}`);
        const data = await response.json();
        
        if (response.ok && data.status === "success") {
            currentVolunteerReviewsData = data;
            renderVolunteerReviewsModal(data);
        }
    } catch (err) {
        console.error("Error fetching volunteer reviews:", err);
    }
}

function closeVolunteerReviewsModal() {
    const modal = document.getElementById("volunteerReviewsModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function renderVolunteerReviewsModal(data) {
    if (!data) return;
    
    const modalVolunteerName = document.getElementById("modalVolunteerName");
    const modalBigRatingScore = document.getElementById("modalBigRatingScore");
    const modalStarIcons = document.getElementById("modalStarIcons");
    const modalRatingHeadline = document.getElementById("modalRatingHeadline");
    const modalTotalReviewsCount = document.getElementById("modalTotalReviewsCount");
    
    const modalDonorAvgScore = document.getElementById("modalDonorAvgScore");
    const modalDonorReviewCount = document.getElementById("modalDonorReviewCount");
    const modalNgoAvgScore = document.getElementById("modalNgoAvgScore");
    const modalNgoReviewCount = document.getElementById("modalNgoReviewCount");
    
    const filterAllCount = document.getElementById("filterAllCount");
    const filterDonorCount = document.getElementById("filterDonorCount");
    const filterNgoCount = document.getElementById("filterNgoCount");
    
    if (modalVolunteerName) modalVolunteerName.innerText = data.volunteer_name || "Volunteer";
    if (modalBigRatingScore) modalBigRatingScore.innerText = data.average_rating > 0 ? data.average_rating.toFixed(1) : "0.0";
    if (modalTotalReviewsCount) modalTotalReviewsCount.innerText = data.total_reviews || "0";
    
    if (modalStarIcons) {
        const fullStars = Math.round(data.average_rating || 0);
        modalStarIcons.innerText = "★".repeat(Math.max(1, Math.min(5, fullStars))) + "☆".repeat(Math.max(0, 5 - fullStars));
    }
    
    if (modalRatingHeadline) {
        if (data.average_rating >= 4.8) modalRatingHeadline.innerText = "⭐ Top Rated Logistics Volunteer";
        else if (data.average_rating >= 4.0) modalRatingHeadline.innerText = "👍 Highly Recommended Volunteer";
        else if (data.total_reviews > 0) modalRatingHeadline.innerText = "📦 Active Delivery Volunteer";
        else modalRatingHeadline.innerText = "🚀 Ready for First Delivery";
    }
    
    if (modalDonorAvgScore) modalDonorAvgScore.innerText = `${data.donor_average_rating > 0 ? data.donor_average_rating.toFixed(1) : "0.0"} ★`;
    if (modalDonorReviewCount) modalDonorReviewCount.innerText = `${data.donor_reviews_count || 0} Reviews`;
    
    if (modalNgoAvgScore) modalNgoAvgScore.innerText = `${data.ngo_average_rating > 0 ? data.ngo_average_rating.toFixed(1) : "0.0"} ★`;
    if (modalNgoReviewCount) modalNgoReviewCount.innerText = `${data.ngo_reviews_count || 0} Reviews`;
    
    if (filterAllCount) filterAllCount.innerText = data.total_reviews || 0;
    if (filterDonorCount) filterDonorCount.innerText = data.donor_reviews_count || 0;
    if (filterNgoCount) filterNgoCount.innerText = data.ngo_reviews_count || 0;
    
    filterVolunteerReviews(activeReviewFilter || "all");
}

function filterVolunteerReviews(type) {
    activeReviewFilter = type;
    
    const btnAll = document.getElementById("filterAllReviewsBtn");
    const btnDonor = document.getElementById("filterDonorReviewsBtn");
    const btnNgo = document.getElementById("filterNgoReviewsBtn");
    
    const buttons = [
        { btn: btnAll, key: "all" },
        { btn: btnDonor, key: "Donor" },
        { btn: btnNgo, key: "NGO" }
    ];
    
    buttons.forEach(({ btn, key }) => {
        if (!btn) return;
        if (activeReviewFilter === key) {
            btn.style.background = "#16a34a";
            btn.style.color = "#ffffff";
            btn.style.border = "none";
            btn.style.fontWeight = "600";
        } else {
            btn.style.background = "#f1f5f9";
            btn.style.color = "#475569";
            btn.style.border = "1px solid #e2e8f0";
            btn.style.fontWeight = "500";
        }
    });
    
    const listContainer = document.getElementById("volunteerReviewsList");
    if (!listContainer || !currentVolunteerReviewsData) return;
    
    const allReviews = currentVolunteerReviewsData.reviews || [];
    let filtered = allReviews;
    if (type === "Donor") {
        filtered = allReviews.filter(r => r.reviewer_type === "Donor");
    } else if (type === "NGO") {
        filtered = allReviews.filter(r => r.reviewer_type === "NGO");
    }
    
    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 35px 20px; background: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1;">
                <div style="font-size: 38px; color: #94a3b8; margin-bottom: 8px;">
                    <i class="fa-regular fa-comment-dots"></i>
                </div>
                <h4 style="color: #475569; margin: 0 0 5px 0; font-size: 15px;">No Reviews in this category yet</h4>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">Completed food pickups and dropoffs will appear here once verified.</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = filtered.map(rev => {
        const isDonor = rev.reviewer_type === "Donor";
        const roleIcon = isDonor ? "fa-solid fa-hand-holding-heart" : "fa-solid fa-building";
        const roleColor = isDonor ? "#16a34a" : "#2563eb";
        const roleBg = isDonor ? "rgba(22, 163, 74, 0.1)" : "rgba(37, 99, 235, 0.1)";
        const roleBorder = isDonor ? "rgba(22, 163, 74, 0.2)" : "rgba(37, 99, 235, 0.2)";
        const roleLabel = isDonor ? "Donor / Restaurant" : "NGO Partner";
        
        const starsCount = Math.round(rev.rating || 5);
        const starsText = "★".repeat(starsCount) + "☆".repeat(Math.max(0, 5 - starsCount));
        
        return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: all 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${rev.reviewer_name}</h4>
                            <span style="background: ${roleBg}; color: ${roleColor}; border: 1px solid ${roleBorder}; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px;">
                                <i class="${roleIcon}"></i> ${roleLabel}
                            </span>
                        </div>
                        <div style="font-size: 12.5px; color: #64748b; margin-top: 4px;">
                            <i class="fa-solid fa-location-dot" style="color: #94a3b8; font-size: 11px;"></i> ${rev.address || "Madurai"}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: #fef3c7; color: #d97706; border: 1px solid #fde68a; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 13px;">
                            <span>${rev.rating.toFixed(1)}</span>
                            <span style="font-size: 12px;">★</span>
                        </div>
                        <div style="color: #d97706; font-size: 11px; margin-top: 2px;">${starsText}</div>
                    </div>
                </div>

                <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12.5px;">
                    <div style="color: #334155; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-utensils" style="color: #16a34a;"></i>
                        <span><b>Food:</b> ${rev.food_name}</span>
                        <span style="color: #64748b;">(${rev.quantity} units)</span>
                    </div>
                    <div style="color: #64748b; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                        <i class="fa-regular fa-calendar-check"></i> Delivered: ${rev.delivered_at}
                    </div>
                </div>

                <div style="position: relative; padding-left: 14px; border-left: 3px solid ${roleColor};">
                    <p style="margin: 0; color: #334155; font-size: 13.5px; font-style: italic; line-height: 1.5;">
                        "${rev.feedback}"
                    </p>
                </div>
            </div>
        `;
    }).join("");
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
    const modal = document.getElementById("volunteerReviewsModal");
    if (modal && e.target === modal) {
        modal.style.display = "none";
    }
});

// Bind to window for global invocation
window.loadVolunteerRating = loadVolunteerRating;
window.openVolunteerReviewsModal = openVolunteerReviewsModal;
window.closeVolunteerReviewsModal = closeVolunteerReviewsModal;
window.filterVolunteerReviews = filterVolunteerReviews;

// Auto initialize ratings on load for Volunteer & Admin
(function initVolunteerRatingOnLoad() {
    const currentRole = (localStorage.getItem("role") || "").toLowerCase().trim();
    if (currentRole === "volunteer" || currentRole === "admin") {
        document.addEventListener("DOMContentLoaded", () => {
            loadVolunteerRating();
        });
        setTimeout(loadVolunteerRating, 150);
    }
})();