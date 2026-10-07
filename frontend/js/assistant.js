/* ==========================================================
                SMART FOOD DONATION AI ASSISTANT WIDGET JS
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Keep track of user conversation histories for local flow context
    let widgetHistory = [];
    let dashboardHistory = [];

    // Local Q&A Database returning step-by-step procedures
    const LOCAL_QA_DATABASE = {
        "How do I donate food in this app?": `
            <p><strong>🍱 Step-by-Step Food Donation Procedure:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Go to the Donate Page</strong>: Click on the <strong><a href="donate.html">Donate Food</a></strong> tab in the sidebar menu.</li>
                <li><strong>Enter Food Details</strong>: Input the food name, select category (Veg, Non Veg, Bakery, Fruits), and specify quantity (number of people it can feed).</li>
                <li><strong>Set Timings</strong>: Fill in the prepared date/time and expiry date/time so the system can evaluate food safety.</li>
                <li><strong>Select Storage Type</strong>: Specify whether the food needs to be Refrigerated, Frozen, or can stay at Room Temperature.</li>
                <li><strong>Mark Pickup Address</strong>: Click on the interactive map to place a pin, or click the "Use My Current Location" button.</li>
                <li><strong>Submit Submission</strong>: Press the <strong>"Donate Food"</strong> button to save and register the entry.</li>
            </ol>
        `,
        "How does the AI freshness score work?": `
            <p><strong>🌱 Step-by-Step AI Freshness Check Procedure:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Time Calculation</strong>: The system evaluates the difference between your food's Prepared Time and Expiry Time.</li>
                <li><strong>Quality Adjustments</strong>: Freshness decays faster for certain foods (e.g. Non Veg vs Fruits) or storage conditions (e.g. Room Temp vs Refrigerated).</li>
                <li><strong>Assign Safety Level</strong>:
                    <ul>
                        <li><em>Above 4 hours left</em>: <strong>Safe (95%+)</strong>. Collect within 4 hours.</li>
                        <li><em>2 to 4 hours left</em>: <strong>Good (80%)</strong>. Collect within 2 hours.</li>
                        <li><em>1 to 2 hours left</em>: <strong>Average (60%)</strong>. Deliver immediately.</li>
                        <li><em>Under 1 hour left</em>: <strong>Unsafe (35%)</strong> or <strong>Expired (0%)</strong>. Donation is blocked.</li>
                    </ul>
                </li>
                <li><strong>Matching Notification</strong>: High-priority items alert nearby volunteers for faster transport.</li>
            </ol>
        `,
        "What are the common error messages and fixes?": `
            <p><strong>⚠️ Troubleshooting Common Errors Step-by-Step:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Missing details error</strong>: <em>"Please fill in all required food details."</em>
                    <br>👉 <strong>Fix</strong>: Check that name, category, quantity, prepared time, expiry time, and storage fields are filled out.
                </li>
                <li><strong>Missing map marker error</strong>: <em>"Please select a pickup location on the map."</em>
                    <br>👉 <strong>Fix</strong>: Click on the map to drop a pin, or click the "Use My Current Location" button.
                </li>
                <li><strong>Invalid file upload error</strong>: <em>"Please select a valid image."</em>
                    <br>👉 <strong>Fix</strong>: Upload an image in a standard format (JPG, PNG, WebP) and check the file size is under the limit.
                </li>
            </ol>
        `,
        "How are donations matched with NGOs?": `
            <p><strong>🏢 Step-by-Step NGO Matching Procedure:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Coordinate Assessment</strong>: The app checks the GPS coordinates of your submission against registered NGO locations.</li>
                <li><strong>Category Check</strong>: Matches the donation type with the NGO preferences (e.g. Veg items with community centers, Bakery items with orphanages).</li>
                <li><strong>Distance Calculations</strong>: Calculates the shortest travel route using coordinates.</li>
                <li><strong>Dispatcher Alert</strong>: Connects with the nearest eligible NGO and alerts volunteers to initiate transport.</li>
            </ol>
        `,
        "What food categories can I choose?": `
            <p><strong>🍎 Supported Food Categories Step-by-Step selection:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Veg (Vegetarian)</strong>: Standard cooked vegetables, rice, grains, and vegetarian dishes.</li>
                <li><strong>Non-Veg (Non-Vegetarian)</strong>: Meat, poultry, seafood, and eggs (needs careful storage control).</li>
                <li><strong>Bakery</strong>: Bread, pastries, cakes, biscuits, and bakery items (longer shelf-life).</li>
                <li><strong>Fruits</strong>: Fresh raw fruits and vegetables.</li>
            </ol>
        `,
        "What storage details should I select?": `
            <p><strong>❄️ Selecting Storage Options Step-by-Step:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Refrigerated</strong>: Recommended for meat, dairy, cooked curries, and perishable items to maintain quality.</li>
                <li><strong>Frozen</strong>: For highly perishable meats or specialized meals that must be kept frozen until transport.</li>
                <li><strong>Room Temperature</strong>: Appropriate for bakery items, raw whole fruits, dry goods, and packaged snacks.</li>
            </ol>
        `,
        "Who collects the food after donation?": `
            <p><strong>🚚 Food Collection and Transportation Process:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Volunteer Notification</strong>: Registered volunteers in the vicinity are notified of your donation coordinates.</li>
                <li><strong>Job Selection</strong>: A volunteer accepts the collection request on their dashboard.</li>
                <li><strong>Transit and Pickup</strong>: The volunteer navigates to your location using the map coordinates.</li>
                <li><strong>Final Delivery</strong>: The volunteer transports the fresh food directly to the matched NGO shelter.</li>
            </ol>
        `,
        "How do I track my previous donations?": `
            <p><strong>📊 Step-by-Step Donation Tracking Guide:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Navigate to History</strong>: Select <strong><a href="mydonations.html">My Donations</a></strong> from the sidebar menu.</li>
                <li><strong>Check Status Badge</strong>:
                    <ul>
                        <li><em>Waiting</em>: Donation submitted, awaiting volunteer assignment.</li>
                        <li><em>Accepted</em>: NGO matched and volunteer on their way.</li>
                        <li><em>Picked</em>: Volunteer has picked up the food.</li>
                        <li><em>Delivered</em>: Food safely delivered to the NGO.</li>
                    </ul>
                </li>
                <li><strong>Review Details</strong>: Click on any entry to see the freshness score, category, and match details.</li>
            </ol>
        `,
        "Can I use the app without an internet connection?": `
            <p><strong>📶 Offline Mode Operation Step-by-Step:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Detect Connection</strong>: If your internet drops, the app automatically switches to offline mode.</li>
                <li><strong>Local Storage Cache</strong>: When you submit food, details are cached securely inside your browser's local storage.</li>
                <li><strong>Offline Alert</strong>: You will see the alert: <em>"Food donation saved locally!"</em>.</li>
                <li><strong>Automatic Sync</strong>: Once connection is restored, cached submissions are synced with the server automatically.</li>
            </ol>
        `,
        "How do I register as a volunteer?": `
            <p><strong>🙋 Volunteer Registration Procedure:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Open Register Page</strong>: Log out and click Register on the login screen.</li>
                <li><strong>Choose Role</strong>: In the role dropdown selector, select <strong>"Volunteer"</strong>.</li>
                <li><strong>Fill out Form</strong>: Provide your name, contact information, email address, and select your service area.</li>
                <li><strong>Start Deliveries</strong>: Log in to see active nearby donation pins awaiting collection.</li>
            </ol>
        `,
        "What does Smart Food Donation AI do?": `
            <p><strong>🏢 Smart Food Donation AI Operations Step-by-Step:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Minimizes Waste</strong>: Redirects excess edible food from restaurants, events, and households.</li>
                <li><strong>Calculates Freshness</strong>: Uses preparation/expiry variables to determine safety priority.</li>
                <li><strong>Coordinates Logistics</strong>: Instantly calculates distances to nearby NGOs and dispatches local volunteers.</li>
            </ol>
        `,
        "How do I become a registered partner NGO?": `
            <p><strong>🏢 Step-by-Step NGO Registration Guide:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Open Register Page</strong>: Go to the Login page and click on "Create Account".</li>
                <li><strong>Select NGO Role</strong>: Choose the <strong>"NGO"</strong> option from the role selectors.</li>
                <li><strong>Provide Organization Details</strong>: Enter your organization name, registration number, address, and contact details.</li>
                <li><strong>Submit & Verify</strong>: Submit the form. Our admin team will verify your credentials within 24 hours, after which you can log in to claim donations.</li>
            </ol>
        `,
        "How does the matching algorithm select volunteers?": `
            <p><strong>🤖 Volunteer Dispatch & Matching Algorithm:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Distance Check</strong>: Calculates the distance between the donation location and active volunteers.</li>
                <li><strong>Availability Status</strong>: Filters volunteers who are currently online and not on an active delivery.</li>
                <li><strong>Push Alerts</strong>: Sends a high-priority push notification to the closest 3 volunteers.</li>
                <li><strong>First Come First Serve</strong>: The first volunteer to tap "Accept" on their dashboard receives the pickup route.</li>
            </ol>
        `,
        "How do NGOs accept available donations?": `
            <p><strong>🏢 NGO Accepting Donations Guide:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Open Available Donations</strong>: Click on the <strong>Available Donations</strong> tab in your sidebar.</li>
                <li><strong>Inspect Donation Details</strong>: Check the food type, quantity, preparation time, and AI freshness rating.</li>
                <li><strong>Click Accept Donation</strong>: Press the <strong>"Accept Donation"</strong> button on the item card.</li>
                <li><strong>Volunteer Dispatch</strong>: The status will change to <em>Accepted</em> and alerts will notify local volunteers for pickup.</li>
            </ol>
        `,
        "How do NGOs manage accepted donations?": `
            <p><strong>📦 NGO Accepted Donations Management:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Go to Accepted Donations</strong>: Click on <strong>Accepted Donations</strong> in the sidebar menu.</li>
                <li><strong>Track Delivery Progress</strong>: View real-time status badges (<em>Accepted</em>, <em>Picked</em>, or <em>Delivered</em>).</li>
                <li><strong>Confirm Receipt</strong>: Once the volunteer delivers the food, click <strong>"Confirm Receipt"</strong> to finalize the record and rate the volunteer.</li>
            </ol>
        `,
        "How does NGO volunteer coordination work?": `
            <p><strong>🚚 NGO Volunteer Coordination Guide:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>View Volunteers Network</strong>: Click on the <strong>Volunteers</strong> tab in your sidebar.</li>
                <li><strong>Check Volunteer Ratings</strong>: View active volunteers, their vehicle types, ratings, and contact info.</li>
                <li><strong>Approve Pickup Requests</strong>: Review pickup requests submitted by volunteers and confirm assignment for your accepted donations.</li>
            </ol>
        `,
        "How do volunteers manage assigned pickups?": `
            <p><strong>🚚 Volunteer Assigned Pickups Guide:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Open Assigned Pickups</strong>: Click on <strong>Assigned Pickups</strong> from your sidebar navigation.</li>
                <li><strong>Request/Accept Pickup</strong>: Browse available collection requests and click <strong>"Request Pickup"</strong>.</li>
                <li><strong>Navigate to Donor</strong>: Use the map coordinates and donor address to travel to the donor site.</li>
                <li><strong>Mark as Picked Up</strong>: Inspect food condition and press <strong>"Picked Up"</strong> in the app to notify the NGO.</li>
            </ol>
        `,
        "How do volunteers complete food delivery?": `
            <p><strong>📦 Volunteer Delivery Completion Guide:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Travel to NGO Shelter</strong>: Follow the address of the recipient NGO shown on your active job card.</li>
                <li><strong>Hand Over Food</strong>: Deliver the packaged food safely to the NGO staff or shelter representative.</li>
                <li><strong>Mark as Delivered</strong>: Press <strong>"Mark Delivered"</strong> to complete the delivery and earn performance ratings.</li>
            </ol>
        `,
        "What are the food safety guidelines for volunteers during transit?": `
            <p><strong>🥗 Safe Food Handling for Volunteers:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Insulated Containers</strong>: Store hot meals in thermal bags and cold/dairy items in insulated coolers.</li>
                <li><strong>Hygienic Packaging</strong>: Ensure all food covers remain sealed and untouched during transportation.</li>
                <li><strong>Timely Delivery</strong>: Transport high-priority perishable items immediately without unneeded delays.</li>
            </ol>
        `,
        "What details can I see inside the Reports panel?": `
            <p><strong>📈 Analytics and Reports Data Points:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Total Registered Donations</strong>: The cumulative count of all donation records logged.</li>
                <li><strong>Total Claimed & Delivered</strong>: Shows the delivery success rate of claimed items.</li>
                <li><strong>Impact Charts</strong>: Pie charts representing category distributions (Veg, Non Veg, Bakery, Fruits).</li>
                <li><strong>Monthly Trends</strong>: Bar graphs showing donations and claims made month-by-month.</li>
            </ol>
        `
    };

    // Extract list of all available questions for search
    const PREDEFINED_QUESTIONS = Object.keys(LOCAL_QA_DATABASE);

    // ------------------------------------------------------
    // 1. DYNAMICALLY INJECT FLOATING CHAT WIDGET
    // ------------------------------------------------------
    const floatingAiBtn = document.querySelector(".floating-ai");

    if (floatingAiBtn && !document.getElementById("aiChatWidget")) {
        // Create widget container
        const chatWidget = document.createElement("div");
        chatWidget.id = "aiChatWidget";
        chatWidget.className = "ai-chat-widget";
        
        chatWidget.innerHTML = `
            <div class="ai-chat-header">
                <div class="ai-chat-header-info">
                    <div class="ai-chat-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="ai-chat-title">
                        <h3>Smart Food Donation AI Assistant</h3>
                        <span>Local & Backend Mode</span>
                    </div>
                </div>
                <button id="closeChatBtn" class="ai-chat-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div id="widgetMessages" class="ai-chat-messages">
                <div class="ai-msg bot">
                    <p>👋 Hello! I'm your Smart Food Donation AI Assistant.</p>
                    <p>I can help you navigate the app, explain food donation procedures, and assist with your role workflows. What can I do for you today?</p>
                </div>
            </div>
            <div id="widgetChips" class="ai-chat-chips">
                <button class="ai-chip" data-query="How do I donate food in this app?">🍱 How to donate?</button>
                <button class="ai-chip" data-query="How does the AI freshness score work?">🌱 AI Freshness check</button>
                <button class="ai-chip" data-query="What are the common error messages and fixes?">⚠️ Errors & fixes</button>
            </div>
            <div class="ai-chat-input-container">
                <input type="text" id="widgetInput" placeholder="Type your question here...">
                <button id="widgetSendBtn" class="ai-chat-send">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(chatWidget);

        // Inject dynamic suggestions panel above input area
        const widgetSuggestions = document.createElement("div");
        widgetSuggestions.id = "widgetSuggestionsPanel";
        widgetSuggestions.className = "ai-suggestions-panel";
        chatWidget.insertBefore(widgetSuggestions, chatWidget.querySelector(".ai-chat-input-container"));

        // Bind events for the floating widget
        const closeBtn = document.getElementById("closeChatBtn");
        const widgetInput = document.getElementById("widgetInput");
        const widgetSendBtn = document.getElementById("widgetSendBtn");
        const widgetMessages = document.getElementById("widgetMessages");
        const widgetChips = document.getElementById("widgetChips");

        // Toggle chat panel on floating button click
        floatingAiBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            chatWidget.classList.toggle("show");
            if (chatWidget.classList.contains("show")) {
                widgetInput.focus();
                scrollToBottom(widgetMessages);
            }
        });

        // Close chat button click
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            chatWidget.classList.remove("show");
        });

        // Close chat when clicking outside the widget
        document.addEventListener("click", (e) => {
            if (!chatWidget.contains(e.target) && !floatingAiBtn.contains(e.target)) {
                chatWidget.classList.remove("show");
            }
        });

        // Send messages handlers
        widgetSendBtn.addEventListener("click", () => {
            handleUserMessage(widgetInput, widgetMessages);
        });

        widgetInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleUserMessage(widgetInput, widgetMessages);
            }
        });

        // Setup widget autocomplete engine
        setupAutocomplete(widgetInput, widgetSuggestions, widgetMessages, widgetHistory);

        // Setup widget chip click handlers
        bindChipListeners(widgetChips, widgetMessages, widgetHistory);
    }

    // ------------------------------------------------------
    // 2. BIND TO IN-PAGE ASSISTANT ON DASHBOARD.HTML
    // ------------------------------------------------------
    const dashboardInput = document.getElementById("chatInput");
    const dashboardSendBtn = document.getElementById("sendMessage");
    const dashboardMessages = document.getElementById("chatMessages");
    const dashboardNewChatBtn = document.querySelector(".new-chat-btn");

    if (dashboardInput && dashboardSendBtn && dashboardMessages) {
        // Inject dynamic suggestions panel above input area
        const dashboardAssistant = document.querySelector(".ai-assistant");
        const chatMain = dashboardAssistant ? dashboardAssistant.querySelector(".ai-chat-main") : null;
        const dashboardSuggestions = document.createElement("div");
        dashboardSuggestions.id = "dashboardSuggestionsPanel";
        dashboardSuggestions.className = "ai-suggestions-panel";
        dashboardSuggestions.style.bottom = "68px"; // Positions panel above input bar
        
        if (chatMain) {
            chatMain.insertBefore(dashboardSuggestions, chatMain.querySelector(".chat-input-area"));
        }

        // Setup initial greeting message with interactive chips tailored per role
        showDashboardGreeting();

        // Bind dashboard actions
        dashboardSendBtn.addEventListener("click", () => {
            handleUserMessage(dashboardInput, dashboardMessages);
        });

        dashboardInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleUserMessage(dashboardInput, dashboardMessages);
            }
        });

        // Setup dashboard autocomplete engine
        setupAutocomplete(dashboardInput, dashboardSuggestions, dashboardMessages, dashboardHistory);

        if (dashboardNewChatBtn) {
            dashboardNewChatBtn.addEventListener("click", () => {
                showDashboardGreeting();
                dashboardHistory = []; // Reset history context for new chat
            });
        }
    }

    // ------------------------------------------------------
    // 3. CORE CHAT LOGIC AND RESPONSES
    // ------------------------------------------------------
    
    function scrollToBottom(container) {
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    function handleUserMessage(inputElement, messagesContainer) {
        const text = inputElement.value.trim();
        if (!text) return;

        // Display user message
        appendMessage(text, "user", messagesContainer);
        inputElement.value = "";
        scrollToBottom(messagesContainer);

        // Select the history array based on container
        const historyArray = messagesContainer.id === "chatMessages" ? dashboardHistory : widgetHistory;

        // Process response with backend API and local fallback
        showBotResponse(text, messagesContainer, historyArray);
    }

    function appendMessage(text, sender, container) {
        const msgDiv = document.createElement("div");
        msgDiv.className = sender === "user" ? "ai-msg user" : "ai-msg bot";
        
        // Use bot-message class if on dashboard in-page chat to match existing styles
        if (container.id === "chatMessages" && sender === "bot") {
            msgDiv.className = "bot-message";
        } else if (container.id === "chatMessages" && sender === "user") {
            msgDiv.className = "user-message";
            msgDiv.style.alignSelf = "flex-end";
            msgDiv.style.background = "var(--primary)";
            msgDiv.style.color = "white";
            msgDiv.style.padding = "10px 14px";
            msgDiv.style.borderRadius = "16px 16px 4px 16px";
            msgDiv.style.maxWidth = "80%";
            msgDiv.style.marginBottom = "14px";
        }

        msgDiv.innerHTML = text;
        container.appendChild(msgDiv);
    }

    function getDefaultFallbackForRole(role) {
        if (role === "ngo") {
            return `
                <p>I couldn't find an exact procedure for your question. Here are top NGO procedures you can look up:</p>
                <div class="dashboard-chips" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                    <button class="ai-chip" data-query="How do NGOs accept available donations?">🏢 Accepting donations</button>
                    <button class="ai-chip" data-query="How do NGOs manage accepted donations?">📦 Managing accepted food</button>
                    <button class="ai-chip" data-query="How does NGO volunteer coordination work?">🚚 Volunteer coordination</button>
                </div>
            `;
        } else if (role === "volunteer") {
            return `
                <p>I couldn't find an exact procedure for your question. Here are top Volunteer procedures you can look up:</p>
                <div class="dashboard-chips" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                    <button class="ai-chip" data-query="How do volunteers manage assigned pickups?">🚚 Pickup procedure</button>
                    <button class="ai-chip" data-query="How do volunteers complete food delivery?">📦 Delivery confirmation</button>
                    <button class="ai-chip" data-query="What are the food safety guidelines for volunteers during transit?">🥗 Transport safety</button>
                </div>
            `;
        } else {
            return `
                <p>I couldn't find a matching procedure for your question. Here are top step-by-step procedures you can look up:</p>
                <div class="dashboard-chips" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                    <button class="ai-chip" data-query="How do I donate food in this app?">🍱 How to donate?</button>
                    <button class="ai-chip" data-query="How does the AI freshness score work?">🌱 AI Freshness check</button>
                    <button class="ai-chip" data-query="What are the common error messages and fixes?">⚠️ Common errors & fixes</button>
                </div>
            `;
        }
    }

    async function showBotResponse(userQuery, messagesContainer, historyArray) {
        historyArray.push({ role: "user", text: userQuery });

        const indicatorDiv = document.createElement("div");
        if (messagesContainer.id === "chatMessages") {
            indicatorDiv.className = "bot-message typing-indicator-wrapper";
        } else {
            indicatorDiv.className = "ai-msg bot typing-indicator-wrapper";
        }
        indicatorDiv.innerHTML = `
            <div class="ai-typing-indicator">
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(indicatorDiv);
        scrollToBottom(messagesContainer);

        let responseHtml = "";
        const role = (localStorage.getItem("role") || "donor").toLowerCase().trim();
        const email = localStorage.getItem("email") || "";

        try {
            const apiBase = typeof getApiBase === "function" ? getApiBase() : (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://127.0.0.1:5000" : "https://food-donation-ai1.onrender.com");
            const res = await fetch(`${apiBase}/assistant/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Role": role,
                    "X-User-Email": email
                },
                body: JSON.stringify({
                    message: userQuery,
                    history: historyArray,
                    user_role: role,
                    user_email: email
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === "success" && data.reply) {
                    responseHtml = data.reply;
                }
            }
        } catch (err) {
            console.warn("Backend AI Assistant API call skipped/failed, falling back to local QA:", err);
        }

        if (!responseHtml) {
            const cleanQuery = userQuery.toLowerCase().trim();
            const predefined = Object.keys(LOCAL_QA_DATABASE);
            const exactKey = predefined.find(k => k.toLowerCase() === cleanQuery);

            if (exactKey) {
                responseHtml = LOCAL_QA_DATABASE[exactKey];
            } else {
                const matchingKey = predefined.find(k => k.toLowerCase().includes(cleanQuery) || cleanQuery.includes(k.toLowerCase()));
                if (matchingKey) {
                    responseHtml = LOCAL_QA_DATABASE[matchingKey];
                } else {
                    const keywords = ["donate", "freshness", "error", "ngo", "volunteer", "category", "storage", "track", "offline", "about", "pickup", "delivery", "accept"];
                    const foundKeyword = keywords.find(word => cleanQuery.includes(word));

                    if (foundKeyword) {
                        const matchingKey = predefined.find(k => k.toLowerCase().includes(foundKeyword));
                        responseHtml = matchingKey ? LOCAL_QA_DATABASE[matchingKey] : getDefaultFallbackForRole(role);
                    } else {
                        responseHtml = getDefaultFallbackForRole(role);
                    }
                }
            }
        }

        indicatorDiv.remove();
        appendMessage(responseHtml, "bot", messagesContainer);
        historyArray.push({ role: "model", text: responseHtml });

        const newChips = messagesContainer.querySelector(".dashboard-chips:last-of-type");
        if (newChips) {
            bindChipListeners(newChips, messagesContainer, historyArray);
        }

        scrollToBottom(messagesContainer);
    }

    // Displays the main greeting inside the dashboard chat panel
    function showDashboardGreeting() {
        if (!dashboardMessages) return;
        const name = localStorage.getItem("name") || "User";
        const role = (localStorage.getItem("role") || "donor").toLowerCase().trim();

        // Dynamically update FAQ sidebar items based on role
        const faqList = document.querySelector(".faq-list");
        if (faqList) {
            if (role === "ngo") {
                faqList.innerHTML = `
                    <li data-query="How do NGOs accept available donations?"><i class="fa-solid fa-building-circle-check"></i> How to accept donations?</li>
                    <li data-query="How do NGOs manage accepted donations?"><i class="fa-solid fa-box-archive"></i> Managing accepted food</li>
                    <li data-query="How does NGO volunteer coordination work?"><i class="fa-solid fa-users"></i> Volunteer coordination</li>
                    <li data-query="How are donations matched with NGOs?"><i class="fa-solid fa-calculator"></i> NGO matching algorithm</li>
                    <li data-query="What details can I see inside the Reports panel?"><i class="fa-solid fa-chart-line"></i> Analytics & Reports</li>
                `;
            } else if (role === "volunteer") {
                faqList.innerHTML = `
                    <li data-query="How do volunteers manage assigned pickups?"><i class="fa-solid fa-truck-fast"></i> Assigned pickup guide</li>
                    <li data-query="How do volunteers complete food delivery?"><i class="fa-solid fa-boxes-packing"></i> Delivery confirmation</li>
                    <li data-query="What are the food safety guidelines for volunteers during transit?"><i class="fa-solid fa-shield-halved"></i> Food handling safety</li>
                    <li data-query="How does the matching algorithm select volunteers?"><i class="fa-solid fa-robot"></i> Dispatch algorithm</li>
                    <li data-query="What are the common error messages and fixes?"><i class="fa-solid fa-triangle-exclamation"></i> Troubleshooting & fixes</li>
                `;
            } else {
                faqList.innerHTML = `
                    <li data-query="How do I donate food in this app?"><i class="fa-solid fa-hand-holding-heart"></i> How to donate food?</li>
                    <li data-query="How does the AI freshness score work?"><i class="fa-solid fa-carrot"></i> AI Freshness check?</li>
                    <li data-query="What are the common error messages and fixes?"><i class="fa-solid fa-triangle-exclamation"></i> Common errors & fixes</li>
                    <li data-query="How are donations matched with NGOs?"><i class="fa-solid fa-building-circle-check"></i> NGO matching process</li>
                    <li data-query="Who collects the food after donation?"><i class="fa-solid fa-truck-fast"></i> Food collection & transit</li>
                `;
            }
            
            // Rebind sidebar FAQ click listeners
            faqList.querySelectorAll("li").forEach(item => {
                item.addEventListener("click", () => {
                    const queryText = item.getAttribute("data-query");
                    if (queryText) {
                        appendMessage(queryText, "user", dashboardMessages);
                        scrollToBottom(dashboardMessages);
                        showBotResponse(queryText, dashboardMessages, dashboardHistory);
                    }
                });
            });
        }

        let chipsHtml = "";
        let roleSummary = "";

        if (role === "ngo") {
            roleSummary = "I can help you with available donations, accepting donations, volunteer coordination, and distribution guidance.";
            chipsHtml = `
                <button class="ai-chip" data-query="How do NGOs accept available donations?">🏢 Accept donations</button>
                <button class="ai-chip" data-query="How do NGOs manage accepted donations?">📦 Manage accepted food</button>
                <button class="ai-chip" data-query="How does NGO volunteer coordination work?">🚚 Volunteer coordination</button>
            `;
        } else if (role === "volunteer") {
            roleSummary = "I can help you with pickup guidance, assigned deliveries, volunteer workflow, and safe food handling.";
            chipsHtml = `
                <button class="ai-chip" data-query="How do volunteers manage assigned pickups?">🚚 Pickup guidance</button>
                <button class="ai-chip" data-query="How do volunteers complete food delivery?">📦 Delivery confirmation</button>
                <button class="ai-chip" data-query="What are the food safety guidelines for volunteers during transit?">🥗 Transport safety</button>
            `;
        } else {
            roleSummary = "I can help you with food donation guidance, freshness score calculation, NGO matching, and donation tracking.";
            chipsHtml = `
                <button class="ai-chip" data-query="How do I donate food in this app?">🍱 How to donate?</button>
                <button class="ai-chip" data-query="How does the AI freshness score work?">🌱 AI Freshness check</button>
                <button class="ai-chip" data-query="What are the common error messages and fixes?">⚠️ Errors & fixes</button>
            `;
        }

        dashboardMessages.innerHTML = `
            <div class="bot-message">
                👋 Hello <strong id="chatUserName">${name}</strong>!
                <br><br>
                I'm your Smart Food Donation AI Assistant (${role.toUpperCase()} Mode).
                <br><br>
                ${roleSummary}
                <br><br>
                <strong>Quick Questions:</strong>
                <div class="dashboard-chips" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                    ${chipsHtml}
                </div>
            </div>
        `;
        bindChipListeners(dashboardMessages.querySelector(".dashboard-chips"), dashboardMessages, dashboardHistory);
        scrollToBottom(dashboardMessages);
    }

    // Safe listeners for quick click chips
    function bindChipListeners(chipsContainer, messagesContainer, historyArray) {
        if (!chipsContainer) return;
        chipsContainer.querySelectorAll(".ai-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                const queryText = chip.getAttribute("data-query");
                appendMessage(queryText, "user", messagesContainer);
                scrollToBottom(messagesContainer);
                showBotResponse(queryText, messagesContainer, historyArray);
            });
        });
    }

    // Dynamic autocomplete logic as the user types
    function setupAutocomplete(inputElement, suggestionsPanel, messagesContainer, historyArray) {
        if (!inputElement || !suggestionsPanel) return;

        const showSuggestions = (query) => {
            const cleanQuery = query.toLowerCase().trim();
            if (!cleanQuery) {
                suggestionsPanel.classList.remove("show");
                return;
            }

            // Filter predefined questions list
            const matches = PREDEFINED_QUESTIONS.filter(q => q.toLowerCase().includes(cleanQuery));

            if (matches.length > 0) {
                suggestionsPanel.innerHTML = matches.map(match => `
                    <div class="ai-suggestion-item" data-query="${match}">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <span>${match}</span>
                    </div>
                `).join("");

                suggestionsPanel.classList.add("show");

                // Bind click events to suggestion items
                suggestionsPanel.querySelectorAll(".ai-suggestion-item").forEach(item => {
                    item.addEventListener("click", () => {
                        const selectedQuery = item.getAttribute("data-query");
                        inputElement.value = "";
                        suggestionsPanel.classList.remove("show");
                        
                        // Send query to AI
                        appendMessage(selectedQuery, "user", messagesContainer);
                        scrollToBottom(messagesContainer);
                        showBotResponse(selectedQuery, messagesContainer, historyArray);
                    });
                });
            } else {
                suggestionsPanel.classList.remove("show");
            }
        };

        // Listen for input changes
        inputElement.addEventListener("input", (e) => {
            showSuggestions(e.target.value);
        });

        // Focus event shows suggestions if input has value
        inputElement.addEventListener("focus", (e) => {
            showSuggestions(e.target.value);
        });

        // Hide suggestions when clicking outside
        document.addEventListener("click", (e) => {
            if (!suggestionsPanel.contains(e.target) && e.target !== inputElement) {
                suggestionsPanel.classList.remove("show");
            }
        });
    }
});
