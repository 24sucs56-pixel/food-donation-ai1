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