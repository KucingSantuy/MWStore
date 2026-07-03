import { useState } from "react";

export default function Transactions({ items, formatRupiah, onRecordRestock, onRecordSale, setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState("keluar");
  const [successMessage, setSuccessMessage] = useState("");
  const [lastTransaction, setLastTransaction] = useState(null);

  const [restockForm, setRestockForm] = useState({
    itemId: "",
    qty: "",
    purchasePrice: "",
    location: "",
    notes: "",
    date: new Date().toISOString().split("T")[0]
  });

  const [saleForm, setSaleForm] = useState({
    itemId: "",
    qty: "",
    sellingPrice: "",
    customer: "",
    paymentStatus: "lunas",
    amountPaid: "",
    notes: "",
    date: new Date().toISOString().split("T")[0]
  });

  const handlePaymentStatusChange = (status) => {
    setSaleForm((prev) => {
      return {
        ...prev,
        paymentStatus: status,
        amountPaid: status === "lunas" ? "" : "0"
      };
    });
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const { itemId, qty, purchasePrice, location } = restockForm;
    if (!itemId || !qty || !purchasePrice || !location) {
      alert("Mohon lengkapi semua field bertanda bintang (*)");
      return;
    }

    const success = await onRecordRestock(restockForm);
    if (success) {
      const item = items.find(it => it.id === itemId);
      setSuccessMessage(`Sukses menambah stok ${qty} ${item ? item.unit : ""} ${item ? item.name : ""} dari ${location}!`);
      setRestockForm({
        itemId: "",
        qty: "",
        purchasePrice: "",
        location: "",
        notes: "",
        date: new Date().toISOString().split("T")[0]
      });
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    const { itemId, qty, sellingPrice, paymentStatus, amountPaid } = saleForm;
    if (!itemId || !qty || !sellingPrice) {
      alert("Mohon lengkapi barang, kuantitas, dan harga jual.");
      return;
    }

    const selectedItem = items.find((it) => it.id === itemId);
    if (!selectedItem) return;

    if (selectedItem.stock < Number(qty)) {
      alert(`Stok tidak mencukupi! Stok ${selectedItem.name} saat ini hanya ${selectedItem.stock} ${selectedItem.unit}.`);
      return;
    }

    const total = Number(qty) * Number(sellingPrice);
    const paid = paymentStatus === "lunas" ? total : Number(amountPaid || 0);

    if (paymentStatus === "belum_lunas" && paid >= total) {
      alert("Pembayaran belum lunas harus memiliki jumlah bayar kurang dari total transaksi!");
      return;
    }

    const invoiceId = await onRecordSale({
      ...saleForm,
      amountPaid: paid
    });

    if (invoiceId) {
      setLastTransaction({
        invoiceId,
        date: saleForm.date,
        customer: saleForm.customer || "Umum",
        itemName: selectedItem.name,
        qty: Number(qty),
        unit: selectedItem.unit,
        price: Number(sellingPrice),
        total,
        paid,
        debt: paymentStatus === "belum_lunas" ? Math.max(0, total - paid) : 0,
        paymentStatus,
        notes: saleForm.notes
      });

      setSaleForm({
        itemId: "",
        qty: "",
        sellingPrice: "",
        customer: "",
        paymentStatus: "lunas",
        amountPaid: "",
        notes: "",
        date: new Date().toISOString().split("T")[0]
      });
    }
  };

  const selectedRestockItem = items.find((it) => it.id === restockForm.itemId);
  const selectedSaleItem = items.find((it) => it.id === saleForm.itemId);
  const saleTotal = selectedSaleItem ? Number(saleForm.qty || 0) * Number(saleForm.sellingPrice || selectedSaleItem.sellingPrice) : 0;
  const saleDebt = saleForm.paymentStatus === "belum_lunas" ? Math.max(0, saleTotal - Number(saleForm.amountPaid || 0)) : 0;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          className={`btn ${activeSubTab === "keluar" ? "btn-primary" : "btn-secondary"}`}
          style={{ flex: 1 }}
          onClick={() => {
            setActiveSubTab("keluar");
            setSuccessMessage("");
          }}
        >
          Barang Keluar / Catat Penjualan
        </button>
        <button
          className={`btn ${activeSubTab === "masuk" ? "btn-primary" : "btn-secondary"}`}
          style={{ flex: 1 }}
          onClick={() => {
            setActiveSubTab("masuk");
            setSuccessMessage("");
          }}
        >
          Barang Masuk / Pembelian Stok
        </button>
      </div>

      {successMessage && (
        <div
          className="badge success"
          style={{
            display: "block",
            padding: "12px 18px",
            fontSize: "14px",
            textTransform: "none",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
            textAlign: "center",
            width: "100%"
          }}
        >
          {successMessage}
        </div>
      )}

      {activeSubTab === "keluar" && (
        <div className="content-card">
          <div className="card-title">Form Catat Penjualan Sembako</div>
          
          <form onSubmit={handleSaleSubmit}>
            <div className="form-group">
              <label className="form-label">Pilih Barang Sembako *</label>
              <select
                className="form-control"
                value={saleForm.itemId}
                onChange={(e) => {
                  const id = e.target.value;
                  const selectedItem = items.find((it) => it.id === id);
                  setSaleForm((prev) => ({
                    ...prev,
                    itemId: id,
                    sellingPrice: selectedItem ? selectedItem.sellingPrice : "",
                    amountPaid: prev.paymentStatus === "lunas" ? "" : "0"
                  }));
                }}
                required
              >
                <option value="">-- Pilih Barang --</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id} disabled={it.stock === 0}>
                    {it.sku} - {it.name} (Stok: {it.stock} {it.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedSaleItem && (
              <div
                style={{
                  background: "var(--bg-primary)",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px"
                }}
              >
                <span>Satuan: <strong>{selectedSaleItem.unit}</strong></span>
                <span>Stok Saat Ini: <strong style={{ color: selectedSaleItem.stock <= selectedSaleItem.minStock ? "var(--warning)" : "inherit" }}>{selectedSaleItem.stock}</strong></span>
                <span>Harga Jual Toko: <strong>{formatRupiah(selectedSaleItem.sellingPrice)}</strong></span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kuantitas Penjualan *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Jumlah terjual"
                  min="1"
                  max={selectedSaleItem ? selectedSaleItem.stock : ""}
                  value={saleForm.qty}
                  onChange={(e) => setSaleForm({ ...saleForm, qty: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Harga Jual per Satuan (Rp) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Harga per unit"
                  min="0"
                  value={saleForm.sellingPrice}
                  onChange={(e) => setSaleForm({ ...saleForm, sellingPrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nama Pembeli / Customer</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Bu Ani, Umum"
                  value={saleForm.customer}
                  onChange={(e) => setSaleForm({ ...saleForm, customer: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Transaksi *</label>
                <input
                  type="date"
                  className="form-control"
                  value={saleForm.date}
                  onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status Pembayaran</label>
                <select
                  className="form-control"
                  value={saleForm.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                >
                  <option value="lunas">Lunas Seketika</option>
                  <option value="belum_lunas">Belum Lunas (Kredit/Piutang)</option>
                </select>
              </div>

              {saleForm.paymentStatus === "belum_lunas" && (
                <div className="form-group">
                  <label className="form-label">Jumlah Uang yang Dibayar Awal (Rp) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Contoh: 100000"
                    min="0"
                    max={saleTotal}
                    value={saleForm.amountPaid}
                    onChange={(e) => setSaleForm({ ...saleForm, amountPaid: e.target.value })}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Keterangan / Catatan Tambahan</label>
              <textarea
                className="form-control"
                placeholder="Catatan tambahan transaksi..."
                value={saleForm.notes}
                onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                rows="2"
              ></textarea>
            </div>

            {saleTotal > 0 && (
              <div
                style={{
                  background: "var(--bg-primary)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  border: "1px solid var(--border-color)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                  <span>Total Harga Jual:</span>
                  <span style={{ fontSize: "16px", color: "var(--primary)" }}>{formatRupiah(saleTotal)}</span>
                </div>
                {saleForm.paymentStatus === "belum_lunas" && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success-text)", fontSize: "13px" }}>
                      <span>Jumlah Dibayar:</span>
                      <span>{formatRupiah(Number(saleForm.amountPaid || 0))}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--danger-text)", fontWeight: 700 }}>
                      <span>Sisa Piutang Toko:</span>
                      <span>{formatRupiah(saleDebt)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button type="submit" className="btn btn-success" disabled={!saleForm.itemId}>
                Simpan & Selesaikan Penjualan
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSubTab === "masuk" && (
        <div className="content-card">
          <div className="card-title">Form Pembelian Sembako / Restock Barang</div>

          <form onSubmit={handleRestockSubmit}>
            <div className="form-group">
              <label className="form-label">Pilih Barang Sembako *</label>
              <select
                className="form-control"
                value={restockForm.itemId}
                onChange={(e) => {
                  const id = e.target.value;
                  const selectedItem = items.find((it) => it.id === id);
                  setRestockForm((prev) => ({
                    ...prev,
                    itemId: id,
                    purchasePrice: selectedItem ? selectedItem.purchasePrice : ""
                  }));
                }}
                required
              >
                <option value="">-- Pilih Barang --</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.sku} - {it.name} (Stok saat ini: {it.stock} {it.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedRestockItem && (
              <div
                style={{
                  background: "var(--bg-primary)",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px"
                }}
              >
                <span>Satuan: <strong>{selectedRestockItem.unit}</strong></span>
                <span>Stok Saat Ini: <strong>{selectedRestockItem.stock}</strong></span>
                <span>Harga Beli Terakhir: <strong>{formatRupiah(selectedRestockItem.purchasePrice)}</strong></span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Jumlah Restock *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Kuantitas masuk"
                  min="1"
                  value={restockForm.qty}
                  onChange={(e) => setRestockForm({ ...restockForm, qty: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Harga Beli per Satuan (Rp) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Harga beli dari supplier"
                  min="0"
                  value={restockForm.purchasePrice}
                  onChange={(e) => setRestockForm({ ...restockForm, purchasePrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Toko / Lokasi Pembelian (Supplier) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Toko Makmur Jaya, Pasar Induk, Agen Indofood"
                  value={restockForm.location}
                  onChange={(e) => setRestockForm({ ...restockForm, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Restock *</label>
                <input
                  type="date"
                  className="form-control"
                  value={restockForm.date}
                  onChange={(e) => setRestockForm({ ...restockForm, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Catatan</label>
              <textarea
                className="form-control"
                placeholder="Catatan tambahan restock..."
                value={restockForm.notes}
                onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                rows="2"
              ></textarea>
            </div>

            {selectedRestockItem && Number(restockForm.qty || 0) > 0 && (
              <div
                style={{
                  background: "var(--bg-primary)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600,
                  border: "1px solid var(--border-color)"
                }}
              >
                <span>Total Pengeluaran Pembelian:</span>
                <span style={{ fontSize: "16px", color: "var(--primary)" }}>
                  {formatRupiah(Number(restockForm.qty) * Number(restockForm.purchasePrice))}
                </span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button type="submit" className="btn btn-primary" disabled={!restockForm.itemId}>
                Simpan Transaksi Masuk
              </button>
            </div>
          </form>
        </div>
      )}

      {lastTransaction && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000
          }}
        >
          <div
            className="content-card"
            style={{
              width: "90%",
              maxWidth: "400px",
              padding: "24px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div id="print-area" style={{ fontFamily: "monospace", color: "#000", padding: "10px", backgroundColor: "#fff" }}>
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "bold" }}>MW STORE</h3>
                <p style={{ margin: 0, fontSize: "12px" }}>Persediaan Sembako Berkualitas</p>
                <p style={{ margin: 0, fontSize: "12px" }}>Tanggal: {lastTransaction.date}</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>No: {lastTransaction.invoiceId}</p>
              </div>
              <div style={{ borderBottom: "1px dashed #000", marginBottom: "12px" }}></div>
              <div style={{ fontSize: "13px", marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Pelanggan:</span>
                  <span>{lastTransaction.customer}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Status:</span>
                  <span style={{ textTransform: "uppercase" }}>{lastTransaction.paymentStatus === "lunas" ? "LUNAS" : "BELUM LUNAS"}</span>
                </div>
              </div>
              <div style={{ borderBottom: "1px dashed #000", marginBottom: "12px" }}></div>
              <div style={{ fontSize: "13px", marginBottom: "12px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{lastTransaction.itemName}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{lastTransaction.qty} {lastTransaction.unit} x {formatRupiah(lastTransaction.price)}</span>
                  <span>{formatRupiah(lastTransaction.total)}</span>
                </div>
              </div>
              <div style={{ borderBottom: "1px dashed #000", marginBottom: "12px" }}></div>
              <div style={{ fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginBottom: "4px" }}>
                  <span>TOTAL:</span>
                  <span>{formatRupiah(lastTransaction.total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>BAYAR:</span>
                  <span>{formatRupiah(lastTransaction.paid)}</span>
                </div>
                {lastTransaction.debt > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span>SISA PIUTANG:</span>
                    <span>{formatRupiah(lastTransaction.debt)}</span>
                  </div>
                )}
              </div>
              {lastTransaction.notes && (
                <>
                  <div style={{ borderBottom: "1px dashed #000", margin: "12px 0" }}></div>
                  <div style={{ fontSize: "12px", fontStyle: "italic" }}>
                    Catatan: {lastTransaction.notes}
                  </div>
                </>
              )}
              <div style={{ borderBottom: "1px dashed #000", margin: "12px 0" }}></div>
              <div style={{ textAlign: "center", fontSize: "12px" }}>
                Terima Kasih Atas Kunjungan Anda
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => window.print()}
              >
                Cetak Struk / Simpan PDF
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setLastTransaction(null);
                  setActiveTab("dashboard");
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
