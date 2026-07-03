// API client helpers to communicate with Express backend instead of localStorage

export const getItems = async () => {
  const res = await fetch('/api/items');
  if (!res.ok) throw new Error('Gagal mengambil data barang');
  return res.json();
};

export const getTransactions = async () => {
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Gagal mengambil data transaksi');
  return res.json();
};

export const getDebts = async () => {
  const res = await fetch('/api/debts');
  if (!res.ok) throw new Error('Gagal mengambil data piutang');
  return res.json();
};

export const getContacts = async () => {
  const res = await fetch('/api/contacts');
  if (!res.ok) throw new Error('Gagal mengambil data mitra');
  return res.json();
};

export const clearAllData = async () => {
  if (confirm("Apakah Anda yakin ingin mereset database ke data awal? Semua perubahan data akan hilang.")) {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Gagal mereset database');
      alert("Database berhasil direset!");
      window.location.reload();
    } catch (err) {
      alert("Gagal mereset: " + err.message);
    }
  }
};
