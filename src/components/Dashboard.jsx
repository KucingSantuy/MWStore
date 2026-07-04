export default function Dashboard({ items, transactions, debts, formatRupiah, setActiveTab, onExport, onImport }) {
  const totalItemsCount = items.length;
  
  const totalStockValue = items.reduce((acc, item) => {
    return acc + Number(item.stock) * Number(item.purchasePrice);
  }, 0);

  const potentialProfit = items.reduce((acc, item) => {
    const profitPerUnit = Number(item.sellingPrice) - Number(item.purchasePrice);
    return acc + (Number(item.stock) * (profitPerUnit > 0 ? profitPerUnit : 0));
  }, 0);

  const totalOutstandingDebt = debts.reduce((acc, debt) => {
    if (debt.status === "belum_lunas") {
      return acc + Number(debt.remaining);
    }
    return acc;
  }, 0);

  const lowStockItems = items.filter((item) => item.stock <= item.minStock);

  const categoryData = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.stock;
    return acc;
  }, {});

  const maxStock = Math.max(...Object.values(categoryData), 1);

  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    const daySales = transactions
      .filter(t => {
        const tDateStr = t.date ? (typeof t.date === 'string' ? t.date.split("T")[0] : new Date(t.date).toISOString().split("T")[0]) : '';
        return tDateStr === dateStr && t.type === "keluar";
      })
      .reduce((sum, t) => sum + Number(t.total), 0);

    const dayPurchases = transactions
      .filter(t => {
        const tDateStr = t.date ? (typeof t.date === 'string' ? t.date.split("T")[0] : new Date(t.date).toISOString().split("T")[0]) : '';
        return tDateStr === dateStr && (t.type === "masuk" || t.type === "penyesuaian_tambah");
      })
      .reduce((sum, t) => sum + Number(t.total), 0);

    const label = d.toLocaleDateString("id-ID", { weekday: "short" });
    chartData.push({ date: dateStr, label, sales: daySales, purchases: dayPurchases });
  }
  
  const maxVal = Math.max(...chartData.flatMap(d => [d.sales, d.purchases]), 100000);
  const paddingX = 40;
  const paddingY = 20;
  const width = 600;
  const height = 180;
  
  const getX = (index) => paddingX + (index * (width - 2 * paddingX)) / 6;
  const getY = (val) => height - paddingY - (val * (height - 2 * paddingY)) / maxVal;

  const salesPoints = chartData.map((d, i) => `${getX(i)},${getY(d.sales)}`).join(" ");
  const purchasePoints = chartData.map((d, i) => `${getX(i)},${getY(d.purchases)}`).join(" ");

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Jenis Barang</span>
            <div className="stat-icon-wrapper primary">
              <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4 8 4 8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/></svg>
            </div>
          </div>
          <div className="stat-value">{totalItemsCount}</div>
          <span className="stat-desc">Total jenis sembako terdaftar</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Nilai Aset Stok</span>
            <div className="stat-icon-wrapper info">
              <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
          </div>
          <div className="stat-value">{formatRupiah(totalStockValue)}</div>
          <span className="stat-desc">Estimasi modal persediaan aktif</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Potensi Untung</span>
            <div className="stat-icon-wrapper success">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
          </div>
          <div className="stat-value">{formatRupiah(potentialProfit)}</div>
          <span className="stat-desc">Selisih harga jual & beli dari stok</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Piutang Pembeli</span>
            <div className="stat-icon-wrapper warning">
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div className="stat-value">{formatRupiah(totalOutstandingDebt)}</div>
          <span className="stat-desc">Total dana yang belum dilunasi</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <div className="card-title">
            <span>Tren Transaksi 7 Hari Terakhir</span>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#10b981", borderRadius: "2px" }}></span>
                Penjualan (Sales)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#6366f1", borderRadius: "2px" }}></span>
                Pembelian (Purchases)
              </span>
            </div>
          </div>
          
          <div className="chart-container">
            <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`}>
              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1={paddingX} y1={(height - paddingY) / 2 + paddingY / 2} x2={width - paddingX} y2={(height - paddingY) / 2 + paddingY / 2} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="var(--border-color)" strokeWidth="1" />
              
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={purchasePoints}
              />

              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={salesPoints}
              />

              {chartData.map((d, i) => (
                <g key={i}>
                  {d.sales > 0 && (
                    <circle cx={getX(i)} cy={getY(d.sales)} r="4" fill="#10b981" />
                  )}
                  {d.purchases > 0 && (
                    <circle cx={getX(i)} cy={getY(d.purchases)} r="4" fill="#6366f1" />
                  )}
                  <text
                    x={getX(i)}
                    y={height - 4}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize="9px"
                    fontWeight="600"
                  >
                    {d.label}
                  </text>
                </g>
              ))}

              <text x={2} y={paddingY + 4} fill="var(--text-muted)" fontSize="8px">{formatRupiah(maxVal)}</text>
              <text x={2} y={(height - paddingY) / 2 + paddingY / 2 + 4} fill="var(--text-muted)" fontSize="8px">{formatRupiah(maxVal / 2)}</text>
              <text x={2} y={height - paddingY + 4} fill="var(--text-muted)" fontSize="8px">Rp 0</text>
            </svg>
          </div>
        </div>

        <div className="content-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-title">
            Peringatan Stok Tipis
            <span className="badge danger">{lowStockItems.length} barang</span>
          </div>

          <div style={{ flexGrow: 1, overflowY: "auto", maxHeight: "190px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {lowStockItems.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0", fontSize: "13px" }}>
                Semua stok sembako aman!
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-primary)",
                    borderLeft: "4px solid var(--danger)",
                    fontSize: "13px"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Stok: <span style={{ color: "var(--danger)", fontWeight: 600 }}>{item.stock}</span> / Min: {item.minStock} {item.unit}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                    onClick={() => setActiveTab("transactions")}
                  >
                    Beli Stok
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "24px" }} className="dashboard-two-col-grid">
        <div className="content-card">
          <div className="card-title">Sebaran Kategori Stok</div>
          <div className="category-progress-list">
            {Object.keys(categoryData).length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Belum ada data barang.</div>
            ) : (
              Object.entries(categoryData).map(([category, count]) => {
                const percentage = Math.round((count / maxStock) * 100);
                return (
                  <div key={category} className="category-progress-item">
                    <div className="category-progress-label">
                      <span>{category}</span>
                      <span style={{ fontWeight: 600 }}>{count} unit/kg</span>
                    </div>
                    <div className="category-progress-bar-bg">
                      <div
                        className="category-progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-title">Riwayat Transaksi Terbaru</div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tipe</th>
                  <th>Keterangan</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 4).map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td>
                      <span className={`badge ${tx.type === "masuk" ? "info" : tx.type === "keluar" ? "success" : "warning"}`}>
                        {tx.type === "masuk" ? "Masuk" : tx.type === "keluar" ? "Keluar" : "Bayar"}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{tx.itemName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {tx.type === "masuk" ? `Dari: ${tx.location}` : tx.type === "keluar" ? `Penerima: ${tx.customer}` : "Pelunasan piutang"}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(tx.total)}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>
                      Belum ada catatan transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="content-card" style={{ marginTop: "24px" }}>
        <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" style={{ color: "var(--primary)" }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Pencadangan & Keamanan Data (Backup / Restore)</span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>
          Karena sistem menggunakan hosting gratisan, data Anda rentan hilang apabila database dinonaktifkan atau di-reset oleh penyedia hosting. 
          Sangat disarankan untuk melakukan <strong>ekspor data (Backup) secara berkala</strong> dan menyimpannya di komputer lokal Anda agar seluruh data transaksi, produk, dan hutang tetap aman.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={onExport}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: "4px" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Ekspor Data (Backup JSON)
          </button>
          
          <div style={{ position: "relative" }}>
            <button className="btn btn-secondary" onClick={() => document.getElementById('import-file-input').click()}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: "4px" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Impor Data (Restore JSON)
            </button>
            <input 
              id="import-file-input" 
              type="file" 
              accept=".json" 
              style={{ display: "none" }} 
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = async (event) => {
                  const content = event.target.result;
                  if (window.confirm("Peringatan: Tindakan ini akan menghapus semua data Anda saat ini di database dan menggantinya dengan data dari file backup. Apakah Anda yakin ingin melanjutkan?")) {
                    const success = await onImport(content);
                    if (success) {
                      e.target.value = '';
                    }
                  }
                };
                reader.readAsText(file);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
