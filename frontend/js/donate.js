/*=========================================
        IMAGE PREVIEW
=========================================*/

const image = document.getElementById("foodImage");
const preview = document.getElementById("previewImage");

if(image){

image.addEventListener("change", function(){

const file = this.files[0];

if(file){

preview.src = URL.createObjectURL(file);

preview.style.display = "block";

}

});

}

/*=========================================
        DONATION FORM
=========================================*/

/*=========================================
        AI FOOD SAFETY
=========================================*/

const prepared=document.getElementById("preparedTime");

const expiry = document.getElementById("expiry");
if(prepared && expiry){

    prepared.addEventListener("change", calculateAI);

    expiry.addEventListener("change", calculateAI);

}
function calculateAI(){

if(prepared.value==="" || expiry.value==="") return;

const p=prepared.value.split(":");

const e=expiry.value.split(":");

const prepareMinutes=parseInt(p[0])*60+parseInt(p[1]);

const expiryMinutes=parseInt(e[0])*60+parseInt(e[1]);

const diff=expiryMinutes-prepareMinutes;

let freshness=0;

let status="";

let recommendation="";

if(diff>=360){

freshness=96;

status="Excellent";

recommendation="Food is safe for donation.";

}

else if(diff>=240){

freshness=85;

status="Good";

recommendation="Donate as soon as possible.";

}

else if(diff>=120){

freshness=65;

status="Average";

recommendation="Deliver within 1 hour.";

}

else{

freshness=30;

status="Unsafe";

recommendation="Not recommended for donation.";

}

document.getElementById("freshness").innerHTML=freshness+"%";

document.getElementById("foodStatus").innerHTML=status;

document.getElementById("recommendation").innerHTML=recommendation;

}
// [Form submission logic consolidated in the unified handler at the bottom of the file]
// ==========================================
// AI FOOD SAFETY VARIABLES
// ==========================================
const getFoodCategoryValue = () => { const el = document.querySelector(".foodCategoryInput"); return el ? el.value : ""; };
const storage = document.getElementById("storage");

const preparedDate = document.getElementById("preparedDate");
const preparedTime = document.getElementById("preparedTime");
const preparedPeriod = document.getElementById("preparedPeriod");

const expiryDate = document.getElementById("expiryDate");
const expiryTime = document.getElementById("expiryTime");
const expiryPeriod = document.getElementById("expiryPeriod");

