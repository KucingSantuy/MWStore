# 📘 Panduan Pengguna Aplikasi Kasir MWStore

Selamat datang di **MWStore**! Panduan ini dibuat khusus dalam bahasa yang sederhana dan mudah dipahami untuk membantu Anda (Pemilik Toko) mengoperasikan aplikasi kasir digital ini sehari-hari secara aman tanpa perlu keahlian IT.

---

## ⏰ 1. Membuka Aplikasi Pertama Kali di Pagi Hari

Karena aplikasi ini menggunakan server gratisan untuk menghemat biaya operasional Anda:
* **Pemberitahuan:** Saat pertama kali Anda membuka website ini di pagi hari (atau setelah toko tutup/istirahat lama), layar akan menampilkan tulisan **"Memuat..."** sekitar **30 hingga 50 detik**.
* **Apa yang harus dilakukan?** Cukup tunggu sebentar. Server sedang proses "bangun tidur". Ini adalah hal yang normal. Setelah loading pertama selesai, aplikasi akan berjalan sangat cepat dan lancar untuk transaksi selanjutnya sepanjang hari.

---

## 🛒 2. Cara Transaksi & Cetak Struk Belanja

### A. Melayani Penjualan (Uang Diterima):
1. Masuk ke menu **Transaksi Baru** di sebelah kiri.
2. Pilih barang yang dibeli pelanggan di kolom pencarian, masukkan jumlahnya, lalu klik **Tambah ke Keranjang**.
3. Di sebelah kanan, masukkan nama pelanggan (opsional) dan jumlah uang tunai yang dibayar pelanggan.
4. Klik **Simpan Transaksi**.
5. **Cetak Struk:** Begitu transaksi disimpan, kotak struk belanja bergaya struk thermal toko akan langsung muncul secara otomatis.
   * Klik tombol **Cetak Struk**.
   * Printer thermal Anda akan mencetak struk secara fisik, atau Anda bisa memilih opsi **"Simpan sebagai PDF"** di layar HP/komputer Anda untuk menyimpannya ke memori perangkat.

### B. Mencatat Hutang Pelanggan (Kasbon):
1. Lakukan langkah yang sama seperti penjualan di atas.
2. Di sebelah kanan, pada bagian **Status Pembayaran**, ubah pilihan dari "Lunas" menjadi **"Hutang (Piutang)"**.
3. Masukkan jumlah uang muka yang dibayar (jika ada, tulis `0` jika pelanggan belum bayar sama sekali).
4. Klik **Simpan Transaksi**. Data otomatis masuk ke daftar hutang pembeli.

---

## 💸 3. Cara Mengelola & Menerima Cicilan Hutang

Jika ada pelanggan datang untuk membayar atau mencicil hutang kasbonnya:
1. Masuk ke menu **Keluar / Kelola Piutang**.
2. Cari nama pelanggan tersebut pada daftar.
3. Klik tombol **Bayar Cicilan** (ikon dompet/uang) di baris nama pelanggan tersebut.
4. Masukkan nominal uang cicilan yang dibayarkan, lalu klik **Simpan Pembayaran**.
5. Sisa hutang pelanggan akan otomatis berkurang secara otomatis dan tercatat rapi di riwayat.

---

## 💾 4. Kebiasaan Aman Mingguan: Ekspor & Impor Data (SANGAT PENTING!)

Karena aplikasi ini dijalankan di server gratis tanpa pencadangan otomatis, Anda **wajib melakukan pencadangan data sendiri secara manual** untuk mencegah kehilangan data jika server Clever Cloud mengalami kendala sewaktu-waktu.

### Cara Melakukan Cadangan (Ekspor Data):
1. Lakukan ini **seminggu sekali** (misalnya setiap Sabtu malam atau Minggu pagi saat toko tutup).
2. Di halaman **Dashboard** (halaman utama), cari bagian paling bawah dan klik tombol **Ekspor Data (Unduh JSON)**.
3. Sebuah file dengan nama acak berakhiran `.json` (misalnya `mwstore_backup_xxxx.json`) akan otomatis terunduh ke HP atau laptop Anda.
4. **PERINGATAN KERAS:**
   > **Jangan pernah membuka atau mengubah tulisan di dalam file cadangan `.json` tersebut secara manual!** 
   > Struktur file tersebut ditulis dalam bahasa komputer khusus. Jika Anda tidak sengaja menghapus satu tanda koma atau huruf di dalamnya, file tersebut akan rusak dan aplikasi tidak akan bisa membacanya lagi saat Anda ingin memulihkan data. Cukup biarkan file tersebut tersimpan rapi di folder Download perangkat Anda.

### Cara Memulihkan Data (Impor Data):
Jika Anda ganti HP, ganti database, atau data terhapus:
1. Masuk ke halaman **Dashboard**.
2. Klik tombol **Impor Data (Unggah JSON)**.
3. Pilih file cadangan `.json` terakhir yang pernah Anda unduh sebelumnya.
4. Klik **OK / Unggah**. Seluruh stok barang, piutang, kontak pelanggan, dan riwayat transaksi toko Anda akan kembali utuh dalam sekejap!

---

## 🛡️ 5. Menjaga Keamanan Sandi & Database

### A. Mengganti Kata Sandi Toko:
1. Di pojok kanan atas layar, klik nama profil Anda **"Pemilik Toko"**.
2. Pilih menu **Pengaturan Akun**.
3. Masukkan sandi lama Anda (sandi bawaan pertama kali adalah `admin123`).
4. Masukkan sandi baru yang hanya Anda yang tahu, lalu klik **Perbarui Password**.

### B. Peringatan Tombol "Reset Database" (Zona Bahaya):
* Di dalam menu **Pengaturan Akun**, terdapat tombol merah bertuliskan **Reset Seluruh Database Toko**.
* **PERINGATAN:** Tombol ini akan **menghapus bersih seluruh data toko Anda** (stok barang, transaksi, kontak, dan hutang) kembali ke nol dan tidak bisa dikembalikan lagi!
* **Pengaman:** Jika Anda tidak sengaja mengeklik tombol ini, sistem akan meminta Anda mengetikkan kalimat **`RESET DATA TOKO`** di kolom yang disediakan. Jangan pernah mengetik kalimat tersebut dan segera klik **Batal** jika Anda tidak berniat menghapus data toko Anda.
