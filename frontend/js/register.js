// Toggle fields based on role selection
document.addEventListener("DOMContentLoaded", () => {
    const donorFields = document.getElementById("donorFields");
    const ngoFields = document.getElementById("ngoFields");
    const volunteerFields = document.getElementById("volunteerFields");

    const roleRadios = document.querySelectorAll('input[name="role"]');
    roleRadios.forEach(radio => {
        radio.addEventListener("change", function() {
            const selectedRole = this.value;
            if (selectedRole === "donor") {
                if (donorFields) donorFields.style.display = "block";
                if (ngoFields) ngoFields.style.display = "none";
                if (volunteerFields) volunteerFields.style.display = "none";
            } else if (selectedRole === "ngo") {
                if (donorFields) donorFields.style.display = "none";
                if (ngoFields) ngoFields.style.display = "block";
                if (volunteerFields) volunteerFields.style.display = "none";
            } else if (selectedRole === "volunteer") {
                if (donorFields) donorFields.style.display = "none";
                if (ngoFields) ngoFields.style.display = "none";
                if (volunteerFields) volunteerFields.style.display = "block";
            } else if (selectedRole === "admin") {
                if (donorFields) donorFields.style.display = "none";
                if (ngoFields) ngoFields.style.display = "none";
                if (volunteerFields) volunteerFields.style.display = "none";
            }
        });
    });

    // Custom Searchable Dropdown Logic
    const locationData = {
        "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
        "Karnataka": ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar", "Chamarajanagar", "Chikballapur", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada", "Yadgir"],
        "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
        "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
        "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
        "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
        "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"]
    };

    function setupDropdown(inputId, listId, getDataFn, onSelectFn) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);
        if(!input || !list) return;

        function renderOptions(filter = "") {
            const data = getDataFn();
            list.innerHTML = "";
            const filtered = data.filter(item => item.toLowerCase().includes(filter.toLowerCase()));
            
            if (filtered.length === 0) {
                const div = document.createElement("div");
                div.className = "dropdown-option";
                div.textContent = "No matches found";
                div.style.color = "#999";
                list.appendChild(div);
                return;
            }

            filtered.forEach(item => {
                const div = document.createElement("div");
                div.className = "dropdown-option";
                div.textContent = item;
                div.addEventListener("click", () => {
                    input.value = item;
                    list.classList.remove("show");
                    if (onSelectFn) onSelectFn(item);
                });
                list.appendChild(div);
            });
        }

        input.addEventListener("focus", () => {
            renderOptions(input.value);
            list.classList.add("show");
        });

        input.addEventListener("input", (e) => {
            renderOptions(e.target.value);
            list.classList.add("show");
        });

        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !list.contains(e.target)) {
                list.classList.remove("show");
                const data = getDataFn();
                if (input.value && !data.includes(input.value)) {
                    input.value = "";
                    if (onSelectFn) onSelectFn("");
                }
            }
        });
    }

    setupDropdown("state", "stateList", () => Object.keys(locationData), (selectedState) => {
        document.getElementById("district").value = "";
    });

    setupDropdown("district", "districtList", () => {
        const selectedState = document.getElementById("state").value;
        return locationData[selectedState] || [];
    });
});

const form = document.getElementById("registerForm");

const getApiBase = () => {
    if (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://127.0.0.1:5000";
    }
    return "https://food-donation-ai1.onrender.com";
};

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.querySelector('input[name="role"]:checked').value;
    
    const phone = document.getElementById("phone").value.trim();
    const state = document.getElementById("state").value.trim();
    const district = document.getElementById("district").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const address = document.getElementById("address").value.trim();

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("phone", phone);
    formData.append("state", state);
    formData.append("district", district);
    formData.append("city", "");
    formData.append("pincode", pincode);
    formData.append("address", address);

    let file = null;

    if (role === "volunteer") {
        const vehicle = document.getElementById("vehicle").value;
        const fileInput = document.getElementById("volunteerLicense");
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("Please upload your Aadhaar / Vehicle License.");
            return;
        }
        file = fileInput.files[0];
        formData.append("vehicle", vehicle);
        formData.append("document", file);
    } else if (role === "ngo") {
        const ngoName = document.getElementById("ngoName").value;
        const ngoRegNo = document.getElementById("ngoRegNo").value;
        const fileInput = document.getElementById("ngoCertificate");
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("Please upload your NGO Certificate.");
            return;
        }
        file = fileInput.files[0];
        formData.append("ngo_name", ngoName);
        formData.append("registration_number", ngoRegNo);
        formData.append("document", file);
    } else if (role === "donor") {
        const donorType = document.getElementById("donorType").value;
        const fileInput = document.getElementById("donorLicense");
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("Please upload your Food Certificate.");
            return;
        }
        file = fileInput.files[0];
        formData.append("donor_type", donorType);
        formData.append("document", file);
    }

    try {
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/register`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        alert(data.message || (response.ok ? "Registration submitted successfully. Your account is pending Admin verification." : "Registration failed."));
        
        if (response.ok) {
            window.location.href = "login.html";
        }
    } catch (err) {
        alert("Failed to connect to the server.");
        console.error(err);
    }
});

// ==========================================
// TOGGLE PASSWORD VISIBILITY
// ==========================================
document.querySelectorAll(".show-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = button.parentElement.querySelector("input");
        const icon = button.querySelector("i");
        if (input && icon) {
            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        }
    });
});
