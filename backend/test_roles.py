import unittest
import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:5000"

def make_request(path, headers=None):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode()) if e.fp else {}
        return e.code, body

class TestRoleAuthorization(unittest.TestCase):
    def test_donor_cannot_access_admin_users(self):
        status, body = make_request("/admin/users", {"X-User-Role": "donor", "X-User-Email": "donor@example.com"})
        self.assertEqual(status, 403)
        self.assertEqual(body.get("status"), "error")

    def test_ngo_cannot_access_admin_users(self):
        status, body = make_request("/admin/users", {"X-User-Role": "ngo", "X-User-Email": "ngo@example.com"})
        self.assertEqual(status, 403)

    def test_volunteer_cannot_access_admin_users(self):
        status, body = make_request("/admin/users", {"X-User-Role": "volunteer", "X-User-Email": "vol@example.com"})
        self.assertEqual(status, 403)

    def test_admin_can_access_admin_users(self):
        status, body = make_request("/admin/users", {"X-User-Role": "admin", "X-User-Email": "admin@example.com"})
        self.assertEqual(status, 200)

    def test_public_donations_endpoint(self):
        status, body = make_request("/donations")
        self.assertEqual(status, 200)

if __name__ == "__main__":
    unittest.main()
