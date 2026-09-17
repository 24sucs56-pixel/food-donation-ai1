import subprocess
import time
import urllib.request
import json
import asyncio
import sys
import websockets

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9222
HTTP_PORT = 8092

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

async def capture_screenshot(ws, filename):
    import base64
    res = await send_cdp(ws, "Page.captureScreenshot", {"format": "png"})
    data = res.get("data")
    if data:
        with open(filename, "wb") as f:
            f.write(base64.b64decode(data))
        print(f"Captured screenshot: {filename}")

async def test_and_capture(ws_url, role, email, is_admin=False):
    async with websockets.connect(ws_url) as ws:
        await send_cdp(ws, "Page.enable")
        await send_cdp(ws, "DOM.enable")
        await send_cdp(ws, "Runtime.enable")
        await send_cdp(ws, "Emulation.setDeviceMetricsOverride", {
            "width": 412,
            "height": 915,
            "deviceScaleFactor": 2.625,
            "mobile": True
        })
        
        # Navigate to login first
        await send_cdp(ws, "Page.navigate", {"url": f"http://127.0.0.1:{HTTP_PORT}/login.html"})
        await asyncio.sleep(0.5)
        
        # Set user
        await eval_js(ws, f"""
            localStorage.setItem('email', '{email}');
            localStorage.setItem('role', '{role.lower()}');
            localStorage.setItem('name', '{role} User');
            localStorage.setItem('isLoggedIn', 'true');
        """)
        
        target_page = "admin.html" if is_admin else "dashboard.html"
        await send_cdp(ws, "Page.navigate", {"url": f"http://127.0.0.1:{HTTP_PORT}/{target_page}"})
        await asyncio.sleep(1.0)
        
        # 1. Click Profile Button directly to open Profile section
        await eval_js(ws, "document.getElementById('profileBtn').click();")
        await asyncio.sleep(0.5)
        await capture_screenshot(ws, f"c:/Users/ELCOT/Documents/food donation ai/scratch/{role}_direct_profile_pixel7.png")

async def main():
    server = start_web_server()
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
        
        await test_and_capture(ws_url, "Admin", "admin@foodbridge.test", is_admin=True)
        await test_and_capture(ws_url, "Donor", "donor@foodbridge.test", is_admin=False)
        await test_and_capture(ws_url, "NGO", "ngo@foodbridge.test", is_admin=False)
        await test_and_capture(ws_url, "Volunteer", "volunteer@foodbridge.test", is_admin=False)
        print("\n[ALL 4 ROLES SCREENSHOTS CAPTURED SUCCESSFULLY]")
    finally:
        proc.terminate()
        server.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
