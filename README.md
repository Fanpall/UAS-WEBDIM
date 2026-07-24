# Sistem Pendaftaran Kegiatan Kampus

Proyek ini terdiri dari:

- `backend`: Express.js + TypeScript API
- `frontend`: Next.js + TypeScript UI
- `database.sql`: Struktur dan data contoh MySQL

## Fitur yang disediakan

- Autentikasi dengan JWT
- Role authorization: `admin`, `operator`, `viewer`
- Crud `jenis_kegiatan`, `kegiatan`, `peserta`, `users`
- Upload poster kegiatan
- Search, filter, pagination pada daftar kegiatan
- Reset password token melalui endpoint
- Validasi input dan error handling sederhana

## Persyaratan

- Node.js versi 18++/ npm
- MySQL

## Instalasi Backend

1. Buka folder `backend`
2. Buat file `.env` berdasarkan `.env.example`
3. Jalankan:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Instalasi Frontend

1. Buka folder `frontend`
2. Buat file `.env.local` berdasarkan `.env.local.example`
3. Jalankan:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Database

1. Buat database MySQL lalu jalankan `database.sql`:
   ```sql
   source /path/to/database.sql;
   ```
2. Pastikan konfigurasi `.env` backend cocok dengan MySQL Anda.

## Akun Demo

- Admin: `admin@example.com` / `admin123`
- Operator: `operator@example.com` / `operator123`
- Viewer: `viewer@example.com` / `viewer123`

## Endpoints penting

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/jenis-kegiatan`
- `POST /api/jenis-kegiatan`
- `GET /api/kegiatan`
- `POST /api/kegiatan`
- `POST /api/kegiatan/:id/upload`
- `GET /api/peserta`
- `POST /api/peserta`
- `GET /api/users`
- `POST /api/users`
- `POST /api/users/:id/reset-password`

## Catatan

- Jika menggunakan Gmail untuk reset password, aktifkan App Password dan isi `SMTP_EMAIL` serta `SMTP_PASSWORD` di `.env` backend.
- Frontend berjalan di `http://localhost:3001` dan backend di `http://localhost:3000`.