const freshness = document.getElementById("freshness");
const foodStatus = document.getElementById("foodStatus");
const recommendation = document.getElementById("recommendation");
// ==========================================================
// CONVERT 12-HOUR TIME TO 24-HOUR TIME
// ==========================================================
function convertTo24Hour(time, period) {

    let [hour, minute] = time.split(":").map(Number);

    if (period === "AM" && hour === 12) {
        hour = 0;
    }

    if (period === "PM" && hour !== 12) {
        hour += 12;
    }

    return {
        hour,
        minute
    };
}
// ==========================================================
// AI FOOD ANALYSIS
// ==========================================================
function analyzeFood() {

    if (
        !storage ||
        !preparedDate ||
        !preparedTime ||
        !preparedPeriod ||
        !expiryDate ||
        !expiryTime ||
        !expiryPeriod
    ) {
        console.error("AI: Required elements not found");
        return;
    }

    const categoryVal = getFoodCategoryValue();

    // Check all required values
    if (
        !categoryVal ||
        !storage.value ||
        !preparedDate.value ||
        !preparedTime.value ||
        !expiryDate.value ||
        !expiryTime.value
    ) {
        return;
    }

    // ==========================
    // CONVERT PREPARED TIME
    // ==========================

    const prep = convertTo24Hour(
        preparedTime.value,
        preparedPeriod.value
    );

    // ==========================
    // CONVERT EXPIRY TIME
    // ==========================

    const exp = convertTo24Hour(
        expiryTime.value,
        expiryPeriod.value
    );

    // ==========================
    // CREATE REAL DATE/TIME
    // ==========================

    const preparationDateTime = new Date(
        preparedDate.value + "T" +
        String(prep.hour).padStart(2, "0") + ":" +
        String(prep.minute).padStart(2, "0")
    );

    const expiryDateTime = new Date(
        expiryDate.value + "T" +
        String(exp.hour).padStart(2, "0") + ":" +
        String(exp.minute).padStart(2, "0")
    );

    // ==========================
    // VALIDATE DATES
    // ==========================

    if (expiryDateTime <= preparationDateTime) {

        freshness.innerText = "--";

        foodStatus.innerText = "❌ Invalid";

        recommendation.innerText =
            "Expiry date/time must be after preparation date/time.";

        return;
    }

    // ==========================
    // CURRENT TIME
    // ==========================

    const now = new Date();

    // ==========================
    // FOOD TOTAL LIFE
    // ==========================

    const totalLife =
        expiryDateTime - preparationDateTime;

    // ==========================
    // TIME ALREADY PASSED
    // ==========================

    const elapsed =
        now - preparationDateTime;

    // ==========================
    // CHECK IF NOT PREPARED YET
    // ==========================

    if (elapsed < 0) {

        freshness.innerText = "--";

        foodStatus.innerText = "⏳ Upcoming";

        recommendation.innerText =
            "Preparation time has not been reached yet.";

        return;
    }

    // ==========================
    // CHECK IF EXPIRED
    // ==========================

    if (now >= expiryDateTime) {

        freshness.innerText = "0%";

        foodStatus.innerText = "❌ Expired";

        recommendation.innerText =
            "Food has passed its expiry time. Do not donate.";

        return;
    }

    // ==========================
    // REMAINING TIME
    // ==========================

    const remaining =
        expiryDateTime - now;

    const totalHours =
        totalLife / (1000 * 60 * 60);

    const remainingHours =
        remaining / (1000 * 60 * 60);

    // ==========================
    // TIME PROGRESS
    // ==========================

    let freshnessScore =
        (remaining / totalLife) * 100;

    // ==========================
    // FOOD CATEGORY
    // ==========================

    if (categoryVal === "Non Veg" ||
        categoryVal === "Non-Veg") {

        freshnessScore -= 10;

    }
    else if (categoryVal === "Veg") {

        freshnessScore -= 2;

    }

    // ==========================
    // STORAGE
    // ==========================

    if (storage.value === "Room Temperature") {

        freshnessScore -= 10;

    }
    else if (
        storage.value === "Refrigerated" ||
        storage.value === "Refrigerator"
    ) {

        freshnessScore += 3;

    }
    else if (storage.value === "Frozen") {

        freshnessScore += 5;

    }

    // Keep between 0 and 100

    freshnessScore = Math.round(
        Math.max(0, Math.min(100, freshnessScore))
    );

    // ==========================
    // DISPLAY FRESHNESS
    // ==========================

    freshness.innerText =
        freshnessScore + "%";

    // ==========================
    // FOOD STATUS
    // ==========================

    if (remainingHours <= 0) {

        foodStatus.innerText = "❌ Expired";

        recommendation.innerText =
            "Food has expired. Do not donate.";

    }
    else if (remainingHours <= 1) {

        foodStatus.innerText =
            "🔴 Near Expiry";

        recommendation.innerText =
            "Less than 1 hour remaining. Donate immediately if food has been stored safely.";

    }
    else if (freshnessScore >= 75) {

        foodStatus.innerText =
            "✅ Fresh";

        recommendation.innerText =
            "Food appears fresh. Donate as soon as possible.";

    }
    else if (freshnessScore >= 50) {

        foodStatus.innerText =
            "⚠ Moderate";

        recommendation.innerText =
            "Food is approaching expiry. Prioritize donation.";

    }
    else {

        foodStatus.innerText =
            "⚠ Low Freshness";

        recommendation.innerText =
            "Food is close to expiry. Donate immediately if safe.";

    }

    // ==========================
    // CONSOLE INFORMATION
    // ==========================

    console.log(
        "Prepared:",
        preparedDate.value,
        preparedTime.value,
        preparedPeriod.value
    );

    console.log(
        "Expiry:",
        expiryDate.value,
        expiryTime.value,
        expiryPeriod.value
    );

    console.log(
        "Remaining:",
        remainingHours.toFixed(2),
        "hours"
    );

    console.log(
        "Freshness:",
        freshnessScore + "%"
    );
}
// ==========================================================
// RUN AI WHEN TIME / FOOD DATA CHANGES
// ==========================================================
const foodInputListEl = document.getElementById("foodInputList");
if (foodInputListEl) {
    foodInputListEl.addEventListener("change", (e) => {
        if (e.target && e.target.classList.contains("foodCategoryInput")) {
            analyzeFood();
        }
    });
}

