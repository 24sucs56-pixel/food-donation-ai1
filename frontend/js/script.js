/* ==========================================================
                SMART FOOD DONATION AI
                SCRIPT.JS PART 1
========================================================== */

/* ==========================================================
                LOADER
========================================================== */

window.addEventListener("load", function () {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

    }, 1500);

});

/* ==========================================================
                COUNTER ANIMATION
========================================================== */

const counters = document.querySelectorAll(".counter");

const speed = 80;

counters.forEach(counter => {

    const updateCounter = () => {

        const target = +counter.getAttribute("data-target");

        const count = +counter.innerText;

        const increment = Math.ceil(target / speed);

        if (count < target) {

            counter.innerText = count + increment;

            setTimeout(updateCounter, 30);

        } else {

            counter.innerText = target;

        }

    };

    updateCounter();

});

/* ==========================================================
                SMOOTH NAVIGATION
========================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        document.querySelector(this.getAttribute("href"))
            .scrollIntoView({

                behavior: "smooth"

            });

    });

});

/* ==========================================================
                NAVBAR SHADOW
========================================================== */

window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 40) {

        navbar.style.boxShadow = "0 20px 40px rgba(0,0,0,.12)";

    }

    else {

        navbar.style.boxShadow = "0 10px 20px rgba(0,0,0,.05)";

    }

});

/* ==========================================================
                SCROLL TO TOP BUTTON
========================================================== */

const scrollButton = document.querySelector(".scroll-top");

window.addEventListener("scroll", () => {

    if (!scrollButton) return;

    if (window.scrollY > 300) {

        scrollButton.style.display = "flex";

    }

    else {

        scrollButton.style.display = "none";

    }

});

if (scrollButton) {

    scrollButton.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}
/* ==========================================================
                DARK MODE
========================================================== */

const themeButton = document.querySelector(".theme-btn");

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){

        themeButton.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }

    else{

        themeButton.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

    }

});

/* ==========================================================
                SCROLL ANIMATION
========================================================== */

const revealElements = document.querySelectorAll(

"section,.stat-card,.feature-card,.step-card,.impact-card"

);

function revealOnScroll(){

    revealElements.forEach(element=>{

        const windowHeight = window.innerHeight;

        const elementTop =
        element.getBoundingClientRect().top;

        if(elementTop < windowHeight - 120){

            element.classList.add("show");

        }

    });

}

window.addEventListener(

"scroll",

revealOnScroll

);

revealOnScroll();

/* ==========================================================
                AI BUTTON
========================================================== */

// Event listener and chat panel overlay are now managed in js/assistant.js


/* ==========================================================
                DONATE BUTTON
========================================================== */

const donateButtons = document.querySelectorAll(

".primary-btn"

);

donateButtons.forEach(button=>{

button.addEventListener("click",()=>{

console.log("Donate Button Clicked");

});

});

/* ==========================================================
                MOBILE NAVIGATION DRAWER (Landing Page)
========================================================== */
const landingNavToggle = document.getElementById("landingNavToggle");
const landingMobileDrawer = document.getElementById("landingMobileDrawer");
const landingDrawerClose = document.getElementById("landingDrawerClose");
const landingDrawerOverlay = document.getElementById("landingDrawerOverlay");

function openLandingDrawer() {
    if (landingMobileDrawer) landingMobileDrawer.classList.add("open");
    if (landingDrawerOverlay) landingDrawerOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeLandingDrawer() {
    if (landingMobileDrawer) landingMobileDrawer.classList.remove("open");
    if (landingDrawerOverlay) landingDrawerOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

if (landingNavToggle) {
    landingNavToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        openLandingDrawer();
    });
}

if (landingDrawerClose) {
    landingDrawerClose.addEventListener("click", (e) => {
        e.stopPropagation();
        closeLandingDrawer();
    });
}

if (landingDrawerOverlay) {
    landingDrawerOverlay.addEventListener("click", closeLandingDrawer);
}

document.querySelectorAll(".landing-drawer-links a").forEach(link => {
    link.addEventListener("click", closeLandingDrawer);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLandingDrawer();
});

