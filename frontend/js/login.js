const loginForm = document.getElementById("loginForm");

const getApiBase = () => {
    if (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://127.0.0.1:5000";
    }
    return "https://food-donation-ai1.onrender.com";
};

function showLoginMessage(msg, type = "error") {
    let msgBox = document.getElementById("loginMessage");
    if (!msgBox) {
        msgBox = document.createElement("div");
        msgBox.id = "loginMessage";
        msgBox.style.cssText = "padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; text-align: center;";
        const form = document.getElementById("loginForm");
        if (form) form.parentNode.insertBefore(msgBox, form);
    }
    
    msgBox.style.display = "block";
    if (type === "success") {
        msgBox.style.backgroundColor = "#d1fae5";
        msgBox.style.color = "#065f46";
        msgBox.style.border = "1px solid #10b981";
    } else if (type === "info") {
        msgBox.style.backgroundColor = "#dbeafe";
        msgBox.style.color = "#1e40af";
        msgBox.style.border = "1px solid #3b82f6";
    } else {
        msgBox.style.backgroundColor = "#fee2e2";
        msgBox.style.color = "#991b1b";
        msgBox.style.border = "1px solid #ef4444";
    }
    msgBox.innerHTML = msg;
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const submitBtn = loginForm.querySelector("button[type='submit']") || document.querySelector(".login-button");

        const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "Login";

        // Show loading state & disable button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.75";
            submitBtn.style.cursor = "not-allowed";
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging in...`;
        }

        showLoginMessage(`<i class="fa-solid fa-spinner fa-spin"></i> Connecting to server, please wait...`, "info");

        try {
            const apiBase = getApiBase();
            const response = await fetch(`${apiBase}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                localStorage.setItem("name", data.name);
                localStorage.setItem("role", data.role);
                localStorage.setItem("email", email);

                showLoginMessage(`✓ Welcome ${data.name}! Redirecting...`, "success");

                setTimeout(() => {
                    if (data.role === "admin") {
                        window.location.href = "admin.html";
                    } else if (data.role === "donor" || data.role === "ngo" || data.role === "volunteer") {
                        window.location.href = "dashboard.html";
                    }
                }, 600);
            } else {
                showLoginMessage(data.message || "Login failed.", "error");
                // Re-enable button on failure
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                    submitBtn.style.cursor = "pointer";
                    submitBtn.innerHTML = originalBtnHTML;
                }
            }
        } catch (error) {
            showLoginMessage("Cannot connect to server. Please check your network connection.", "error");
            console.log(error);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
                submitBtn.innerHTML = originalBtnHTML;
            }
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