storage.addEventListener("change", analyzeFood);

preparedDate.addEventListener("change", analyzeFood);
preparedTime.addEventListener("change", analyzeFood);
preparedPeriod.addEventListener("change", analyzeFood);

expiryDate.addEventListener("change", analyzeFood);
expiryTime.addEventListener("change", analyzeFood);
expiryPeriod.addEventListener("change", analyzeFood);
// ==========================================
// FOOD IMAGE PREVIEW
// ==========================================

const foodImage = document.getElementById("foodImage");
const previewImage = document.getElementById("previewImage");

if (foodImage && previewImage) {

    foodImage.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            previewImage.style.display = "none";
            return;
        }

        if (!file.type.startsWith("image/")) {

            alert("Please select a valid image.");

            this.value = "";

            previewImage.style.display = "none";

            return;
        }

        const imageURL = URL.createObjectURL(file);

        previewImage.src = imageURL;

        previewImage.style.display = "block";

    });

}

// ==========================================
// COMPLETE PICKUP LOCATION SYSTEM
// ==========================================

let pickupMap;
let pickupMarker = null;

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const locationSearchInput = document.getElementById("locationSearch");
const addressInput = locationSearchInput;
const searchLocationBtn = document.getElementById("searchLocationBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");

// Initialize Leaflet Map
function initLeafletMap() {
    if (typeof L === "undefined") {
        console.error("Leaflet library not loaded");
        return;
    }

    // Fix Leaflet's default marker icon paths (broken on standard script CDN load)
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const defaultLocation = [9.9252, 78.1198]; // Madurai, Tamil Nadu, India

    pickupMap = L.map('map').setView(defaultLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(pickupMap);

    // Solves the incomplete tile rendering bug by repeatedly forcing size recalculations during grid layout render
    const invalidator = function () {
        if (pickupMap) {
            pickupMap.invalidateSize();
        }
    };

    [100, 300, 600, 1000, 1500, 2000, 3000].forEach(function (delay) {
        setTimeout(invalidator, delay);
    });

    if (document.readyState === "complete") {
        setTimeout(invalidator, 500);
    } else {
        window.addEventListener("load", function () {
            setTimeout(invalidator, 500);
        });
    }

    // Trigger size recalculation on interactions to ensure full rendering
    pickupMap.on("focus", invalidator);
    pickupMap.on("mouseover", invalidator);
    pickupMap.on("click", invalidator);

    // Populate initial coordinates
    if (latitudeInput) latitudeInput.value = defaultLocation[0].toFixed(6);
    if (longitudeInput) longitudeInput.value = defaultLocation[1].toFixed(6);

    // Create marker
    pickupMarker = L.marker(defaultLocation, {
        draggable: true,
        title: "Drag me to your pickup location"
    }).addTo(pickupMap);

    // Update coordinates when marker is dragged and dropped
    pickupMarker.on("dragend", function () {
        const position = pickupMarker.getLatLng();
        updateSelectedLocation(position.lat, position.lng, true, false);
    });

    // Move marker and update coordinates when map is clicked
    pickupMap.on("click", function (event) {
        if (event.latlng) {
            updateSelectedLocation(event.latlng.lat, event.latlng.lng, true, false);
        }
    });

    // Address Search button
    if (searchLocationBtn) {
        searchLocationBtn.addEventListener("click", searchPickupLocation);
    }

    // Address Search Enter key support
    if (locationSearchInput) {
        locationSearchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent accidental form submission
                searchPickupLocation();
            }
        });
    }

    // Geolocation / Current Location button
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener("click", function () {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            const originalHTML = currentLocationBtn.innerHTML;
            currentLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Requesting Location...';
            currentLocationBtn.disabled = true;

            // Success callback
            const successCallback = function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                updateSelectedLocation(lat, lng, true, true, 16);

                currentLocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Location Selected';
                currentLocationBtn.disabled = false;

                setTimeout(() => {
                    currentLocationBtn.innerHTML = originalHTML;
                }, 3000);
            };

            // Error callback
            const errorCallback = function (error) {
                console.error("Geolocation error:", error);
                let errMsg = "Unable to retrieve your location.";
                if (error.code === error.PERMISSION_DENIED) {
                    errMsg = "Location permission denied. Please enable location services in your browser settings.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errMsg = "Location information is unavailable.";
                } else if (error.code === error.TIMEOUT) {
                    errMsg = "The request to get user location timed out.";
                }
                alert(errMsg);
                currentLocationBtn.innerHTML = originalHTML;
                currentLocationBtn.disabled = false;
            };

            // Attempt precise geolocation first
            navigator.geolocation.getCurrentPosition(
                successCallback,
                function (err) {
                    // Fallback to lower accuracy if precise geolocation times out or fails (common on desktop web browsers)
                    if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
                        console.log("High accuracy timed out. Falling back to default settings...");
                        navigator.geolocation.getCurrentPosition(
                            successCallback,
                            errorCallback,
                            { enableHighAccuracy: false, timeout: 6000 }
                        );
                    } else {
                        errorCallback(err);
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }
}

// REUSABLE FUNCTION FOR UPDATING SELECTED LOCATION
function updateSelectedLocation(lat, lng, shouldReverseGeocode = false, shouldMoveMap = false, zoomLevel = null) {
    const latVal = Number(lat).toFixed(6);
    const lngVal = Number(lng).toFixed(6);

    // 1. Update coordinate inputs
    if (latitudeInput) latitudeInput.value = latVal;
    if (longitudeInput) longitudeInput.value = lngVal;

    const latLng = [lat, lng];

    // 2. Move or place marker
    if (pickupMarker) {
        pickupMarker.setLatLng(latLng);
    } else if (pickupMap) {
        pickupMarker = L.marker(latLng, {
            draggable: true,
            title: "Drag me to your pickup location"
        }).addTo(pickupMap);
        pickupMarker.on("dragend", function () {
            const position = pickupMarker.getLatLng();
            updateSelectedLocation(position.lat, position.lng, true, false);
        });
    }

    // 3. Move map if requested
    if (shouldMoveMap && pickupMap) {
        pickupMap.invalidateSize(); // Force recalculating size before centering
        if (zoomLevel !== null) {
            pickupMap.setView(latLng, zoomLevel);
        } else {
            pickupMap.panTo(latLng);
        }
    }

    // 4. Reverse geocode if requested
    if (shouldReverseGeocode) {
        reverseGeocode(lat, lng);
    }
}

// SEARCH PICKUP LOCATION FUNCTION (Geocoding)
async function searchPickupLocation() {
    if (!locationSearchInput) return;
    const searchText = locationSearchInput.value.trim();

    if (!searchText) {
        alert("Please enter a pickup location address.");
        return;
    }

    const originalText = searchLocationBtn ? searchLocationBtn.textContent : "Search";
    if (searchLocationBtn) {
        searchLocationBtn.disabled = true;
        searchLocationBtn.textContent = "Searching...";
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`;
        const response = await fetch(url, {
            headers: {
                "Accept-Language": "en"
            }
        });
        if (!response.ok) throw new Error("Geocoding API network response error");
        const data = await response.json();

        if (data && data.length > 0) {
            const firstResult = data[0];
            const lat = parseFloat(firstResult.lat);
            const lon = parseFloat(firstResult.lon);

            // Move map, marker, update coordinates
            updateSelectedLocation(lat, lon, false, true, 16);

            // Populate the address input
            if (addressInput) {
                addressInput.value = firstResult.display_name;
            }
        } else {
            alert("Address not found. Please try a more specific address search.");
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        alert("An error occurred while searching for the address. Please check your network connection.");
    } finally {
        if (searchLocationBtn) {
            searchLocationBtn.disabled = false;
            searchLocationBtn.textContent = originalText;
        }
    }
}

// REVERSE GEOCODING FUNCTION
async function reverseGeocode(latitude, longitude) {
    if (!addressInput) return;
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const response = await fetch(url, {
            headers: {
                "Accept-Language": "en"
            }
        });
        if (!response.ok) throw new Error("Reverse geocoding network response error");
        const data = await response.json();

        if (data && data.display_name) {
            addressInput.value = data.display_name;
        } else {
            console.warn("No address name found for these coordinates.");
        }
    } catch (error) {
        console.error("Reverse geocoding error:", error);
    }
}

// Run map initialization
initLeafletMap();

// ==========================================
// FOOD IMAGE PREVIEW
// ==========================================

const foodImageInput = document.getElementById("foodImage");
const previewImageElement = document.getElementById("previewImage");

if (foodImageInput && previewImageElement) {
    foodImageInput.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) {
            previewImageElement.style.display = "none";
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            this.value = "";
            previewImageElement.style.display = "none";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            previewImageElement.src = event.target.result;
            previewImageElement.style.display = "block";
        };

        reader.readAsDataURL(file);
    });
}

// ==========================================
// DYNAMIC FOOD ITEMS VARIETIES
// ==========================================
const addFoodBtn = document.getElementById("addFoodBtn");
const foodInputList = document.getElementById("foodInputList");

if (addFoodBtn && foodInputList) {
    addFoodBtn.addEventListener("click", () => {
        const newRow = document.createElement("div");
        newRow.className = "food-input-row";
        newRow.style.display = "flex";
        newRow.style.alignItems = "center";
        newRow.style.gap = "8px";
        newRow.style.marginBottom = "8px";
        
        newRow.innerHTML = `
            <div class="input-icon" style="flex: 2;">
                <i class="fa-solid fa-bowl-food"></i>
                <input
                    type="text"
                    class="foodNameInput"
                    placeholder="Example : Sambar / Bread"
                    required>
            </div>
            <div class="input-icon" style="flex: 1.2;">
                <i class="fa-solid fa-layer-group"></i>
                <select class="foodCategoryInput" required style="padding-left: 50px; height: 56px;">
                    <option value="">Category</option>
                    <option value="Veg">Veg</option>
                    <option value="Non Veg">Non Veg</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Fruits">Fruits</option>
                </select>
            </div>
            <button type="button" class="remove-food-btn" style="background: #ef4444; border: none; color: white; width: 44px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;" title="Remove food item">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        foodInputList.appendChild(newRow);
        
        newRow.querySelector(".remove-food-btn").addEventListener("click", () => {
            newRow.remove();
        });
    });
}

