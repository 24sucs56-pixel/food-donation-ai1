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
});

const form = document.getElementById("registerForm");

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.querySelector('input[name="role"]:checked').value;
    
    const phone = document.getElementById("phone").value;
    const state = document.getElementById("state").value;
    const district = document.getElementById("district").value;
    const city = document.getElementById("city").value;
    const pincode = document.getElementById("pincode").value;
    const address = document.getElementById("address").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    let payload = {
        name: name,
        email: email,
        password: password,
        role: role,
        phone: phone,
        state: state,
        district: district,
        city: city,
        pincode: pincode,
        address: address
    };

    let file = null;

    if (role === "volunteer") {
        const vehicle = document.getElementById("vehicle").value;
        const fileInput = document.getElementById("volunteerLicense");
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("Please upload your Driving License.");
            return;
        }
        file = fileInput.files[0];
        payload.vehicle = vehicle;
    } else if (role === "ngo") {
        const ngoName = document.getElementById("ngoName").value;
        const ngoRegNo = document.getElementById("ngoRegNo").value;
        const fileInput = document.getElementById("ngoCertificate");
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("Please upload your NGO Registration Certificate.");
            return;
        }
        file = fileInput.files[0];
        payload.ngo_name = ngoName;
        payload.registration_number = ngoRegNo;
    } else if (role === "donor") {
        const donorType = document.getElementById("donorType").value;
        const fileInput = document.getElementById("donorLicense");
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("Please upload your Food Safety License / FSSAI certificate.");
            return;
        }
        file = fileInput.files[0];
        payload.donor_type = donorType;
    }

    if (file) {
        try {
            payload.document_image = await fileToBase64(file);
        } catch (err) {
            alert("Error processing document image. Please try another file.");
            console.error(err);
            return;
        }
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/register",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(payload)
        });

        const data = await response.json();
        alert(data.message);
        
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
