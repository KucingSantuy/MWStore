import { useState } from "react";

export default function TransactionLogs({ transactions, formatRupiah }) {
  const formatDateStr = (dateStr) => {
    if (!dateStr) return "-";
    const clean = typeof dateStr === 'string' ? dateStr.split("T")[0] : new Date(dateStr).toISOString().split("T")[0];
    const parts = clean.split("-");
    if (parts.length !== 3) return clean;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("semua");

  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch =
      tx.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.customer && tx.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.location && tx.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesType = true;
    if (typeFilter === "masuk") {
      matchesType = tx.type === "masuk";
    } else if (typeFilter === "keluar") {
      matchesType = tx.type === "keluar";
    } else if (typeFilter === "bayar_hutang") {
      matchesType = tx.type === "bayar_hutang";
    }

    return matchesSearch && matchesType;
  });

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
              placeholder="Cari transaksi berdasarkan barang, nama pembeli, supplier, atau catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-control filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="semua">Semua Transaksi</option>
            <option value="masuk">Barang Masuk (Restock)</option>
            <option value="keluar">Barang Keluar (Penjualan)</option>
            <option value="bayar_hutang">Pelunasan Piutang (Cicilan)</option>
          </select>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title">
          Catatan Transaksi Persediaan Sembako
          <span className="badge info">{filteredTxs.length} catatan</span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Barang Sembako</th>
                <th style={{ textAlign: "right" }}>Jumlah</th>
                <th style={{ textAlign: "right" }}>Harga Satuan</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th>Keterangan Toko / Pembeli</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.map((tx) => {
                let badgeClass = "primary";
                let typeText = "Transaksi";
                if (tx.type === "masuk") {
                  badgeClass = "info";
                  typeText = "Stok Masuk";
                } else if (tx.type === "keluar") {
                  badgeClass = "success";
                  typeText = "Penjualan";
                } else if (tx.type === "bayar_hutang") {
                  badgeClass = "warning";
                  typeText = "Bayar Hutang";
                }

                return (
                  <tr key={tx.id}>
                    <td style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {tx.id}
                    </td>
                    <td>{formatDateStr(tx.date)}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{typeText}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tx.itemName || "-"}</div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {tx.qty > 0 ? `${tx.qty}` : "-"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {tx.price > 0 ? formatRupiah(tx.price) : "-"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {formatRupiah(tx.total)}
                    </td>
                    <td>
                      {tx.type === "masuk" && (
                        <span>{tx.location || "-"}</span>
                      )}
                      {tx.type === "keluar" && (
                        <div>
                          <span>{tx.customer || "Umum"}</span>
                          {tx.paymentStatus && (
                            <span
                              className={`badge ${tx.paymentStatus === "lunas" ? "success" : "warning"}`}
                              style={{ fontSize: "9px", padding: "1px 6px", marginLeft: "6px" }}
                            >
                              {tx.paymentStatus === "lunas" ? "Lunas" : `Hutang: ${formatRupiah(tx.debt)}`}
                            </span>
                          )}
                        </div>
                      )}
                      {tx.type === "bayar_hutang" && (
                        <span>Debitur: {tx.customer}</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        {tx.notes || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                    Belum ada catatan transaksi log yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
