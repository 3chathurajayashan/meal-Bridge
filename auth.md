# Authentication API — Login

## Login

Authenticates a registered user using their email and password.

### Endpoint

```http
POST http://localhost:5002/api/auth/login
```

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "yourPassword"
}
```

### Example Request

```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "yourPassword"
  }'
```

### Successful Response

**Status:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### Response Fields

| Field          | Type   | Description                                        |
| -------------- | ------ | -------------------------------------------------- |
| `accessToken`  | String | JWT access token used to authenticate API requests |
| `refreshToken` | String | Token used to obtain a new access token            |
| `user`         | Object | Authenticated user's information                   |
| `user.id`      | String | User ID                                            |
| `user.email`   | String | User email address                                 |
| `user.role`    | String | User's role, e.g. `ADMIN`                          |

### Error Response

If the credentials are invalid or the login request fails:

**Status:** `401 Unauthorized`

```json
{
  "message": "Invalid email or password"
}
```

### React Native Example

```typescript
const response = await fetch(
    "http://localhost:5002/api/auth/login",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email.trim(),
            password,
        }),
    }
);

const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Login failed");
}

console.log("Access Token:", data.accessToken);
console.log("Refresh Token:", data.refreshToken);
console.log("User:", data.user);
```

### Authentication Flow

```text
Mobile App
    │
    │ POST /api/auth/login
    │ email + password
    ▼
Auth Service
    │
    ├── Validate credentials
    ├── Generate Access Token
    ├── Generate Refresh Token
    │
    ▼
Mobile App
    │
    ├── Store access token
    ├── Store refresh token
    └── Navigate to dashboard
```

### Base URL

For local development:

```text
http://localhost:5002
```

Therefore:

```text
POST /api/auth/login
```

Full URL:

```text
http://localhost:5002/api/auth/login
```

> **Note for iOS Simulator:** `localhost` points to your Mac, so `http://localhost:5002` can be used when the backend is running locally on the same Mac.
