import { useState } from "react";

export default function Inventory({ items, formatRupiah, onAddItem, onUpdateItem, onDeleteItem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    sku: "",
    name: "",
    category: "Beras",
    stock: 0,
    minStock: 10,
    unit: "kg",
    purchasePrice: 0,
    sellingPrice: 0,
    purchaseLocation: ""
  });

  const [editingItem, setEditingItem] = useState(null);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);

  // Kategori kustom & pembuatan SKU otomatis
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [showEditCategoryInput, setShowEditCategoryInput] = useState(false);
  const [editCustomCategory, setEditCustomCategory] = useState("");

  const getCategoryPrefix = (category) => {
    if (!category) return "BRG";
    const cat = category.toLowerCase().trim();
    if (cat.includes("beras")) return "BRS";
    if (cat.includes("minyak")) return "MYK";
    if (cat.includes("gula")) return "GLA";
    if (cat.includes("telur")) return "TLR";
    if (cat.includes("mie") || cat.includes("mi ")) return "MIE";
    if (cat.includes("tepung")) return "TPG";
    if (cat.includes("bumbu")) return "BMB";
    if (cat.includes("cup") || cat.includes("gelas") || cat.includes("plastik")) return "CUP";
    if (cat.includes("margarin") || cat.includes("mentega")) return "MRG";
    if (cat.includes("susu")) return "SSU";
    
    const clean = cat.replace(/[^a-z]/g, "");
    if (clean.length >= 3) {
      const consonants = clean.replace(/[aeiou]/g, "");
      if (consonants.length >= 3) return consonants.substring(0, 3).toUpperCase();
      return clean.substring(0, 3).toUpperCase();
    }
    return "BRG";
  };

  const generateAutoSku = (category, currentItems) => {
    const prefix = getCategoryPrefix(category);
    const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');
    let maxNumber = 0;
    
    currentItems.forEach(item => {
      if (item.sku) {
        const match = item.sku.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `${prefix}-${paddedNumber}`;
  };

  const defaultCategories = ["Beras", "Minyak Goreng", "Gula", "Telur", "Mie Instan", "Tepung", "Bumbu", "Lain-lain"];
  const categories = Array.from(new Set([
    ...defaultCategories,
    ...items.map((item) => item.category)
  ])).filter(Boolean);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.unit) {
      alert("Mohon lengkapi nama barang dan satuan.");
      return;
    }

    const finalCategory = showNewCategoryInput ? customCategory.trim() : newItem.category;
    if (!finalCategory) {
      alert("Mohon pilih atau masukkan kategori.");
      return;
    }

    let finalSku = newItem.sku.trim();
    if (!finalSku) {
      finalSku = generateAutoSku(finalCategory, items);
    } else {
      if (items.some((it) => it.sku.toLowerCase() === finalSku.toLowerCase())) {
        alert("SKU / Kode barang sudah terdaftar!");
        return;
      }
    }

    onAddItem({
      ...newItem,
      sku: finalSku,
      category: finalCategory
    });

    setIsAddModalOpen(false);
    setShowNewCategoryInput(false);
    setCustomCategory("");
    setNewItem({
      sku: "",
      name: "",
      category: "Beras",
      stock: 0,
      minStock: 10,
      unit: "kg",
      purchasePrice: 0,
      sellingPrice: 0,
      purchaseLocation: ""
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingItem.name || !editingItem.unit) {
      alert("Mohon lengkapi nama barang dan satuan.");
      return;
    }

    const finalCategory = showEditCategoryInput ? editCustomCategory.trim() : editingItem.category;
    if (!finalCategory) {
      alert("Mohon pilih atau masukkan kategori.");
      return;
    }

    onUpdateItem({
      ...editingItem,
      category: finalCategory
    });
    setIsEditModalOpen(false);
    setEditingItem(null);
    setShowEditCategoryInput(false);
    setEditCustomCategory("");
  };

  const openEditModal = (item) => {
    setEditingItem({ ...item });
    setShowEditCategoryInput(false);
    setEditCustomCategory("");
    setIsEditModalOpen(true);
  };

  const openHistoryModal = (item) => {
    setSelectedItemHistory(item);
    setIsHistoryModalOpen(true);
  };

  return (
    <div>
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
              placeholder="Cari nama sembako atau kode SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-control filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          Tambah Barang Baru
        </button>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>SKU/Kode</th>
                <th>Nama Sembako</th>
                <th>Kategori</th>
                <th style={{ textAlign: "right" }}>Stok</th>
                <th>Satuan</th>
                <th style={{ textAlign: "right" }}>Harga Beli</th>
                <th style={{ textAlign: "right" }}>Harga Jual</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isLowStock = item.stock <= item.minStock;
                const isOutOfStock = item.stock === 0;

                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.sku}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                    </td>
                    <td>
                      <span className="badge primary">{item.category}</span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      <span style={{ color: isOutOfStock ? "var(--danger)" : isLowStock ? "var(--warning)" : "inherit" }}>
                        {item.stock}
                      </span>
                    </td>
                    <td><span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.unit}</span></td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(item.purchasePrice)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{formatRupiah(item.sellingPrice)}</td>
                    <td>
                      {isOutOfStock ? (
                        <span className="badge danger">Habis</span>
                      ) : isLowStock ? (
                        <span className="badge warning">Kritis</span>
                      ) : (
                        <span className="badge success">Aman</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn-icon"
                          title="Riwayat Harga & Toko Supplier"
                          onClick={() => openHistoryModal(item)}
                        >
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Data Barang"
                          onClick={() => openEditModal(item)}
                        >
                          <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Hapus Barang"
                          onClick={() => onDeleteItem(item.id)}
                        >
                          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                    Tidak ada barang sembako ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Tambah Sembako Baru</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kode Barang / SKU (Opsional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Kosongkan untuk otomatis"
                      value={newItem.sku}
                      onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-control"
                      value={showNewCategoryInput ? "__new__" : newItem.category}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setShowNewCategoryInput(true);
                        } else {
                          setShowNewCategoryInput(false);
                          setNewItem({ ...newItem, category: e.target.value });
                        }
                      }}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__new__">+ Tambah Kategori Baru...</option>
                    </select>
                  </div>
                </div>

                {showNewCategoryInput && (
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">Nama Kategori Baru</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Masukkan nama kategori baru"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nama Sembako</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Beras Ramos Cianjur 5kg"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Stok Awal</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minimum Stok (Kritis)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Satuan</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="kg, liter, pcs, dus"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lokasi Pembelian / Toko</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nama Agen / Supplier"
                      value={newItem.purchaseLocation}
                      onChange={(e) => setNewItem({ ...newItem, purchaseLocation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Harga Beli Awal (Rp)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={newItem.purchasePrice}
                      onChange={(e) => setNewItem({ ...newItem, purchasePrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Harga Jual Default (Rp)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={newItem.sellingPrice}
                      onChange={(e) => setNewItem({ ...newItem, sellingPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Data Sembako</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kode Barang / SKU (Tidak dapat diedit)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingItem.sku}
                      disabled
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-control"
                      value={showEditCategoryInput ? "__new__" : editingItem.category}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setShowEditCategoryInput(true);
                        } else {
                          setShowEditCategoryInput(false);
                          setEditingItem({ ...editingItem, category: e.target.value });
                        }
                      }}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__new__">+ Tambah Kategori Baru...</option>
                    </select>
                  </div>
                </div>

                {showEditCategoryInput && (
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">Nama Kategori Baru</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Masukkan nama kategori baru"
                      value={editCustomCategory}
                      onChange={(e) => setEditCustomCategory(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nama Sembako</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Stok Saat Ini (Edit manual)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={editingItem.stock}
                      onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minimum Stok</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={editingItem.minStock}
                      onChange={(e) => setEditingItem({ ...editingItem, minStock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Satuan</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingItem.unit}
                      onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Harga Jual Default (Rp)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={editingItem.sellingPrice}
                      onChange={(e) => setEditingItem({ ...editingItem, sellingPrice: Number(e.target.value) })}
                    />
                  </div>
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

      {isHistoryModalOpen && selectedItemHistory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Riwayat Toko & Harga: {selectedItemHistory.name}</h3>
              <button className="modal-close" onClick={() => setIsHistoryModalOpen(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh" }}>
              <div style={{ display: "flex", justifycontent: "space-between", marginBottom: "18px", fontSize: "13px" }}>
                <span>Harga Jual Saat Ini: <strong>{formatRupiah(selectedItemHistory.sellingPrice)}</strong></span>
                <span>Stok: <strong>{selectedItemHistory.stock} {selectedItemHistory.unit}</strong></span>
              </div>
              
              <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)" }}>
                Daftar Harga Beli per Toko Supplier:
              </h4>

              <div className="supplier-history-list">
                {(!selectedItemHistory.purchaseHistory || selectedItemHistory.purchaseHistory.length === 0) ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
                    Belum ada riwayat pembelian supplier tercatat.
                  </div>
                ) : (
                  [...selectedItemHistory.purchaseHistory]
                    .reverse()
                    .map((history) => (
                      <div className="supplier-history-card" key={history.id}>
                        <div className="supplier-info">
                          <span className="supplier-name"> {history.location || "Supplier Umum"}</span>
                          <span className="supplier-date">Tanggal: {history.date}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="supplier-price">{formatRupiah(history.price)}</span>
                          <div className="supplier-qty">Kuantitas: {history.qty} {selectedItemHistory.unit}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsHistoryModalOpen(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
