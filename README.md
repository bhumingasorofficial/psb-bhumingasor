# 🎓 Sistem Penerimaan Murid Baru (SPMB) Online
**Pondok Pesantren Bhumi Ngasor Ar-Ridho - Tahun Ajaran 2026/2027**

Aplikasi pendaftaran santri baru berbasis web modern (React.js) yang terintegrasi penuh dengan ekosistem Google (Spreadsheet, Drive, & Apps Script) sebagai backend *serverless*.

---

## 🚀 Fitur Utama

### Frontend (Sisi Wali Santri)
*   **Multi-Step Form:** Pendaftaran dibagi menjadi dua tahap (Registrasi Awal & Pengisian Data Lengkap) untuk memudahkan pengguna.
*   **Validasi Real-time:** Pengecekan NIK, format WA, dan kelengkapan data secara langsung.
*   **Image Compression:** Kompresi otomatis bukti pembayaran & dokumen sebelum diupload untuk menghemat kuota user & penyimpanan server.
*   **Wilayah Indonesia API:** Integrasi otomatis Provinsi s/d Desa menggunakan API *emsifa*.
*   **Cetak Kartu:** Generate otomatis Bukti Pendaftaran dalam format siap cetak (PDF).
*   **Keamanan:** Proteksi spam menggunakan Cloudflare Turnstile Captcha.

### Backend (Sisi Admin)
*   **Google Sheets Database:** Semua data tersimpan rapi di Google Spreadsheet.
*   **Google Drive Storage:** File upload (Bukti Bayar, KK, Akta, dll) tersimpan otomatis di Folder Google Drive.
*   **Token System:** Sistem login menggunakan NIK & Token unik untuk keamanan data santri.
*   **Auto-Sort:** Pemisahan otomatis antara data pendaftar baru dan data yang sudah lengkap.

---

## 🔄 Alur Kerja Sistem (User Flow)

### 1. Pendaftaran Awal (Registrasi Token)
1.  Calon wali santri mengisi data dasar (Nama, NIK, No WA).
2.  Mengisi survei sumber informasi.
3.  Mengupload **Bukti Transfer** pembelian formulir.
4.  Data masuk ke Sheet **"Registrasi Awal"** dengan status *Pending*.

### 2. Verifikasi Admin (Manual)
1.  Admin mengecek mutasi bank dan file bukti bayar di Spreadsheet.
2.  Jika valid, Admin membuat **Token** (6 digit angka) dan mengisinya di kolom Token pada Spreadsheet.
3.  Admin mengirim Token tersebut ke WhatsApp wali santri (Manual).

### 3. Login & Pengisian Data Lengkap
1.  Wali santri kembali ke web, pilih menu **"Masuk / Lanjut Isi Data"**.
2.  Login menggunakan **NIK**, **Token**, dan **No WA** (Verifikasi 3 Lapis).
3.  Mengisi formulir lengkap (Biodata, Ortu, Wali, Upload Berkas).
4.  Data tersimpan di Sheet **"Data Pendaftar"**.
5.  Wali santri mencetak **Bukti Pendaftaran**.

---

## 🛠️ Teknologi yang Digunakan

*   **Frontend Framework:** React 18 + Vite + TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Heroicons / SVG
*   **Backend:** Google Apps Script (GAS)
*   **Database:** Google Sheets
*   **File Storage:** Google Drive

---

## ⚙️ Cara Instalasi & Deployment

### A. Persiapan Google (Backend)
1.  Buat **Google Spreadsheet** baru.
2.  Buka menu `Extensions` > `Apps Script`.
3.  Copy kode dari file `backend/Code.gs` ke dalam editor Apps Script.
4.  **Konfigurasi Variabel:**
    *   Ganti `SPREADSHEET_ID` dengan ID Spreadsheet Anda.
    *   Ganti `FOLDER_ID` dengan ID Folder Google Drive tempat menyimpan file upload.
5.  **Deploy:**
    *   Klik `Deploy` > `New Deployment`.
    *   Select type: `Web App`.
    *   Execute as: `Me` (Email Anda).
    *   Who has access: **Anyone** (Penting agar bisa diakses public).
6.  Copy **Web App URL** yang dihasilkan (diakhiri `/exec`).

### B. Persiapan React (Frontend)
1.  Buka file `App.tsx`.
2.  Cari variabel `GOOGLE_SHEET_URL`.
3.  Tempelkan **Web App URL** dari langkah A di sana.
4.  Install dependencies:
    ```bash
    npm install
    ```
5.  Jalankan local:
    ```bash
    npm run dev
    ```

---

## 📊 Struktur Database (Google Sheets)

Agar aplikasi berjalan lancar, **JANGAN** mengubah urutan kolom yang dibuat otomatis oleh script. Script akan membuat 2 sheet otomatis saat data pertama masuk, namun berikut referensinya:

### Sheet 1: "Registrasi Awal"
| Kolom | Data |
| :--- | :--- |
| A | Timestamp |
| B | ID Registrasi |
| C | Token (Diisi Admin) |
| D | Sumber Info |
| E | Nama Lengkap |
| F | NIK |
| G | Gender |
| H | No. WA |
| I | Link Bukti Bayar |
| J | Status Verifikasi |

### Sheet 2: "Data Pendaftar"
| Kolom | Data |
| :--- | :--- |
| A | Timestamp |
| B | ID Registrasi |
| C | Sumber Info |
| D | Jenjang |
| E | Jurusan (SMK) |
| F | Nama Lengkap |
| G | Gender |
| H | NIK |
| I | NISN |
| J | Tempat Lahir |
| K | Tanggal Lahir |
| L | Alamat Lengkap |
| M | Sekolah Asal |
| N | No. WA |
| O-R | Data Periodik (Tinggi, Berat, dll) |
| S-V | Data Ayah |
| W-Z | Data Ibu |
| AA-AD | Data Wali |
| AE-AI | Link Dokumen (KK, Akta, KTP, Foto, Ijazah) |
| AJ | Status Data |
| AK | Catatan Admin |

---

## 📝 Catatan Pengembang
*   **API Wilayah:** Aplikasi menggunakan API publik `emsifa.com`. Jika API down, aplikasi otomatis beralih ke mode input manual (Text Input) agar pendaftaran tidak terhambat.
*   **Turnstile:** Pastikan `Site Key` Cloudflare Turnstile di `RegistrationSection.tsx` dan `ReviewSection.tsx` diganti dengan milik Anda saat production.
*   **Auto-Save:** Data formulir lengkap disimpan di `localStorage` browser. Jika wali santri merefresh halaman atau koneksi putus, data yang sudah diketik tidak hilang.

---

**© 2026 Tim IT Pondok Pesantren Bhumi Ngasor Ar-Ridho**
