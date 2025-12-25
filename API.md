# REST API Documentation

## Overview

REST API untuk mengakses notes secara programatik. Menggunakan API key authentication.

## Base URL

```
http://your-domain.com/api/v1
```

---

## Quick Start

### 1. Generate API Key

Login ke web app, lalu buka **Settings → API Keys**. Klik **Generate** dan beri nama untuk key kamu.

**Atau via API:**
```bash
# Login dulu untuk dapat session cookie
curl -X POST http://localhost:4321/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}' \
  -c cookies.txt

# Generate API key
curl -X POST http://localhost:4321/api/v1/me/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"My App"}' \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "obsk_abc123def456...",
    "name": "My App"
  }
}
```

**⚠️ Simpan key ini sekarang! Key tidak akan ditampilkan lagi.**

---

### 2. List Semua Notes

```bash
curl -H "Authorization: Bearer obsk_abc123def456..." \
  http://localhost:4321/api/v1/notes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slug": "note-slug",
      "title": "Note Title",
      "path": "note-slug",
      "lastModified": "2024-12-25T10:00:00.000Z",
      "frontmatter": { ... }
    }
  ],
  "count": 767
}
```

---

### 3. Ambil Detail Note

```bash
# Untuk slug tanpa spasi/karakter special
curl -H "Authorization: Bearer obsk_abc123def456..." \
  http://localhost:4321/api/v1/notes/note-slug

# Untuk slug dengan spasi/karakter special - URL encode dulu
curl -H "Authorization: Bearer obsk_abc123def456..." \
  "http://localhost:4321/api/v1/notes/00%20Ideas%20Inbox%2FMy%20Note"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "slug": "00 Ideas Inbox/My Note",
    "title": "My Note Title",
    "path": "00 Ideas Inbox/My Note",
    "content": "# Markdown content here\n...",
    "frontmatter": { "tags": ["idea"] },
    "lastModified": "2024-12-25T10:00:00.000Z"
  }
}
```

---

## Python Example

```python
import requests

BASE_URL = "http://localhost:4321/api/v1"
API_KEY = "obsk_abc123def456..."

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# List semua notes
response = requests.get(f"{BASE_URL}/notes", headers=headers)
notes = response.json()

print(f"Total notes: {notes['count']}")
for note in notes['data'][:5]:  # Show first 5
    print(f"- {note['title']}: {note['slug']}")

# Ambil detail note tertentu
slug = "00 Ideas Inbox/My Note"
import urllib.parse
encoded_slug = urllib.parse.quote(slug)

response = requests.get(f"{BASE_URL}/notes/{encoded_slug}", headers=headers)
note = response.json()

print(f"\nTitle: {note['data']['title']}")
print(f"Content preview: {note['data']['content'][:100]}...")
```

---

## JavaScript/Node.js Example

```javascript
const BASE_URL = 'http://localhost:4321/api/v1';
const API_KEY = 'obsk_abc123def456...';

// List semua notes
async function getAllNotes() {
  const response = await fetch(`${BASE_URL}/notes`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });

  const { data, count } = await response.json();
  console.log(`Total notes: ${count}`);
  return data;
}

// Ambil detail note
async function getNote(slug) {
  const encodedSlug = encodeURIComponent(slug);
  const response = await fetch(`${BASE_URL}/notes/${encodedSlug}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });

  const { data } = await response.json();
  return data;
}

// Contoh penggunaan
(async () => {
  const notes = await getAllNotes();
  const note = await getNote('00 Ideas Inbox/My Note');
  console.log(note.title);
  console.log(note.content);
})();
```

---

## Authentication

API menggunakan **Bearer Token** authentication.

### Header

```
Authorization: Bearer obsk_<your-key>
```

### Mendapatkan API Key

API Key bisa digenerate melalui:
- **Web UI:** Settings → API Keys → Generate
- **API:** `POST /api/v1/me/keys` (memerlukan login via session cookie)

API Key dimulai dengan prefix `obsk_`.

---

## Endpoints

### Notes

#### GET /api/v1/notes

List semua notes.

**Authentication:** Required (API Key)

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slug": "note-slug",
      "title": "Note Title",
      "path": "note-slug",
      "lastModified": "2024-12-25T10:00:00.000Z",
      "frontmatter": { ... }
    }
  ],
  "count": 10
}
```

---

#### GET /api/v1/notes/:slug

Get detail note tertentu.

**Authentication:** Required (API Key), unless note is public

**Parameters:**
- `slug` - Note slug (URL encoded jika mengandung spasi/karakter special)

**Response:**
```json
{
  "success": true,
  "data": {
    "slug": "note-slug",
    "title": "Note Title",
    "path": "note-slug",
    "content": "# Markdown content here",
    "frontmatter": { ... },
    "lastModified": "2024-12-25T10:00:00.000Z"
  }
}
```

