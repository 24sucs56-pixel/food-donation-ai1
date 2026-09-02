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
        "Can I change my pickup address after submitting a donation?": `
            <p><strong>✏️ Updating Donation Information:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Check Claim Status</strong>: You can only edit details if the donation is still in the "Waiting" status.</li>
                <li><strong>Go to My Donations</strong>: Click on <strong><a href="mydonations.html">My Donations</a></strong> and select the donation.</li>
                <li><strong>Click Edit</strong>: Press the edit icon to change the pickup address or coordinates.</li>
                <li><strong>Confirm Changes</strong>: Re-submit the form to update coordinates for nearby volunteers.</li>
            </ol>
        `,
        "What should I do if the food is close to expiry?": `
            <p><strong>⚠️ Action Plan for Near-Expiry Donations:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Immediate Storage</strong>: Keep the food refrigerated or frozen to slow down spoilage.</li>
                <li><strong>Set Accurate Timings</strong>: Ensure you enter the exact expiry time when donating.</li>
                <li><strong>AI Flash Alert</strong>: The system automatically tags items with less than 3 hours left as "High Priority".</li>
                <li><strong>Local Direct Contact</strong>: Direct contact numbers for matching volunteers will be shared to speed up collection.</li>
            </ol>
        `,
        "How does the system notify NGOs about donations?": `
            <p><strong>🔔 NGO Notification System:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Instantly Matches</strong>: The backend checks for nearby matching NGOs as soon as a donor submits food.</li>
                <li><strong>Dashboard Alert</strong>: An orange alert badge appears on the NGO's top bar notification bell.</li>
                <li><strong>Map Pins</strong>: Available donations appear immediately as interactive pins on the NGO's map.</li>
                <li><strong>Claim Window</strong>: NGOs have 30 minutes to claim high-priority foods before they are opened to other agencies.</li>
            </ol>
        `,
        "How can I contact support or view the Help Center?": `
            <p><strong>📞 Contacting Support & Help Center:</strong></p>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
                <li><strong>Profile Menu</strong>: Click on your avatar in the top bar to open the user menu.</li>
                <li><strong>Select Help Center</strong>: Click <strong>"Help Center"</strong>.</li>
                <li><strong>Read FAQs</strong>: Browse through our knowledgebase categories.</li>
                <li><strong>Submit Support Ticket</strong>: Use the contact form at the bottom of the page to message our admin team directly.</li>
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
                        <span>Local Mode</span>
                    </div>
                </div>
                <button id="closeChatBtn" class="ai-chat-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div id="widgetMessages" class="ai-chat-messages">
                <div class="ai-msg bot">
                    <p>👋 Hello! I'm your Smart Food Donation AI Assistant.</p>
                    <p>I can help you navigate the app, explain how to donate food, and troubleshoot common errors. What can I do for you today?</p>
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

        // Setup initial greeting message with interactive new-user chips
        showDashboardGreeting();

        // Setup sidebar FAQ click listeners
        const faqListItems = document.querySelectorAll(".faq-list li");
        if (faqListItems) {
            faqListItems.forEach(item => {
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

        // Process response locally
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

    function showBotResponse(userQuery, messagesContainer, historyArray) {
        // Append user message to local history context
        historyArray.push({ role: "user", text: userQuery });

        // Create typing indicator element
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

        // Simulate typing animation delay (500ms) for high-quality local flow
        setTimeout(() => {
            indicatorDiv.remove();

            // Find matching step-by-step procedure locally
            const cleanQuery = userQuery.toLowerCase().trim();
            let responseHtml = "";

            // Check exact key match
            const exactKey = PREDEFINED_QUESTIONS.find(k => k.toLowerCase() === cleanQuery);
            if (exactKey) {
                responseHtml = LOCAL_QA_DATABASE[exactKey];
            } else {
                // Check substring match
                const matchingKey = PREDEFINED_QUESTIONS.find(k => k.toLowerCase().includes(cleanQuery) || cleanQuery.includes(k.toLowerCase()));
                if (matchingKey) {
                    responseHtml = LOCAL_QA_DATABASE[matchingKey];
                } else {
                    // Search keywords
                    const keywords = ["donate", "freshness", "error", "ngo", "volunteer", "category", "storage", "track", "offline", "about"];
                    const foundKeyword = keywords.find(word => cleanQuery.includes(word));
                    
                    if (foundKeyword) {
                        const matchingKey = PREDEFINED_QUESTIONS.find(k => k.toLowerCase().includes(foundKeyword));
                        responseHtml = LOCAL_QA_DATABASE[matchingKey];
                    } else {
                        // Default offline template response
                        responseHtml = `
                            <p>I couldn't find a matching procedure for your question. Here are the top step-by-step procedures you can look up:</p>
                            <div class="dashboard-chips" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                                <button class="ai-chip" data-query="How do I donate food in this app?">🍱 How to donate?</button>
                                <button class="ai-chip" data-query="How does the AI freshness score work?">🌱 AI Freshness check</button>
                                <button class="ai-chip" data-query="What are the common error messages and fixes?">⚠️ Common errors & fixes</button>
                            </div>
                        `;
                    }
                }
            }

            appendMessage(responseHtml, "bot", messagesContainer);
            historyArray.push({ role: "model", text: responseHtml });
            
            // Re-bind chip listeners in case chips were generated inside responseHtml
            const newChips = messagesContainer.querySelector(".dashboard-chips:last-of-type");
            if (newChips) {
                bindChipListeners(newChips, messagesContainer, historyArray);
            }

            scrollToBottom(messagesContainer);
        }, 500);
    }

    // Displays the main greeting inside the dashboard chat panel
    function showDashboardGreeting() {
        if (!dashboardMessages) return;
        const name = localStorage.getItem("name") || "User";
        dashboardMessages.innerHTML = `
            <div class="bot-message">
                👋 Hello <strong id="chatUserName">${name}</strong>!
                <br><br>
                I'm your Smart Food Donation AI Assistant (Local Mode).
                <br><br>
                I can help you navigate the app with step-by-step instructions.
                <br><br>
                <strong>Quick Questions for New Users:</strong>
                <div class="dashboard-chips" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                    <button class="ai-chip" data-query="How do I donate food in this app?">🍱 How to donate?</button>
                    <button class="ai-chip" data-query="How does the AI freshness score work?">🌱 AI Freshness check</button>
                    <button class="ai-chip" data-query="What are the common error messages and fixes?">⚠️ Errors & fixes</button>
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