// ==========================================
// DONATE FOOD FORM SUBMISSION
// ==========================================

const donateForm = document.getElementById("donateForm");

if (donateForm) {
    donateForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get form values
        const foodRows = document.querySelectorAll("#foodInputList .food-input-row");
        const foodItems = Array.from(foodRows).map(row => {
            const name = row.querySelector(".foodNameInput").value.trim();
            const category = row.querySelector(".foodCategoryInput").value;
            return { name, category };
        }).filter(item => item.name !== "");

        const quantity = document.getElementById("quantity").value;
        const preparedDate = document.getElementById("preparedDate").value;
        const preparedTime = document.getElementById("preparedTime").value;
        const preparedPeriod = document.getElementById("preparedPeriod").value;
        const expiryDate = document.getElementById("expiryDate").value;
        const expiryTime = document.getElementById("expiryTime").value;
        const expiryPeriod = document.getElementById("expiryPeriod").value;
        const storage = document.getElementById("storage").value;
        const address = document.getElementById("locationSearch").value.trim();
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;

        // Check if any item has missing category
        const invalidItem = foodItems.find(item => item.name && !item.category);

        // Check required fields
        if (
            foodItems.length === 0 ||
            invalidItem ||
            !quantity ||
            !preparedDate ||
            !preparedTime ||
            !expiryDate ||
            !expiryTime ||
            !storage ||
            !address
        ) {
            alert("Please fill in all required food details including categories.");
            return;
        }

        // Check location
        if (!latitude || !longitude) {
            alert("Please select a pickup location on the map.");
            return;
        }

        // Format dates and times for backend logic
        const prep = convertTo24Hour(preparedTime, preparedPeriod);
        const exp = convertTo24Hour(expiryTime, expiryPeriod);
        const prepared_time_str = `${String(prep.hour).padStart(2, "0")}:${String(prep.minute).padStart(2, "0")}`;
        const expiry_time_str = `${String(exp.hour).padStart(2, "0")}:${String(exp.minute).padStart(2, "0")}`;

        const donor_email = localStorage.getItem("email") || "rohan.sharma.donor@gmail.com";
        const primaryCategory = foodItems.length > 0 ? foodItems[0].category : "";

        // Create donation data object
        const donationData = {
            foodName: foodItems,
            foodCategory: primaryCategory,
            quantity: quantity,
            preparedDate: preparedDate,
            preparedTime: prepared_time_str,
            expiryDate: expiryDate,
            expiryTime: expiry_time_str,
            storage: storage,
            address: address,
            latitude: latitude,
            longitude: longitude,
            donationStatus: "Available",
            createdAt: new Date().toISOString()
        };

        // Try submitting to Flask Backend first
        let backendSubmitted = false;
        try {
            const response = await fetch("http://127.0.0.1:5000/donate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    food_name: foodItems,
                    quantity: quantity,
                    category: primaryCategory,
                    prepared_time: prepared_time_str,
                    storage: storage,
                    expiry: expiry_time_str,
                    address: address,
                    latitude: latitude,
                    longitude: longitude,
                    donor_email: donor_email
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === "success") {
                    backendSubmitted = true;
                    console.log("Submitted to backend successfully:", data.message);
                }
            }
        } catch (error) {
            console.warn("Backend submission failed (is server running?), saving locally only.", error);
        }

        // Temporarily save donation in local storage (browser)
        const donations = JSON.parse(localStorage.getItem("donations")) || [];
        donations.push(donationData);
        localStorage.setItem("donations", JSON.stringify(donations));

        // Success alert
        if (backendSubmitted) {
            alert("Food donation submitted successfully!");
        } else {
            alert("Food donation saved locally!");
        }

        // Reset form
        donateForm.reset();

        // Reset food items list to only one row
        if (foodInputList) {
            foodInputList.innerHTML = `
                <div class="food-input-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div class="input-icon" style="flex: 2;">
                        <i class="fa-solid fa-bowl-food"></i>
                        <input
                            type="text"
                            class="foodNameInput"
                            placeholder="Example : Vegetable Rice"
                            required>
                    </div>
                    <div class="input-icon" style="flex: 1.2;">
                        <i class="fa-solid fa-layer-group"></i>
                        <select class="foodCategoryInput" required style="padding-left: 50px; height: 56px;">
                            <option value="">Category</option>
                            <option value="Veg">Veg</option>
                            <option value="Non Veg">Non Veg</option>
                            <option value="Bakery">Bakery</option>
                            <option value="Fruits">Fruits</option>
                        </select>
                    </div>
                </div>
            `;
        }

        // Hide image preview
        const previewImage = document.getElementById("previewImage");
        if (previewImage) {
            previewImage.style.display = "none";
            previewImage.src = "";
        }

        // Clear location fields
        document.getElementById("latitude").value = "";
        document.getElementById("longitude").value = "";
        
        // Reset map to default location
        const defaultLocation = [9.9252, 78.1198];
        updateSelectedLocation(defaultLocation[0], defaultLocation[1], false, true, 13);

        console.log("Donation saved:", donationData);
    });
};

