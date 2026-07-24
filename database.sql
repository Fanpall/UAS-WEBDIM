-- Database setup for Sistem Pendaftaran Kegiatan Kampus

CREATE DATABASE IF NOT EXISTS webdin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE webdin;

CREATE TABLE IF NOT EXISTS jenis_kegiatan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(191) NOT NULL,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
  reset_token VARCHAR(255),
  reset_token_expired_at DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS kegiatan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  jenis_kegiatan_id INT NOT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  poster VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (jenis_kegiatan_id) REFERENCES jenis_kegiatan(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS peserta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kegiatan_id INT NOT NULL,
  nama VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  no_hp VARCHAR(50) NOT NULL,
  created_at DATETIME,
  FOREIGN KEY (kegiatan_id) REFERENCES kegiatan(id) ON DELETE CASCADE
);

INSERT INTO jenis_kegiatan (nama, created_at, updated_at) VALUES
('Seminar', NOW(), NOW()),
('Workshop', NOW(), NOW()),
('Lomba', NOW(), NOW()),
('Pelatihan', NOW(), NOW()),
('Pengabdian Masyarakat', NOW(), NOW());

INSERT INTO users (nama, email, password, role, created_at, updated_at) VALUES
('Administrator', 'admin@example.com', '$2b$10$oqSWMv.1WD95AMkt/wQoMuIbeQeuQPB5V.vK/GuEmUrghJl2iFndO', 'admin', NOW(), NOW()),
('Operator Lapangan', 'operator@example.com', '$2b$10$A7WUbBQRCk7IXf42nZGkveGXmeyHhOGunNHBra9KuxtSVFjfjVwRG', 'operator', NOW(), NOW()),
('Viewer Kampus', 'viewer@example.com', '$2b$10$rgtJNdU3we9dYKzGowa.N.rEhqsPg70heGy.D1KJ2jRejFsuZWApe', 'viewer', NOW(), NOW());

INSERT INTO kegiatan (judul, jenis_kegiatan_id, tanggal, lokasi, status, created_at, updated_at) VALUES
('Seminar Digital Marketing', 1, '2026-08-10', 'Auditorium B', 'Terjadwal', NOW(), NOW()),
('Workshop React.js', 2, '2026-09-01', 'Lab Komputer', 'Terjadwal', NOW(), NOW());

INSERT INTO peserta (kegiatan_id, nama, email, no_hp, created_at) VALUES
(1, 'Ali Mahendra', 'ali@example.com', '081234567890', NOW()),
(1, 'Siti Aisyah', 'siti@example.com', '082345678901', NOW()),
(2, 'Budi Santoso', 'budi@example.com', '083456789012', NOW());
