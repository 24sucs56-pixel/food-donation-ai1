import subprocess
import time
import urllib.request
import json
import socket
import struct

def create_websocket(ws_url):
    url_parts = ws_url.replace("ws://", "").split("/", 1)
    host_port = url_parts[0].split(":")
    host = host_port[0]
    port = int(host_port[1])
    path = "/" + url_parts[1]

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))

    sec_key = "dGhlIHNhbXBsZSBub25jZQ=="
    handshake = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {sec_key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(handshake.encode('utf-8'))
    resp = s.recv(4096)
    return s

def send_ws_json(s, data_dict):
    msg = json.dumps(data_dict).encode('utf-8')
    length = len(msg)
    mask = b'\x12\x34\x56\x78'
    header = bytearray()
    header.append(0x81)
    if length <= 125:
        header.append(0x80 | length)
    elif length <= 65535:
        header.append(0x80 | 126)
        header.extend(struct.pack("!H", length))
    else:
        header.append(0x80 | 127)
        header.extend(struct.pack("!Q", length))
    header.extend(mask)
    masked_msg = bytearray(length)
    for i in range(length):
        masked_msg[i] = msg[i] ^ mask[i % 4]
    s.sendall(header + masked_msg)

def recv_ws_json(s):
    data = s.recv(65536)
    if not data:
        return None
    payload_len = data[1] & 0x7f
    idx = 2
    if payload_len == 126:
        payload_len = struct.unpack("!H", data[2:4])[0]
        idx = 4
    elif payload_len == 127:
        payload_len = struct.unpack("!Q", data[2:10])[0]
        idx = 10
    payload = data[idx:idx+payload_len]
    try:
        return json.loads(payload.decode('utf-8', errors='ignore'))
    except Exception as e:
        return {"raw": payload.decode('utf-8', errors='ignore')}

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
user_data_dir = r"C:\Users\ELCOT\Documents\food donation ai\scratch\edge_profile"

proc = subprocess.Popen([
    edge_path,
    "--headless=new",
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--disable-web-security",
    "--window-size=412,915",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--no-default-browser-check",
    "http://127.0.0.1:8080/login.html"
])

time.sleep(2)

try:
    res = urllib.request.urlopen("http://127.0.0.1:9222/json")
    pages = json.loads(res.read())
    ws_url = pages[0].get("webSocketDebuggerUrl")

    if ws_url:
        ws = create_websocket(ws_url)
        
        def eval_js(expr, req_id):
            send_ws_json(ws, {
                "id": req_id,
                "method": "Runtime.evaluate",
                "params": {"expression": expr, "returnByValue": True}
            })
            time.sleep(0.15)
            res = recv_ws_json(ws)
            if res and "result" in res and "result" in res["result"]:
                return res["result"]["result"].get("value")
            return res

        # 1. Login session setup
        eval_js("localStorage.setItem('role', 'admin'); localStorage.setItem('email', 'admin.demo@foodbridge.test'); localStorage.setItem('name', 'Admin'); location.href = 'http://127.0.0.1:8080/admin.html';", 1)
        time.sleep(1.5)

        res = urllib.request.urlopen("http://127.0.0.1:9222/json")
        pages = json.loads(res.read())
        ws_url = pages[0].get("webSocketDebuggerUrl")
        ws = create_websocket(ws_url)

        print("\n==========================================", flush=True)
        print("VERIFICATION TEST 1: REPEATED PROFILE CLICKS", flush=True)
        print("==========================================", flush=True)
        for i in range(1, 16):
            eval_js("window.navigateToSection('sidebarAdminHome');", 10 + i*4)
            home_disp = eval_js("document.getElementById('adminHomeSection').style.display", 11 + i*4)
            
            eval_js("document.getElementById('profileBtn').click();", 12 + i*4)
            menu_class = eval_js("document.getElementById('profileMenu').className", 13 + i*4)
            
            eval_js("document.getElementById('profileLinkBtn').click();", 14 + i*4)
            sett_disp = eval_js("document.getElementById('adminSettingsSection').style.display", 15 + i*4)
            
            status = "PASS" if sett_disp == "block" else "FAIL"
            print(f"Iteration {i:2d}: [{status}] Home Section: {home_disp} -> Profile Menu: {menu_class} -> Profile Section: {sett_disp}", flush=True)

        print("\n==========================================", flush=True)
        print("VERIFICATION TEST 2: EDIT & SAVE PROFILE CYCLE", flush=True)
        print("==========================================", flush=True)
        eval_js("document.getElementById('editAdminProfileBtn').click();", 100)
        eval_js("document.getElementById('adminSettingsName').value = 'Updated System Admin';", 101)
        save_status = eval_js("document.getElementById('saveAdminProfileBtn').click(); 'Save button clicked'", 102)
        print("Profile Edit & Save:", save_status, flush=True)

        eval_js("window.navigateToSection('sidebarAdminHome');", 103)
        print("Returned to Dashboard. Home section:", eval_js("document.getElementById('adminHomeSection').style.display", 104), flush=True)

        eval_js("document.getElementById('profileBtn').click();", 105)
        eval_js("document.getElementById('profileLinkBtn').click();", 106)
        post_save_sett = eval_js("document.getElementById('adminSettingsSection').style.display", 107)
        print("Re-opening Profile after Edit/Save: [PASS]" if post_save_sett == "block" else "FAIL", flush=True)

        print("\n==========================================", flush=True)
        print("VERIFICATION TEST 3: MODULE SWITCHING INTERACTION", flush=True)
        print("==========================================", flush=True)
        modules = ["sidebarAdminUsers", "sidebarAdminNGOs", "sidebarAdminDonors", "sidebarAdminVolunteers", "sidebarAdminDonations", "sidebarAdminReports"]
        for mod in modules:
            eval_js(f"window.navigateToSection('{mod}');", 200)
            eval_js("document.getElementById('profileBtn').click();", 201)
            eval_js("document.getElementById('profileLinkBtn').click();", 202)
            s_disp = eval_js("document.getElementById('adminSettingsSection').style.display", 203)
            print(f"Switch to {mod} -> Open Profile: [{'PASS' if s_disp == 'block' else 'FAIL'}]", flush=True)

finally:
    proc.terminate()
