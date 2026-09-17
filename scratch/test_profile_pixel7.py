import asyncio
from playwright.async_api import async_playwright
import os

async def test_role(page, role_name, email, is_admin=False):
    print(f"\n==========================================")
    print(f" TESTING ROLE: {role_name} (Pixel 7: 412x915)")
    print(f"==========================================")
    
    page_url = "http://127.0.0.1:8080/admin.html" if is_admin else "http://127.0.0.1:8080/dashboard.html"
    
    # Set LocalStorage before loading
    await page.goto("http://127.0.0.1:8080/login.html")
    await page.evaluate(f"""() => {{
        localStorage.setItem('email', '{email}');
        localStorage.setItem('role', '{role_name.lower()}');
        localStorage.setItem('name', '{role_name} User');
        localStorage.setItem('isLoggedIn', 'true');
    }}""")
    
    await page.goto(page_url)
    await page.wait_for_timeout(1000)
    
    print(f"1. Initial URL: {page.url}")
    
    # Check Profile Button visibility and tap behavior
    profile_btn = page.locator("#profileBtn")
    btn_count = await profile_btn.count()
    print(f"2. #profileBtn element count: {btn_count}")
    if btn_count > 0:
        is_visible = await profile_btn.is_visible()
        bbox = await profile_btn.bounding_box()
        print(f"   #profileBtn visible: {is_visible}, bbox: {bbox}")
    
    # Click Profile Button
    print("3. Clicking #profileBtn...")
    await profile_btn.click()
    await page.wait_for_timeout(500)
    
    # Check #profileMenu status
    profile_menu = page.locator("#profileMenu")
    menu_count = await profile_menu.count()
    if menu_count > 0:
        menu_class = await profile_menu.get_attribute("class")
        menu_visible = await profile_menu.is_visible()
        menu_bbox = await profile_menu.bounding_box()
        print(f"4. #profileMenu class: '{menu_class}', visible: {menu_visible}, bbox: {menu_bbox}")
    
    # If menu is visible, click 'My Profile' or 'Admin Profile'
    my_profile_btn = page.locator("#profileLinkBtn" if is_admin else "#profileMenuMyProfile")
    if await my_profile_btn.count() > 0 and await my_profile_btn.is_visible():
        print("5. Clicking Profile option in menu...")
        await my_profile_btn.click()
        await page.wait_for_timeout(500)
    
    # Check sections visibility
    home_sec = page.locator("#adminHomeSection" if is_admin else "#dashboardHomeSection")
    settings_sec = page.locator("#adminSettingsSection" if is_admin else "#settingsSection")
    
    home_disp = await home_sec.evaluate("el => window.getComputedStyle(el).display") if await home_sec.count() > 0 else "N/A"
    settings_disp = await settings_sec.evaluate("el => window.getComputedStyle(el).display") if await settings_sec.count() > 0 else "N/A"
    
    print(f"6. Section display states: Home='{home_disp}', Settings='{settings_disp}'")
    
    # Take screenshot
    ss_path = f"c:/Users/ELCOT/Documents/food donation ai/scratch/{role_name}_pixel7.png"
    await page.screenshot(path=ss_path)
    print(f"7. Saved screenshot to {ss_path}")

async def main():
    import http.server
    import socketserver
    import threading

    PORT = 8080
    DIRECTORY = "c:/Users/ELCOT/Documents/food donation ai/frontend"

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=DIRECTORY, **kwargs)

    server = socketserver.TCPServer(("", PORT), Handler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    print(f"HTTP Server running at http://127.0.0.1:{PORT}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Pixel 7 Viewport
        context = await browser.new_context(
            viewport={"width": 412, "height": 915},
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
        )
        page = await context.new_page()

        await test_role(page, "Admin", "admin@foodbridge.test", is_admin=True)
        await test_role(page, "Donor", "donor@foodbridge.test", is_admin=False)
        await test_role(page, "NGO", "ngo@foodbridge.test", is_admin=False)
        await test_role(page, "Volunteer", "volunteer@foodbridge.test", is_admin=False)

        await browser.close()
    server.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
