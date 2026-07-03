# 🛠️ Dokumentasi Pengembang & Sistem (Developer Documentation) — MWStore

Dokumentasi ini ditujukan bagi pengembang (*developer*) untuk memahami arsitektur, teknologi, struktur berkas, skema database, dan panduan instalasi lokal serta deployment aplikasi **MWStore**.

---

## 1. Arsitektur Sistem

Aplikasi **MWStore** menggunakan arsitektur **Monolitik Sederhana** yang menggabungkan:
1. **Frontend:** React.js (dibuat menggunakan Vite) sebagai antarmuka pengguna SPA (*Single Page Application*).
2. **Backend:** Express.js (Node.js) sebagai penyedia REST API untuk manipulasi database dan penyaji berkas statis hasil build frontend (`dist/`).
3. **Database:** MySQL relational database yang dihosting di cloud (Clever Cloud) untuk menjaga integritas data relasional transaksi, piutang, dan stok.

### Alur Autentikasi (Keamanan)
* Autentikasi bersifat *stateless* menggunakan **HMAC Token Signature** yang dibuat secara kustom menggunakan library bawaan Node.js (`crypto`) tanpa ketergantungan pada library pihak ketiga.
* Token disimpan di `localStorage` pada sisi klien dan dikirim via header `Authorization: Bearer <token>`.
* Semua akses API (kecuali `/api/login` dan berkas statis) diproteksi menggunakan middleware `authenticate` di `server.js`.

---

## 2. Struktur Direktori Proyek

```text
MWStore/
├── public/                  # Aset statis publik (ikon, gambar)
├── src/                     # Source code React (Frontend)
│   ├── components/          # Komponen antarmuka halaman utama
│   │   ├── Dashboard.jsx    # Dashboard ringkasan tren & widget
│   │   ├── Inventory.jsx    # Manajemen stok & harga barang
│   │   ├── Transactions.jsx # Form kasir penjualan & cetak struk
│   │   ├── DebtTracker.jsx  # Pembayaran cicilan hutang pembeli
│   │   ├── Contacts.jsx     # Kelola data pelanggan & supplier
│   │   ├── Reports.jsx      # Laporan omset bulanan & keuntungan
│   │   ├── TransactionLogs.jsx # Riwayat log mutasi
│   │   └── Login.jsx        # Halaman autentikasi login admin
│   ├── utils/               # Fungsi pembantu data
│   │   ├── storage.js       # Integrasi fetch API dengan browser
│   │   └── demoData.js      # Data seed awal untuk demonstrasi
│   ├── App.jsx              # Komponen utama router tab & state global
│   ├── index.css            # Stylesheet utama (Desain, Tema, Responsif)
│   └── main.jsx             # Entry point React
├── .env                     # Konfigurasi variabel lingkungan (diabaikan git)
├── .gitignore               # Daftar file yang diabaikan oleh Git
├── database.sql             # Skema tabel database MySQL mentah
├── package.json             # Dependensi npm & script commands
├── PANDUAN_PENGGUNA.md      # Panduan ramah pemula untuk pemilik toko
├── README.md                # Dokumentasi pengembang (file ini)
├── server.js                # Backend API & Server Express
├── vercel.json              # Konfigurasi deployment Vercel
└── vite.config.js           # Konfigurasi bundler Vite
```

---

## 3. Skema Database (MySQL Schema)

Database terdiri dari 6 tabel utama dengan relasi kunci asing (*foreign key*) untuk menjaga integritas data:

```mermaid
erDiagram
    users {
        string id PK
        string username UNIQUE
        string password "SHA256 Hash"
    }
    items {
        string id PK
        string sku UNIQUE
        string name
        string category
        int stock
        int minStock
        string unit
        decimal purchasePrice
        decimal sellingPrice
    }
    purchase_history {
        string id PK
        string itemId FK
        string date
        decimal price
        string location
        int qty
    }
    transactions {
        string id PK
        string invoiceId
        string date
        string type "masuk/keluar"
        string itemId FK
        string itemName
        int qty
        decimal price
        decimal total
        string location
        string notes
        string customer
        string paymentStatus
        decimal amountPaid
        decimal debt
    }
    contacts {
        string id PK
        string name
        string phone
        string address
        string type "customer/supplier"
    }
    debts {
        string id PK
        string invoiceId
        string txId FK
        string date
        string customer
        decimal total
        decimal paid
        decimal remaining
        text payments "JSON string cicilan"
        string status "lunas/belum_lunas"
    }
    items ||--o{ purchase_history : "has"
    items ||--o{ transactions : "logs"
```

