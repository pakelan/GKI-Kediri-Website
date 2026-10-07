# Auth Testing Playbook — GKI Kediri

Step 1: MongoDB verification
```
mongosh
use app
db.users.find({role: "admin"}).pretty()
```
Verify: password_hash starts with `$2b$`; unique index on users.email; login_attempts.identifier index exists.

Step 2: API testing
```
curl -c /tmp/cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@gkikediri.org","password":"GKIKediri#2026"}'
cat /tmp/cookies.txt   # expect access_token + refresh_token
curl -b /tmp/cookies.txt http://localhost:8001/api/auth/me
curl -b /tmp/cookies.txt http://localhost:8001/api/admin/stats
```
Login returns the admin user object; /me returns the same user via cookie; /admin/stats returns collection counts.

Negative cases:
- Wrong password → 401 {"detail":"Email atau kata sandi salah"}
- /api/auth/me without cookie → 401
- 5x wrong password → 429 lockout 15 minutes

Step 3: Frontend flow
- /login with the credentials above → redirects to /admin
- /admin without login → redirected back to /login
- Logout button clears session → /login
