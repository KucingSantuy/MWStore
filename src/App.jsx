import { useState, useEffect } from "react";
import {
  getItems,
  getTransactions,
  getDebts,
  getContacts,
  clearAllData
} from "./utils/storage";

import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Transactions from "./components/Transactions";
import DebtTracker from "./components/DebtTracker";
import Reports from "./components/Reports";
import TransactionLogs from "./components/TransactionLogs";
import Contacts from "./components/Contacts";
import Login from "./components/Login";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("sembako_theme") || "light";
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [contacts, setContacts] = useState([]);

  const getHeaders = () => {
    const token = localStorage.getItem("mwstore_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("mwstore_token");
    if (!token) {
      setIsAuthenticated(false);
      setCheckingAuth(false);
      return;
    }
    try {
      const res = await fetch("/api/verify-token", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setIsAuthenticated(true);
        refreshAllData();
      } else {
        localStorage.removeItem("mwstore_token");
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem("mwstore_token", token);
    setIsAuthenticated(true);
    refreshAllData();
  };

  const handleLogout = () => {
    localStorage.removeItem("mwstore_token");
    setIsAuthenticated(false);
    setItems([]);
    setTransactions([]);
    setDebts([]);
    setContacts([]);
  };

  const refreshAllData = async () => {
    try {
      const itemsData = await getItems();
      setItems(itemsData);

      const txData = await getTransactions();
      setTransactions(txData);

      const debtData = await getDebts();
      setDebts(debtData);

      const contactData = await getContacts();
      setContacts(contactData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sembako_theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.profile-dropdown-wrapper')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      alert("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengganti password");
      }
      alert("Password berhasil diperbarui!");
      setIsChangePasswordOpen(false);
      setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleResetDatabase = async () => {
    if (resetConfirmText !== "RESET DATA TOKO") return;
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: getHeaders()
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mereset database");
      }
      alert("Database berhasil direset ke kondisi awal!");
      setIsResetConfirmOpen(false);
      setIsChangePasswordOpen(false);
      setResetConfirmText("");
      handleLogout();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleAddItem = async (newItem) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newItem)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan barang');
      }
      await refreshAllData();
      alert("Barang baru berhasil ditambahkan!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      const res = await fetch(`/api/items/${updatedItem.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedItem)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui barang');
      }
      await refreshAllData();
      alert("Barang berhasil diperbarui!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini dari database?")) {
      try {
        const res = await fetch(`/api/items/${itemId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gagal menghapus barang');
        }
        await refreshAllData();
        alert("Barang berhasil dihapus!");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    let confirmMsg = "Apakah Anda yakin ingin menghapus transaksi ini?";
    if (transaction.type === "masuk") {
      confirmMsg = `Apakah Anda yakin ingin membatalkan transaksi stok masuk (restock) ini?\nStok barang '${transaction.itemName}' akan dikurangi sebanyak ${transaction.qty} ${transaction.unit || ''}.`;
    } else if (transaction.type === "keluar") {
      if (transaction.invoiceId) {
        confirmMsg = `Apakah Anda yakin ingin menghapus transaksi penjualan ini?\n\nPERINGATAN: Menghapus transaksi ini akan membatalkan SELURUH barang dalam invoice '${transaction.invoiceId}'. Stok masing-masing barang akan dikembalikan ke gudang, dan catatan piutang yang terkait akan dihapus.`;
      } else {
        confirmMsg = `Apakah Anda yakin ingin menghapus transaksi penjualan ini?\nStok barang '${transaction.itemName}' akan dikembalikan ke gudang.`;
      }
    }

    if (window.confirm(confirmMsg)) {
      try {
        const res = await fetch(`/api/transactions/${transaction.id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gagal menghapus transaksi');
        }
        await refreshAllData();
        alert("Transaksi berhasil dihapus!");
        return true;
      } catch (err) {
        alert("Error: " + err.message);
        return false;
      }
    }
    return false;
  };

  const handleRecordRestock = async (restockData) => {
    try {
      const res = await fetch('/api/transactions/restock', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(restockData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan transaksi masuk');
      }
      await refreshAllData();
      alert("Transaksi barang masuk berhasil dicatat!");
      return true;
    } catch (err) {
      alert("Error: " + err.message);
      return false;
    }
  };

  const handleRecordSale = async (saleData) => {
    try {
      const res = await fetch('/api/transactions/sale', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(saleData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan transaksi keluar');
      }
      await refreshAllData();
      alert("Transaksi penjualan berhasil dicatat!");
      return data.invoiceId;
    } catch (err) {
      alert("Error: " + err.message);
      return null;
    }
  };

  const handleRecordDebtPayment = async (paymentData) => {
    const { debtId, amountPaid, date, notes } = paymentData;
    try {
      const res = await fetch(`/api/debts/${debtId}/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount: amountPaid, date, notes })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan cicilan piutang');
      }
      await refreshAllData();
      alert("Pembayaran cicilan berhasil disimpan!");
      return true;
    } catch (err) {
      alert("Error: " + err.message);
      return false;
    }
  };

  const handleAddContact = async (newContact) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newContact)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan kontak');
      }
      await refreshAllData();
      alert("Kontak mitra berhasil ditambahkan!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateContact = async (updatedContact) => {
    try {
      const res = await fetch(`/api/contacts/${updatedContact.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedContact)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui kontak');
      }
      await refreshAllData();
      alert("Kontak mitra berhasil diperbarui!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kontak ini?")) {
      try {
        const res = await fetch(`/api/contacts/${contactId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gagal menghapus kontak');
        }
        await refreshAllData();
        alert("Kontak mitra berhasil dihapus!");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ items, transactions, debts, contacts }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'sembakoflow_backup_' + new Date().toISOString().split('T')[0] + '.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = async (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.items || !parsed.transactions || !parsed.debts || !parsed.contacts) {
        alert("Format backup tidak valid!");
        return false;
      }
      alert("Memproses pemulihan data ke database MySQL...");
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: getHeaders(),
        body: jsonData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memulihkan database');
      }
      await refreshAllData();
      alert("Database MySQL berhasil dipulihkan dari file backup!");
      return true;
    } catch (e) {
      alert("Gagal memulihkan file backup: " + e.message);
      return false;
    }
  };

  const formatDateTime = (date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const dayName = days[date.getDay()];
    const dateNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${dayName}, ${dateNum} ${monthName} ${year} - ${hours}:${minutes}:${seconds}`;
  };

  if (checkingAuth) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        <div style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {isSidebarOpen && <div className="sidebar-overlay-active" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-brand" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            <span className="sidebar-logo">MWStore</span>
            <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <nav>
            <ul className="sidebar-menu">
              <li className={`sidebar-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}>
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                Dashboard
              </li>
              <li className={`sidebar-item ${activeTab === "inventory" ? "active" : ""}`} onClick={() => { setActiveTab("inventory"); setIsSidebarOpen(false); }}>
                <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4 8 4 8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/></svg>
                Stok Sembako
              </li>
              <li className={`sidebar-item ${activeTab === "transactions" ? "active" : ""}`} onClick={() => { setActiveTab("transactions"); setIsSidebarOpen(false); }}>
                <svg viewBox="0 0 24 24"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M12 20h.01"/><path d="M12 4h.01"/><path d="M21 16v-2.83a2 2 0 0 0-.59-1.41l-4.83-4.83a2 2 0 0 0-1.41-.59H12"/><path d="M3 8V5a2 2 0 0 1 2-2h4"/></svg>
                Transaksi Baru
              </li>
              <li className={`sidebar-item ${activeTab === "debts" ? "active" : ""}`} onClick={() => { setActiveTab("debts"); setIsSidebarOpen(false); }}>
                <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                Kelola Piutang
              </li>
              <li className={`sidebar-item ${activeTab === "contacts" ? "active" : ""}`} onClick={() => { setActiveTab("contacts"); setIsSidebarOpen(false); }}>
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Mitra Bisnis
              </li>
              <li className={`sidebar-item ${activeTab === "reports" ? "active" : ""}`} onClick={() => { setActiveTab("reports"); setIsSidebarOpen(false); }}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Laporan Statistik
              </li>
              <li className={`sidebar-item ${activeTab === "logs" ? "active" : ""}`} onClick={() => { setActiveTab("logs"); setIsSidebarOpen(false); }}>
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Log Riwayat
              </li>
            </ul>
          </nav>
        </div>
        <div className="sidebar-footer" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "16px" }}>
          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--sidebar-text)" }}>
            © 2026 MWStore
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="mobile-menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="top-bar-title">
              {activeTab === "dashboard" && "Dashboard Ringkasan"}
              {activeTab === "inventory" && "Manajemen Stok Sembako"}
              {activeTab === "transactions" && "Input Transaksi Baru"}
              {activeTab === "debts" && "Daftar Piutang & Cicilan"}
              {activeTab === "contacts" && "Daftar & Kontak Mitra Bisnis"}
              {activeTab === "reports" && "Laporan Statistik Bulanan & Mingguan"}
              {activeTab === "logs" && "Riwayat Seluruh Transaksi"}
            </div>
          </div>
          <div className="top-bar-meta">
            <div className="meta-time">{formatDateTime(currentTime)}</div>
            
            <button className="theme-toggle-icon-btn" onClick={toggleTheme} title={theme === "light" ? "Ganti ke Tema Gelap" : "Ganti ke Tema Terang"}>
              {theme === "light" ? (
                <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </button>

            <div className="profile-dropdown-wrapper">
              <button className="profile-btn" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
                <div className="profile-avatar">P</div>
                <span className="profile-name">Pemilik Toko</span>
                <svg className={`chevron-icon ${isProfileDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {isProfileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <button onClick={() => { setIsChangePasswordOpen(true); setIsProfileDropdownOpen(false); }}>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83 2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Pengaturan Akun
                  </button>
                  <button onClick={() => { handleExportData(); setIsProfileDropdownOpen(false); }}>
                    <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Ekspor Backup (.json)
                  </button>
                  <button onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }} className="danger-item">
                    <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Keluar (Logout)
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          {activeTab === "dashboard" && (
            <Dashboard
              items={items}
              transactions={transactions}
              debts={debts}
              formatRupiah={formatRupiah}
              setActiveTab={setActiveTab}
              onExport={handleExportData}
              onImport={handleImportData}
            />
          )}

          {activeTab === "inventory" && (
            <Inventory
              items={items}
              formatRupiah={formatRupiah}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {activeTab === "transactions" && (
            <Transactions
              items={items}
              formatRupiah={formatRupiah}
              onRecordRestock={handleRecordRestock}
              onRecordSale={handleRecordSale}
              setActiveTab={setActiveTab}
              contacts={contacts}
            />
          )}

          {activeTab === "debts" && (
            <DebtTracker
              debts={debts}
              formatRupiah={formatRupiah}
              onPayDebt={handleRecordDebtPayment}
            />
          )}

          {activeTab === "contacts" && (
            <Contacts
              contacts={contacts}
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
              transactions={transactions}
              debts={debts}
              formatRupiah={formatRupiah}
            />
          )}

          {activeTab === "reports" && (
            <Reports
              transactions={transactions}
              debts={debts}
              items={items}
              formatRupiah={formatRupiah}
            />
          )}

          {activeTab === "logs" && (
            <TransactionLogs
              transactions={transactions}
              formatRupiah={formatRupiah}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}
        </div>
      </main>

      {isChangePasswordOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Pengaturan Akun</h3>
              <button className="modal-close" onClick={() => {
                setIsChangePasswordOpen(false);
                setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
              }}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Kata Sandi Sekarang *</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={changePasswordData.currentPassword}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kata Sandi Baru *</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Konfirmasi Kata Sandi Baru *</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={changePasswordData.confirmPassword}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                  />
                </div>
                
                <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                  <h4 style={{ color: "var(--danger)", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Zona Bahaya (Danger Zone)</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: "1.4" }}>
                    Menghapus seluruh data barang, transaksi, kontak, dan piutang toko secara permanen dari database Clever Cloud. Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <button type="button" className="btn btn-danger" onClick={() => setIsResetConfirmOpen(true)} style={{ width: "100%" }}>
                    Reset Seluruh Database Toko
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setIsChangePasswordOpen(false);
                  setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Perbarui Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResetConfirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: "var(--danger)" }}>Konfirmasi Reset Database</h3>
              <button className="modal-close" onClick={() => { setIsResetConfirmOpen(false); setResetConfirmText(""); }}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "16px", lineHeight: "1.5" }}>
                Tindakan ini akan menghapus secara permanen seluruh data transaksi, stok barang, piutang, dan kontak mitra bisnis toko Anda.
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Ketik <strong>RESET DATA TOKO</strong> pada kolom di bawah ini untuk melanjutkan:
              </p>
              <input
                type="text"
                className="form-control"
                placeholder="RESET DATA TOKO"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setIsResetConfirmOpen(false); setResetConfirmText(""); }}>
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={resetConfirmText !== "RESET DATA TOKO"}
                onClick={handleResetDatabase}
                style={{ opacity: resetConfirmText === "RESET DATA TOKO" ? 1 : 0.5, cursor: resetConfirmText === "RESET DATA TOKO" ? "pointer" : "not-allowed" }}
              >
                Ya, Hapus Semua Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