document.addEventListener("DOMContentLoaded", () => {
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
});

// ==========================================
// DYNAMIC NOTIFICATION SYSTEM FOR DONATE PAGE
// ==========================================

(function() {
    // Notification toggling code moved inside inline script in donate.html

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
            return new Date(0);
        }
    }

    async function loadDonateNotifications() {
        try {
            const response = await fetch("http://127.0.0.1:5000/donations");
            const result = await response.json();
            const allDonations = result.data || [];
            
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
                        icon: "📦"
                    });
                    
                    if (d.accepted_at) {
                        notifications.push({
                            id: `${d._id}_accepted`,
                            donationId: d._id,
                            title: "Donation Accepted",
                            text: `Your donation of ${foodNameText} was claimed by ${d.ngo || 'an NGO'}.`,
                            dateStr: d.accepted_at,
                            icon: "🤝"
                        });
                    }
                    
                    if (d.picked_at) {
                        notifications.push({
                            id: `${d._id}_picked`,
                            donationId: d._id,
                            title: "Volunteer Assigned & Picked Up",
                            text: `Volunteer ${d.volunteer || 'assigned'} has picked up ${foodNameText}.`,
                            dateStr: d.picked_at,
                            icon: "🚚"
                        });
                    }
                    
                    if (d.delivered_at) {
                        notifications.push({
                            id: `${d._id}_delivered`,
                            donationId: d._id,
                            title: "Donation Delivered",
                            text: `Your donation of ${foodNameText} has been safely delivered! Thank you.`,
                            dateStr: d.delivered_at,
                            icon: "✅"
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
                            icon: "🔔"
                        });
                    } else if (d.ngo === userName || d.ngo === "Helping Hands NGO") {
                        notifications.push({
                            id: `${d._id}_ngo_accepted`,
                            donationId: d._id,
                            title: "Donation Claimed by You",
                            text: `You claimed ${foodNameText}. Awaiting volunteer pickup.`,
                            dateStr: d.accepted_at,
                            icon: "🤝"
                        });
                        
                        if (d.picked_at) {
                            notifications.push({
                                id: `${d._id}_ngo_picked`,
                                donationId: d._id,
                                title: "Donation Picked Up",
                                text: `Volunteer ${d.volunteer || 'assigned'} picked up ${foodNameText}.`,
                                dateStr: d.picked_at,
                                icon: "🚚"
                            });
                        }
                        
                        if (d.delivered_at) {
                            notifications.push({
                                id: `${d._id}_ngo_delivered`,
                                donationId: d._id,
                                title: "Donation Delivered Successfully",
                                text: `${foodNameText} has been delivered to your location.`,
                                dateStr: d.delivered_at,
                                icon: "✅"
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
                            icon: "🔔"
                        });
                    } else if (d.volunteer === userName || d.volunteer === "Vikas Dubey") {
                        if (d.picked_at) {
                            notifications.push({
                                id: `${d._id}_vol_picked`,
                                donationId: d._id,
                                title: "Pickup Completed",
                                text: `You have picked up ${foodNameText} and started delivery.`,
                                dateStr: d.picked_at,
                                icon: "🚚"
                            });
                        }
                        
                        if (d.delivered_at) {
                            notifications.push({
                                id: `${d._id}_vol_delivered`,
                                donationId: d._id,
                                title: "Task Delivered Successfully",
                                text: `You delivered ${foodNameText} to ${d.ngo || 'NGO'}.`,
                                dateStr: d.delivered_at,
                                icon: "✅"
                            });
                        }
                    }
                });
                
            } else {
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
                        icon: "📦"
                    });
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
                newCountSpan.style.cursor = "pointer";
                newCountSpan.title = "Click to mark all as read";
                
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
                    loadDonateNotifications();
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
                    window.location.href = `dashboard.html?viewDonationId=${n.donationId}`;
                });
                
                notificationBody.appendChild(itemDiv);
            });
        } catch (error) {
            console.error("Error loading notifications in donate page:", error);
        }
    }

    loadDonateNotifications();
})();