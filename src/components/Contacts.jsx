import { useState } from "react";

export default function Contacts({
  contacts = [],
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  transactions = [],
  debts = [],
  formatRupiah
}) {
  const [activeSubTab, setActiveSubTab] = useState("customer");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    address: "",
    type: "customer"
  });

  const [editingContact, setEditingContact] = useState(null);

  const filteredContacts = contacts.filter((c) => {
    const isCorrectType = c.type === activeSubTab;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());
    return isCorrectType && matchesSearch;
  });

  const getContactStats = (contact) => {
    const normalizedContactName = contact.name.trim().toLowerCase();
    
    if (contact.type === "supplier") {
      const supplierTxs = transactions.filter(
        (t) => t.type === "masuk" && t.location && t.location.trim().toLowerCase() === normalizedContactName
      );
      const totalOrders = supplierTxs.length;
      const totalAmount = supplierTxs.reduce((sum, t) => sum + Number(t.total || 0), 0);
      return { totalOrders, totalAmount };
    } else {
      const customerTxs = transactions.filter(
        (t) => t.type === "keluar" && t.customer && t.customer.trim().toLowerCase() === normalizedContactName
      );
      const totalOrders = customerTxs.length;
      const totalAmount = customerTxs.reduce((sum, t) => sum + Number(t.total || 0), 0);

      const customerDebts = debts.filter(
        (d) => d.customer && d.customer.trim().toLowerCase() === normalizedContactName && d.status === "belum_lunas"
      );
      const outstandingDebt = customerDebts.reduce((sum, d) => sum + Number(d.remaining || 0), 0);

      return { totalOrders, totalAmount, outstandingDebt };
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newContact.name.trim()) {
      alert("Nama wajib diisi.");
      return;
    }
    if (
      contacts.some(
        (c) =>
          c.name.toLowerCase().trim() === newContact.name.toLowerCase().trim() &&
          c.type === newContact.type
      )
    ) {
      alert("Nama mitra dengan kategori tersebut sudah terdaftar!");
      return;
    }

    onAddContact({
      ...newContact,
      name: newContact.name.trim()
    });
    setIsAddModalOpen(false);
    setNewContact({
      name: "",
      phone: "",
      address: "",
      type: activeSubTab
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingContact.name.trim()) {
      alert("Nama wajib diisi.");
      return;
    }
    onUpdateContact({
      ...editingContact,
      name: editingContact.name.trim()
    });
    setIsEditModalOpen(false);
    setEditingContact(null);
  };

  const openAddModal = () => {
    setNewContact({
      name: "",
      phone: "",
      address: "",
      type: activeSubTab
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (contact) => {
    setEditingContact({ ...contact });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kontak mitra ini?")) {
      onDeleteContact(id);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          className={`btn ${activeSubTab === "customer" ? "btn-primary" : "btn-secondary"}`}
          style={{ flex: 1 }}
          onClick={() => {
            setActiveSubTab("customer");
            setSearchTerm("");
          }}
        >
          Daftar Pelanggan Tetap (Customer)
        </button>
        <button
          className={`btn ${activeSubTab === "supplier" ? "btn-primary" : "btn-secondary"}`}
          style={{ flex: 1 }}
          onClick={() => {
            setActiveSubTab("supplier");
            setSearchTerm("");
          }}
        >
          Daftar Agen / Supplier (Pemasok)
        </button>
      </div>

      <div className="page-header-controls">
        <div className="search-filter-box">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="form-control"
              placeholder={`Cari nama, telepon, atau alamat ${activeSubTab === "customer" ? "pelanggan" : "supplier"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          Tambah Mitra {activeSubTab === "customer" ? "Pelanggan" : "Supplier"}
        </button>
      </div>

      <div
        className="contacts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
          marginTop: "16px"
        }}
      >
        {filteredContacts.map((contact) => {
          const stats = getContactStats(contact);

          return (
            <div key={contact.id} className="content-card" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <span className={`badge ${contact.type === "customer" ? "success" : "info"}`} style={{ marginBottom: "6px" }}>
                    {contact.type === "customer" ? "Pelanggan" : "Supplier"}
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{contact.name}</h3>
                </div>
                
                <div className="btn-group">
                  <button className="btn-icon" title="Edit Kontak" onClick={() => openEditModal(contact)}>
                    <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                  <button className="btn-icon danger" title="Hapus Kontak" onClick={() => handleDeleteClick(contact.id)}>
                    <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <div>{contact.phone || <em style={{ color: "var(--text-muted)" }}>Tidak ada telepon</em>}</div>
                <div>{contact.address || <em style={{ color: "var(--text-muted)" }}>Tidak ada alamat</em>}</div>
              </div>

              <div
                style={{
                  background: "var(--bg-primary)",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "12px",
                  display: "grid",
                  gridTemplateColumns: contact.type === "customer" ? "1fr 1fr 1.2fr" : "1fr 1.2fr",
                  gap: "8px",
                  textAlign: "center"
                }}
              >
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase" }}>Transaksi</div>
                  <strong style={{ fontSize: "14px" }}>{stats.totalOrders}x</strong>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase" }}>
                    {contact.type === "customer" ? "Total Omset" : "Total Belanja"}
                  </div>
                  <strong style={{ fontSize: "12px", color: "var(--primary)" }}>{formatRupiah(stats.totalAmount)}</strong>
                </div>
                {contact.type === "customer" && (
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase" }}>Sisa Piutang</div>
                    <strong style={{ fontSize: "12px", color: stats.outstandingDebt > 0 ? "var(--danger)" : "var(--success)" }}>
                      {formatRupiah(stats.outstandingDebt)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredContacts.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)", padding: "40px" }} className="content-card">
            Tidak ada data kontak {activeSubTab === "customer" ? "pelanggan" : "supplier"} ditemukan.
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Tambah Kontak Mitra</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tipe Mitra *</label>
                  <select
                    className="form-control"
                    value={newContact.type}
                    onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                    required
                  >
                    <option value="customer">Pelanggan Tetap (Customer)</option>
                    <option value="supplier">Agen / Supplier (Pemasok)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Mitra *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Bu Sri, PT Beras Mandiri"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Telepon/HP</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 08123456789"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea
                    className="form-control"
                    placeholder="Alamat supplier atau pelanggan..."
                    value={newContact.address}
                    onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingContact && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Kontak Mitra</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tipe Mitra (Tidak dapat diedit)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingContact.type === "customer" ? "Pelanggan" : "Supplier"}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Mitra *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingContact.name}
                    onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Telepon/HP</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingContact.phone}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea
                    className="form-control"
                    value={editingContact.address}
                    onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
