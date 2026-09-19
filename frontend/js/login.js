const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.querySelector('input[name="role"]:checked').value;

        try {

            const response = await fetch("https://food-donation-ai1.onrender.com/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: role
                })

            });

            const data = await response.json();

            if (data.status === "success") {

                localStorage.setItem("name", data.name);
                localStorage.setItem("role", data.role);
                localStorage.setItem("email", email);

                alert("Welcome " + data.name);

                if (data.role === "admin") {
                    window.location.href = "admin.html";
                } else if (data.role === "donor" || data.role === "ngo" || data.role === "volunteer") {
                    window.location.href = "dashboard.html";
                }

            } else {
                alert(data.message);
            }

        } catch (error) {
            alert("Cannot connect to server.");
            console.log(error);
        }
    });
}

// ==========================================
// GOOGLE ACCOUNT SELECTOR FLOW
// ==========================================
const googleBtn = document.querySelector(".google-button");
const googleModal = document.getElementById("googleModal");
const closeGoogleModal = document.getElementById("closeGoogleModal");
const googleAccountItems = document.querySelectorAll(".google-account-item");

if (googleBtn && googleModal) {
    googleBtn.addEventListener("click", () => {
        googleModal.style.display = "flex";
    });
}

if (closeGoogleModal && googleModal) {
    closeGoogleModal.addEventListener("click", () => {
        googleModal.style.display = "none";
    });
}

// Close modal when clicking outside modal content
window.addEventListener("click", (e) => {
    if (e.target === googleModal) {
        googleModal.style.display = "none";
    }
});

// Bind login logic on account selection
googleAccountItems.forEach(item => {
    item.addEventListener("click", () => {
        const email = item.getAttribute("data-email");
        const name = item.getAttribute("data-name");
        const role = item.getAttribute("data-role");

        if (email && name && role) {
            localStorage.setItem("name", name);
            localStorage.setItem("role", role);
            localStorage.setItem("email", email);

            googleModal.style.display = "none";
            alert("Welcome " + name + " (Logged in via Google)");
            if (role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }
        }
    });
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