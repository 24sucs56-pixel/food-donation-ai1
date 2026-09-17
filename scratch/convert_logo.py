import subprocess
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
user_data_dir = r"C:\Users\ELCOT\Documents\food donation ai\scratch\edge_profile"

full_svg = os.path.abspath(r"c:\Users\ELCOT\Documents\food donation ai\frontend\images\smart-donation-logo.svg")
icon_svg = os.path.abspath(r"c:\Users\ELCOT\Documents\food donation ai\frontend\images\smart-donation-icon.svg")

logo_png = os.path.abspath(r"c:\Users\ELCOT\Documents\food donation ai\frontend\images\logo.png")
icon_png = os.path.abspath(r"c:\Users\ELCOT\Documents\food donation ai\frontend\images\smart-donation-icon.png")

# Convert full logo SVG -> PNG
subprocess.run([
    edge_path,
    "--headless=new",
    "--window-size=512,140",
    "--force-device-scale-factor=2",
    f"--screenshot={logo_png}",
    full_svg
], check=True)
print("Saved full logo PNG to:", logo_png)

# Convert icon SVG -> PNG
subprocess.run([
    edge_path,
    "--headless=new",
    "--window-size=256,256",
    "--force-device-scale-factor=2",
    f"--screenshot={icon_png}",
    icon_svg
], check=True)
print("Saved icon PNG to:", icon_png)
