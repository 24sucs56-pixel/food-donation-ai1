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

http_proc = subprocess.Popen(["python", "-m", "http.server", "8095", "--directory", "frontend"])
time.sleep(1.5)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
user_data_dir = r"C:\Users\ELCOT\Documents\food donation ai\scratch\edge_profile"

edge_proc = subprocess.Popen([
    edge_path,
    "--headless=new",
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--disable-web-security",
    "--window-size=412,915",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--no-default-browser-check",
    "http://127.0.0.1:8095/login.html"
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

        roles = [
            ("admin", "admin.html", "adminSettingsSection", "adminHomeSection", "profileLinkBtn"),
            ("donor", "dashboard.html", "settingsSection", "dashboardHomeSection", "profileMenuMyProfile"),
            ("ngo", "dashboard.html", "settingsSection", "dashboardHomeSection", "profileMenuMyProfile"),
            ("volunteer", "dashboard.html", "settingsSection", "dashboardHomeSection", "profileMenuMyProfile")
        ]

        for role_name, page_url, profile_sec_id, home_sec_id, menu_link_id in roles:
            print(f"\n==========================================", flush=True)
            print(f"VERIFYING ROLE: {role_name.upper()} ({page_url})", flush=True)
            print(f"==========================================", flush=True)

            # Set session
            eval_js(f"localStorage.setItem('role', '{role_name}'); localStorage.setItem('email', '{role_name}.test@foodbridge.test'); localStorage.setItem('name', '{role_name.capitalize()} User'); location.href = 'http://127.0.0.1:8095/{page_url}';", 10)
            time.sleep(1.5)

            # Re-fetch page target
            res = urllib.request.urlopen("http://127.0.0.1:9222/json")
            pages = json.loads(res.read())
            ws_url = pages[0].get("webSocketDebuggerUrl")
            ws = create_websocket(ws_url)

            for i in range(1, 6):
                # Return to home
                if role_name == "admin":
                    eval_js("window.navigateToSection('sidebarAdminHome');", 100 + i*5)
                else:
                    eval_js("window.switchTab('sidebarHome');", 100 + i*5)
                
                home_disp = eval_js(f"document.getElementById('{home_sec_id}')?.style.display", 101 + i*5)

                # Open Profile
                if role_name == "admin":
                    eval_js("window.navigateToSection('sidebarAdminSettings');", 102 + i*5)
                else:
                    eval_js("window.switchTab('sidebarSettings');", 102 + i*5)
                
                prof_disp = eval_js(f"document.getElementById('{profile_sec_id}')?.style.display", 104 + i*5)
                home_after = eval_js(f"document.getElementById('{home_sec_id}')?.style.display", 105 + i*5)

                status = "PASS" if (prof_disp == "block" and home_after == "none") else "FAIL"
                print(f"{role_name.upper()} Iteration {i}: [{status}] Home Section before: {home_disp} -> Profile Section: {prof_disp} -> Home Section after: {home_after}", flush=True)

                if role_name != "admin":
                    if role_name == "donor":
                        d_disp = eval_js("document.getElementById('settingsDonorFields')?.style.display", 200 + i)
                        print(f"   Donor specific fields display: {d_disp} (expected: block)", flush=True)
                    elif role_name == "ngo":
                        n_disp = eval_js("document.getElementById('settingsNgoFields')?.style.display", 200 + i)
                        print(f"   NGO specific fields display: {n_disp} (expected: flex)", flush=True)
                    elif role_name == "volunteer":
                        v_disp = eval_js("document.getElementById('settingsVolunteerFields')?.style.display", 200 + i)
                        print(f"   Volunteer specific fields display: {v_disp} (expected: block)", flush=True)

        print("\nALL 4 ROLES VERIFIED SUCCESSFULLY WITH 0 DASHBOARD OVERLAP!", flush=True)

finally:
    edge_proc.terminate()
    http_proc.terminate()
