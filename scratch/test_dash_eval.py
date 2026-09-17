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
            
            # Go to login.html
            await send_cdp(ws, "Page.navigate", {"url": f"http://127.0.0.1:{HTTP_PORT}/login.html"})
            await asyncio.sleep(0.5)
            
            # Set donor user
            await send_cdp(ws, "Runtime.evaluate", {
                "expression": "localStorage.setItem('email', 'donor@foodbridge.test'); localStorage.setItem('role', 'donor'); localStorage.setItem('name', 'Donor User'); localStorage.setItem('isLoggedIn', 'true');"
            })
            
            # Go to dashboard.html
            await send_cdp(ws, "Page.navigate", {"url": f"http://127.0.0.1:{HTTP_PORT}/dashboard.html"})
            await asyncio.sleep(1.0)
            
            # Check what URL browser is currently on
            url_res = await send_cdp(ws, "Runtime.evaluate", {"expression": "window.location.href"})
            print("Current URL:", url_res.get("result", {}).get("value"))
            
            # Check if profileBtn exists
            btn_res = await send_cdp(ws, "Runtime.evaluate", {"expression": "!!document.getElementById('profileBtn')"})
            print("profileBtn exists:", btn_res.get("result", {}).get("value"))
            
            # Try calling window.switchTab('sidebarSettings')
            switch_res = await send_cdp(ws, "Runtime.evaluate", {
                "expression": """
                    (function() {
                        try {
                            if (typeof window.switchTab === 'function') {
                                window.switchTab('sidebarSettings');
                            }
                            const homeSec = document.getElementById('dashboardHomeSection');
                            const profSec = document.getElementById('settingsSection');
                            return {
                                hasSwitchTab: typeof window.switchTab === 'function',
                                homeDisp: homeSec ? window.getComputedStyle(homeSec).display : 'no_home_el',
                                profDisp: profSec ? window.getComputedStyle(profSec).display : 'no_prof_el'
                            };
                        } catch(err) {
                            return { error: err.message, stack: err.stack };
                        }
                    })()
                """,
                "returnByValue": True
            })
            print("Switch result:", switch_res.get("result", {}).get("value"))
            
    finally:
        proc.terminate()
        server.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