**Error (401):**
```json
{
  "error": "Authentication required"
}
```

**Note:** Untuk slug dengan karakter special (spasi, `/`, dll), gunakan URL encoding:
- `00 Ideas Inbox/My Note` → `00%20Ideas%20Inbox%2FMy%20Note`

---

### User Management (Admin Only)

#### GET /api/v1/admin/users

List semua users. **Admin only.**

**Authentication:** Required (API Key with admin role)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "username": "username",
      "role": "admin",
      "createdAt": 1234567890
    }
  ]
}
```

---

#### POST /api/v1/admin/users

Create user baru. **Admin only.**

**Authentication:** Required (API Key with admin role)

**Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-user-id",
    "username": "newuser",
    "role": "user"
  }
}
```

---

#### PATCH /api/v1/admin/users/:userId

Update user role. **Admin only.**

**Authentication:** Required (API Key with admin role)

**Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "role": "admin"
  }
}
```

---

#### DELETE /api/v1/admin/users/:userId

Delete user. **Admin only.**

**Authentication:** Required (API Key with admin role)

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### API Key Management

#### GET /api/v1/me/keys

List API keys milik user yang sedang login. **Memerlukan login (session cookie via browser).**

**Authentication:** Required (Session cookie, not API key)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "obsk_abc...",
      "name": "My App",
      "createdAt": 1234567890,
      "lastUsedAt": 1234567890,
      "expiresAt": null,
      "isActive": 1
    }
  ]
}
```

---

#### POST /api/v1/me/keys

Generate API key baru. **Memerlukan login (session cookie via browser).**

**Authentication:** Required (Session cookie, not API key)

**Body:**
```json
{
  "name": "My App Key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "obsk_abcdefghijklmnopqrstuvwxyz123456",
    "name": "My App Key"
  }
}
```

**⚠️ IMPORTANT:** Simpan API key ini dengan aman. Key hanya ditampilkan sekali ini saja!

---

#### DELETE /api/v1/me/keys/:keyId

Revoke (hapus) API key. **Memerlukan login (session cookie via browser).**

**Authentication:** Required (Session cookie, not API key)

**Response:**
```json
{
  "success": true,
  "message": "API key revoked"
}
```

---

### Public Notes (Share/Unshare)

#### GET /api/v1/share/:slug

Cek apakah note public. **Memerlukan login (session cookie via browser).**

**Authentication:** Required (Session cookie, not API key)

**Parameters:**
- `slug` - Note slug (URL encoded)

**Response:**
```json
{
  "success": true,
  "data": {
    "isPublic": true
  }
}
```

---

#### POST /api/v1/share/:slug

Jadikan note sebagai public. **Memerlukan login (session cookie via browser).**

**Authentication:** Required (Session cookie, not API key)

**Parameters:**
- `slug` - Note slug (URL encoded)

**Body (optional):**
```json
{
  "expiresAt": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note is now public"
}
```

---

#### DELETE /api/v1/share/:slug

Jadikan note sebagai private. **Memerlukan login (session cookie via browser).**

**Authentication:** Required (Session cookie, not API key)

**Parameters:**
- `slug` - Note slug (URL encoded)

**Response:**
```json
{
  "success": true,
  "message": "Note is now private"
}
```

---

## Public Note Access

Notes yang di-share sebagai public bisa diakses tanpa API key:

1. **Web UI:** `/notes/:slug` - Akan menampilkan layout public tanpa sidebar
2. **REST API:** `GET /api/v1/notes/:slug` - Tidak perlu API key untuk public notes

Contoh akses public note tanpa auth:
```bash
curl http://localhost:4321/api/v1/notes/00%20Ideas%20Inbox%2FMy%20Note
```

Cache header untuk public notes: `public, max-age=300`

---

## Error Responses

All errors return JSON format:

```json
{
  "error": "Error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid API key or session)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Tips & Best Practices

1. **URL Encoding:** Selalu URL-encode slug yang mengandung spasi atau karakter special:
   ```python
   import urllib.parse
   encoded_slug = urllib.parse.quote("00 Ideas Inbox/My Note")
   # Hasil: 00%20Ideas%20Inbox%2FMy%20Note
   ```

2. **Simpan API Key dengan Aman:** Jangan commit API key ke git. Gunakan environment variable:
   ```bash
   export OBSIDIAN_API_KEY="obsk_abc123..."
   ```

3. **Rate Limiting:** Saat ini belum diimplementasi, tapi jangan spam request.

4. **Error Handling:** Selalu cek status code dan handle error properly:
   ```python
   response = requests.get(url, headers=headers)
   if response.status_code == 401:
       print("Invalid API key!")
   elif response.status_code == 404:
       print("Note not found!")
   ```
