import { useState } from "react";

export default function DebtTracker({ debts, formatRupiah, onPayDebt }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const [paymentData, setPaymentData] = useState({
    amountPaid: "",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const activeDebts = debts.filter((debt) => debt.status === "belum_lunas");
  const filteredDebts = activeDebts.filter((debt) =>
    debt.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openPaymentModal = (debt) => {
    setSelectedDebt(debt);
    setPaymentData({
      amountPaid: debt.remaining,
      date: new Date().toISOString().split("T")[0],
      notes: ""
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(paymentData.amountPaid);
    if (!amount || amount <= 0) {
      alert("Masukkan jumlah cicilan pembayaran yang valid.");
      return;
    }
    if (amount > selectedDebt.remaining) {
      alert(`Jumlah bayar melebihi sisa piutang! Sisa piutang adalah ${formatRupiah(selectedDebt.remaining)}`);
      return;
    }

    const success = await onPayDebt({
      debtId: selectedDebt.id,
      amountPaid: amount,
      date: paymentData.date,
      notes: paymentData.notes
    });

    if (success) {
      setIsPaymentModalOpen(false);
      setSelectedDebt(null);
    }
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
              placeholder="Cari nama pembeli / debitur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title">
          Daftar Piutang Aktif Pelanggan
          <span className="badge warning">{filteredDebts.length} debitur</span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tanggal Transaksi</th>
                <th>Nama Pembeli</th>
                <th style={{ textAlign: "right" }}>Total Belanja</th>
                <th style={{ textAlign: "right" }}>Sudah Dibayar</th>
                <th style={{ textAlign: "right" }}>Sisa Piutang</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.map((debt) => (
                <tr key={debt.id}>
                  <td>{debt.date}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{debt.customer}</div>
                  </td>
                  <td style={{ textAlign: "right" }}>{formatRupiah(debt.total)}</td>
                  <td style={{ textAlign: "right", color: "var(--success-text)", fontWeight: 500 }}>
                    {formatRupiah(debt.paid)}
                  </td>
                  <td style={{ textAlign: "right", color: "var(--danger-text)", fontWeight: 700 }}>
                    {formatRupiah(debt.remaining)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button className="btn btn-primary" onClick={() => openPaymentModal(debt)}>
                      Terima Cicilan / Lunasi
                    </button>
                  </td>
                </tr>
              ))}

              {filteredDebts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                    Tidak ada piutang aktif yang ditemukan. Semua pembayaran lunas!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isPaymentModalOpen && selectedDebt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Input Pembayaran: {selectedDebt.customer}</h3>
              <button className="modal-close" onClick={() => setIsPaymentModalOpen(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body" style={{ maxHeight: "65vh" }}>
                
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    background: "var(--bg-primary)",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "16px",
                    fontSize: "13px",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <div>Total Belanja: <strong>{formatRupiah(selectedDebt.total)}</strong></div>
                  <div>Sudah Dibayar: <strong style={{ color: "var(--success-text)" }}>{formatRupiah(selectedDebt.paid)}</strong></div>
                  <div style={{ gridColumn: "span 2", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--border-color)", fontWeight: 700, fontSize: "14px", color: "var(--danger-text)" }}>
                    Sisa Piutang: {formatRupiah(selectedDebt.remaining)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Jumlah Pembayaran / Angsuran (Rp) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Masukkan nominal uang"
                    min="1"
                    max={selectedDebt.remaining}
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Pembayaran *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Pembayaran</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Cicilan kedua, Bayar cash di toko"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: "24px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                    Riwayat Pembayaran Sebelumnya:
                  </h4>
                  
                  <div className="payment-history-timeline">
                    {selectedDebt.payments && selectedDebt.payments.map((p, idx) => (
                      <div className="timeline-item" key={idx}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-info">
                          <span className="timeline-date">{p.date}</span>
                          <span className="timeline-amount">+{formatRupiah(p.amount)}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {idx === 0 ? "Uang muka transaksi" : "Pembayaran cicilan"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
