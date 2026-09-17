import subprocess
import time
import urllib.request
import json
import asyncio
import sys
import websockets

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9222
HTTP_PORT = 8090

# Start local web server
def start_web_server():
    import http.server
    import socketserver
    import threading
    DIRECTORY = "c:/Users/ELCOT/Documents/food donation ai/frontend"
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=DIRECTORY, **kwargs)
    server = socketserver.TCPServer(("", HTTP_PORT), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

req_counter = 1

async def send_cdp(ws, method, params=None):
    global req_counter
    req_counter += 1
    req_id = req_counter
    msg = {"id": req_id, "method": method, "params": params or {}}
    await ws.send(json.dumps(msg))
    while True:
        resp = await ws.recv()
        data = json.loads(resp)
        if data.get("id") == req_id:
            return data.get("result", {})

async def eval_js(ws, expr):
    res = await send_cdp(ws, "Runtime.evaluate", {
        "expression": expr,
        "returnByValue": True,
        "awaitPromise": True
    })
    result = res.get("result", {})
    return result.get("value")

async def test_role_cdp(ws_url, role, email, is_admin=False):
    print(f"\n--------------------------------------------------")
    print(f" TESTING ROLE: {role.upper()} (Pixel 7: 412x915)")
    print(f"--------------------------------------------------")
    async with websockets.connect(ws_url) as ws:
        # Enable domains
        await send_cdp(ws, "Page.enable")
        await send_cdp(ws, "DOM.enable")
        await send_cdp(ws, "Runtime.enable")
        await send_cdp(ws, "Emulation.setDeviceMetricsOverride", {
            "width": 412,
            "height": 915,
            "deviceScaleFactor": 2.625,
            "mobile": True
        })
        
        # Navigate to login first to set localStorage
        await send_cdp(ws, "Page.navigate", {"url": f"http://127.0.0.1:{HTTP_PORT}/login.html"})
        await asyncio.sleep(0.5)
        
        # Inject LocalStorage
        js_code = f"""
            localStorage.setItem('email', '{email}');
            localStorage.setItem('role', '{role.lower()}');
            localStorage.setItem('name', '{role} User');
            localStorage.setItem('isLoggedIn', 'true');
        """
        await eval_js(ws, js_code)
        
        # Navigate to targeted dashboard
        target_page = "admin.html" if is_admin else "dashboard.html"
        await send_cdp(ws, "Page.navigate", {"url": f"http://127.0.0.1:{HTTP_PORT}/{target_page}"})
        await asyncio.sleep(1.0)
        
        home_sec_id = "adminHomeSection" if is_admin else "dashboardHomeSection"
        prof_sec_id = "adminSettingsSection" if is_admin else "settingsSection"
        
        # Test 5 repeat open/close cycles
        for cycle in range(1, 6):
            # Click profile button
            click_btn_js = """
                (function() {
                    const btn = document.getElementById("profileBtn");
                    if (!btn) return "btn_not_found";
                    btn.click();
                    const menu = document.getElementById("profileMenu");
                    return menu ? (menu.classList.contains("show") || menu.classList.contains("active")) : false;
                })()
            """
            menu_active = await eval_js(ws, click_btn_js)
            
            # Click Profile link in dropdown/menu to open Profile section
            click_link_js = f"""
                (function() {{
                    if (typeof window.switchTab === "function") {{
                        window.switchTab("sidebarSettings");
                    }} else if (typeof window.navigateToSection === "function") {{
                        window.navigateToSection("sidebarAdminSettings");
                    }}
                    const homeSec = document.getElementById("{home_sec_id}");
                    const profSec = document.getElementById("{prof_sec_id}");
                    const homeDisp = homeSec ? window.getComputedStyle(homeSec).display : "none";
                    const profDisp = profSec ? window.getComputedStyle(profSec).display : "none";
                    return {{ menuActive: {json.dumps(menu_active)}, homeDisp: homeDisp, profDisp: profDisp }};
                }})()
            """
            state = await eval_js(ws, click_link_js) or {}
            
            home_disp = state.get("homeDisp")
            prof_disp = state.get("profDisp")
            
            print(f"   [Cycle {cycle}/5] Home Section: '{home_disp}' | Profile Section: '{prof_disp}'")
            
            if home_disp != "none" or prof_disp != "block":
                print(f"      [FAIL] Cycle {cycle}: Expected Home='none', Profile='block'. Got Home='{home_disp}', Profile='{prof_disp}'")
                return False
            
            # Close profile view / return home
            go_home_js = f"""
                (function() {{
                    if (typeof window.switchTab === "function") {{
                        window.switchTab("sidebarHome");
                    }} else if (typeof window.navigateToSection === "function") {{
                        window.navigateToSection("sidebarAdminHome");
                    }}
                }})()
            """
            await eval_js(ws, go_home_js)
            await asyncio.sleep(0.1)
                
        print(f"   [PASS] Role {role.upper()} passed 5 repeat profile opening cycles cleanly.")
        return True

async def main():
    server = start_web_server()
    print(f"Started web server at http://127.0.0.1:{HTTP_PORT}")
    
    # Launch Headless Edge with CDP
    proc = subprocess.Popen([
        EDGE_PATH,
        "--headless",
        f"--remote-debugging-port={PORT}",
        "--no-sandbox",
        "--disable-gpu"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    time.sleep(1.5)
    
    try:
        targets_resp = urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json")
        targets = json.loads(targets_resp.read().decode())
        page_target = next(t for t in targets if t.get("type") == "page")
        ws_url = page_target["webSocketDebuggerUrl"]
        
        admin_pass = await test_role_cdp(ws_url, "Admin", "admin@foodbridge.test", is_admin=True)
        donor_pass = await test_role_cdp(ws_url, "Donor", "donor@foodbridge.test", is_admin=False)
        ngo_pass = await test_role_cdp(ws_url, "NGO", "ngo@foodbridge.test", is_admin=False)
        vol_pass = await test_role_cdp(ws_url, "Volunteer", "volunteer@foodbridge.test", is_admin=False)
        
        print("\n==================================================")
        print(" FINAL PROFILE VERIFICATION RESULT")
        print("==================================================")
        print(f" Admin Profile (Pixel 7 412x915):     { 'PASS' if admin_pass else 'FAIL' }")
        print(f" Donor Profile (Pixel 7 412x915):     { 'PASS' if donor_pass else 'FAIL' }")
        print(f" NGO Profile (Pixel 7 412x915):       { 'PASS' if ngo_pass else 'FAIL' }")
        print(f" Volunteer Profile (Pixel 7 412x915): { 'PASS' if vol_pass else 'FAIL' }")
        print("==================================================")
        
        if admin_pass and donor_pass and ngo_pass and vol_pass:
            print("\n[ALL ACCEPTANCE CRITERIA PASSED SUCCESSFULLY]")
            sys.exit(0)
        else:
            print("\n[VERIFICATION FAILED]")
            sys.exit(1)
    finally:
        proc.terminate()
        server.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