---

## 4. Referensi Endpoint API

Semua rute berawalan `/api` membutuhkan header `Authorization: Bearer <token>` kecuali rute Login.

| Method | Endpoint | Deskripsi | Kebutuhan Body |
|---|---|---|---|
| **POST** | `/api/login` | Login admin, mengembalikan token JWT kustom. | `{ username, password }` |
| **GET** | `/api/verify-token` | Memvalidasi keaktifan token di frontend. | *None* |
| **POST** | `/api/change-password` | Memperbarui kata sandi admin. | `{ currentPassword, newPassword }` |
| **GET** | `/api/items` | Mengambil seluruh daftar stok barang. | *None* |
| **POST** | `/api/items` | Menambahkan jenis barang baru. | `{ sku, name, category, stock, minStock, unit, purchasePrice, sellingPrice }` |
| **PUT** | `/api/items/:id` | Mengedit info barang. | `{ sku, name, category, stock, minStock, unit, purchasePrice, sellingPrice }` |
| **DELETE** | `/api/items/:id` | Menghapus barang secara permanen. | *None* |
| **GET** | `/api/transactions` | Mengambil semua catatan riwayat transaksi. | *None* |
| **POST** | `/api/transactions/restock` | Mencatat transaksi pembelian stok (masuk). | `{ itemId, qty, purchasePrice, location, notes, date }` |
| **POST** | `/api/transactions/sale` | Mencatat transaksi penjualan (keluar/hutang). | `{ cart: [{itemId, qty, price}], customer, paymentStatus, amountPaid, notes, date }` |
| **GET** | `/api/debts` | Mengambil seluruh riwayat piutang pembeli. | *None* |
| **POST** | `/api/debts/:id/pay` | Mencatat cicilan baru untuk piutang tertentu. | `{ amountPaid, date }` |
| **GET** | `/api/contacts` | Mengambil data semua mitra bisnis. | *None* |
| **POST** | `/api/contacts` | Menambah kontak pelanggan/supplier baru. | `{ name, phone, address, type }` |
| **PUT** | `/api/contacts/:id` | Mengubah info kontak mitra. | `{ name, phone, address, type }` |
| **DELETE** | `/api/contacts/:id` | Menghapus kontak mitra. | *None* |
| **POST** | `/api/reset` | Mereset seluruh isi database (Danger Zone). | *None* |

---

## 5. Cara Menjalankan Proyek Secara Lokal

### Prasyarat:
* Node.js v20.6.0 atau lebih baru (karena menggunakan flag `--env-file` bawaan Node.js).
* Database MySQL lokal (opsional, jika ingin dialihkan dari Clever Cloud).

### Langkah-langkah:
1. **Instalasi Dependensi:**
   ```bash
   npm install
   ```
2. **Setup File Lingkungan (`.env`):**
   Salin atau buat file `.env` di direktori utama:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password_mysql_anda
   DB_NAME=mwstore
   DB_PORT=3306
   JWT_SECRET=buat_jwt_secret_panjang_acak_anda
   PORT=5000
   ```
3. **Jalankan Express API Backend:**
   ```bash
   npm run server
   ```
   *(Backend akan otomatis membuat database dan melakukan seeding data awal jika tabel kosong).*
4. **Jalankan Vite Dev Server Frontend:**
   Buka terminal baru di direktori yang sama:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:5173` di browser Anda.

---

## 6. Panduan Build & Deployment Produksi

### Langkah Build Manual:
1. Kompilasi aset frontend React menjadi kode HTML/JS/CSS statis di folder `dist/`:
   ```bash
   npm run build
   ```
2. Jalankan server produksi monolitik yang melayani API sekaligus file statis `dist/` tersebut:
   ```bash
   NODE_ENV=production node server.js
   ```

### Deployment di Vercel/Koyeb:
* **Frontend + API Monolitik (Vercel):** Proyek ini sudah dilengkapi berkas `vercel.json` untuk menjalankan server backend monolitik sebagai Vercel Serverless Functions. Cukup hubungkan repositori GitHub Anda ke Vercel dan deployment akan berjalan otomatis.
* **Database (Clever Cloud):** Gunakan Clever Cloud dev plan gratis, impor berkas `database.sql` jika diperlukan, lalu masukkan kredensial host, port, user, password database tersebut ke panel Environment Variables Vercel proyek Anda.
