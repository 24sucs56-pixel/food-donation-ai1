import unittest
import json
from app import app

class TestRoleAuthorization(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_donor_cannot_access_admin_users(self):
        res = self.client.get("/admin/users", headers={"X-User-Role": "donor", "X-User-Email": "donor@example.com"})
        self.assertEqual(res.status_code, 403)
        data = res.get_json()
        self.assertEqual(data.get("status"), "error")

    def test_ngo_cannot_access_admin_users(self):
        res = self.client.get("/admin/users", headers={"X-User-Role": "ngo", "X-User-Email": "ngo@example.com"})
        self.assertEqual(res.status_code, 403)

    def test_volunteer_cannot_access_admin_users(self):
        res = self.client.get("/admin/users", headers={"X-User-Role": "volunteer", "X-User-Email": "vol@example.com"})
        self.assertEqual(res.status_code, 403)

    def test_admin_can_access_admin_users(self):
        res = self.client.get("/admin/users", headers={"X-User-Role": "admin", "X-User-Email": "admin@example.com"})
        self.assertEqual(res.status_code, 200)

    def test_public_donations_endpoint(self):
        res = self.client.get("/donations")
        self.assertEqual(res.status_code, 200)

    def test_unauthorized_ai_access(self):
        res = self.client.post("/assistant/chat", json={"message": "Hello"})
        self.assertEqual(res.status_code, 403)
        data = res.get_json()
        self.assertEqual(data.get("status"), "error")

    def test_donor_ai_access(self):
        res = self.client.post("/assistant/chat", 
                               json={"message": "How do I donate food?"},
                               headers={"X-User-Role": "donor", "X-User-Email": "donor@example.com"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("status"), "success")

    def test_ngo_ai_access(self):
        res = self.client.post("/assistant/chat", 
                               json={"message": "How to accept donations?"},
                               headers={"X-User-Role": "ngo", "X-User-Email": "ngo@example.com"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("status"), "success")

    def test_volunteer_ai_access(self):
        res = self.client.post("/assistant/chat", 
                               json={"message": "How to deliver food?"},
                               headers={"X-User-Role": "volunteer", "X-User-Email": "vol@example.com"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("status"), "success")

if __name__ == "__main__":
    unittest.main()
