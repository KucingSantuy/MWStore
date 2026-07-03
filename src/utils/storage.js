const getHeaders = () => {
  const token = localStorage.getItem('mwstore_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getItems = async () => {
  const res = await fetch('/api/items', { headers: getHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil data barang');
  return res.json();
};

export const getTransactions = async () => {
  const res = await fetch('/api/transactions', { headers: getHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil data transaksi');
  return res.json();
};

export const getDebts = async () => {
  const res = await fetch('/api/debts', { headers: getHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil data piutang');
  return res.json();
};

export const getContacts = async () => {
  const res = await fetch('/api/contacts', { headers: getHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil data mitra');
  return res.json();
};

export const clearAllData = async () => {
  if (confirm("Apakah Anda yakin ingin mereset database ke data awal? Semua perubahan data akan hilang.")) {
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Gagal mereset database');
      alert("Database berhasil direset!");
      window.location.reload();
    } catch (err) {
      alert("Gagal mereset: " + err.message);
    }
  }
};
