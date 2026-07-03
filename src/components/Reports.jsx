import { useState } from "react";

export default function Reports({ transactions, items, formatRupiah }) {
  const [reportType, setReportType] = useState("monthly");

  const getRangeStartDate = () => {
    const today = new Date();
    if (reportType === "weekly") {
      today.setDate(today.getDate() - 7);
    } else {
      today.setDate(today.getDate() - 30);
    }
    return today.toISOString().split("T")[0];
  };

  const startDate = getRangeStartDate();
  const todayDate = new Date().toISOString().split("T")[0];

  const rangeTransactions = transactions.filter((t) => {
    const tDateStr = t.date ? (typeof t.date === 'string' ? t.date.split("T")[0] : new Date(t.date).toISOString().split("T")[0]) : '';
    return tDateStr >= startDate && tDateStr <= todayDate;
  });

  const totalSalesVal = rangeTransactions
    .filter((t) => t.type === "keluar")
    .reduce((sum, t) => sum + Number(t.total || 0), 0);

  const totalPurchasesVal = rangeTransactions
    .filter((t) => t.type === "masuk")
    .reduce((sum, t) => sum + Number(t.total || 0), 0);

  const salesCashCollected = rangeTransactions
    .filter((t) => t.type === "keluar")
    .reduce((sum, t) => sum + Number(t.amountPaid || 0), 0);

  const debtPaymentsCollected = rangeTransactions
    .filter((t) => t.type === "bayar_hutang")
    .reduce((sum, t) => sum + Number(t.total || 0), 0);

  const totalCashIn = salesCashCollected + debtPaymentsCollected;

  const costOfGoodsSold = rangeTransactions
    .filter((t) => t.type === "keluar")
    .reduce((sum, t) => {
      const item = items.find((it) => it.id === t.itemId);
      const costPrice = item ? Number(item.purchasePrice) : Number(t.price) * 0.8;
      return sum + Number(t.qty) * costPrice;
    }, 0);

  const netProfit = totalSalesVal - costOfGoodsSold;

  const unpaidBalanceCreated = rangeTransactions
    .filter((t) => t.type === "keluar" && t.paymentStatus === "belum_lunas")
    .reduce((sum, t) => sum + Number(t.debt || 0), 0);

  const salesQuantityMap = rangeTransactions
    .filter((t) => t.type === "keluar")
    .reduce((acc, t) => {
      acc[t.itemName] = (acc[t.itemName] || 0) + t.qty;
      return acc;
    }, {});

  const topSellingItems = Object.entries(salesQuantityMap)
    .map(([name, qty]) => {
      const txs = rangeTransactions.filter(t => t.itemName === name && t.type === "keluar");
      const totalRevenue = txs.reduce((sum, t) => sum + t.total, 0);
      return { name, qty, totalRevenue };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const supplierAnalysis = rangeTransactions
    .filter((t) => t.type === "masuk" && t.location)
    .reduce((acc, t) => {
      if (!acc[t.location]) {
        acc[t.location] = {
          name: t.location,
          totalSpent: 0,
          itemsBought: {}
        };
      }
      acc[t.location].totalSpent += Number(t.total || 0);
      
      const currentLocItem = acc[t.location].itemsBought[t.itemName];
      if (!currentLocItem || Number(t.price) < Number(currentLocItem.minPrice)) {
        acc[t.location].itemsBought[t.itemName] = {
          minPrice: Number(t.price || 0),
          date: t.date,
          qty: Number(t.qty || 0)
        };
      }
      return acc;
    }, {});

  const supplierList = Object.values(supplierAnalysis).sort((a, b) => b.totalSpent - a.totalSpent);

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="print-only-header">
        <h1>LAPORAN STATISTIK MWSTORE</h1>
        <p>
          Jenis Laporan: {reportType === "weekly" ? "Laporan Mingguan (7 Hari)" : "Laporan Bulanan (30 Hari)"}
        </p>
        <p>Periode: {startDate} s/d {todayDate}</p>
        <p>Dicetak Pada: {new Date().toLocaleDateString("id-ID")} - Kasir Toko</p>
      </div>

      <div className="page-header-controls">
        <div className="btn-group">
          <button
            className={`btn ${reportType === "weekly" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setReportType("weekly")}
          >
            Mingguan (7 Hari Terakhir)
          </button>
          <button
            className={`btn ${reportType === "monthly" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setReportType("monthly")}
          >
            Bulanan (30 Hari Terakhir)
          </button>
        </div>

        <button className="btn btn-secondary" onClick={triggerPrint}>
          Cetak / Ekspor PDF Laporan
        </button>
      </div>

      <div className="content-card">
        <div className="card-title">
          Ikhtisar Keuangan ({reportType === "weekly" ? "Mingguan" : "Bulanan"})
          <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--text-muted)" }}>
            Periode: {startDate} s/d {todayDate}
          </span>
        </div>

        <div className="report-header-summary">
          <div className="report-summary-box">
            <div className="report-summary-label">Total Omset Penjualan</div>
            <div className="report-summary-val" style={{ color: "var(--primary)" }}>
              {formatRupiah(totalSalesVal)}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              Total nilai barang keluar
            </div>
          </div>

          <div className="report-summary-box">
            <div className="report-summary-label">Total Belanja Stok</div>
            <div className="report-summary-val" style={{ color: "var(--info)" }}>
              {formatRupiah(totalPurchasesVal)}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              Total restock pembelian
            </div>
          </div>

          <div className="report-summary-box">
            <div className="report-summary-label">Keuntungan Bersih Produk</div>
            <div className="report-summary-val" style={{ color: "var(--success)" }}>
              {formatRupiah(netProfit)}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              Selisih harga jual vs modal HPP
            </div>
          </div>

          <div className="report-summary-box">
            <div className="report-summary-label">Piutang Baru Terbentuk</div>
            <div className="report-summary-val" style={{ color: "var(--danger)" }}>
              {formatRupiah(unpaidBalanceCreated)}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              Total sisa hutang pembeli baru
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-primary)",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>Uang Cash Diterima (Arus Kas Masuk)</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Penjualan Lunas ({formatRupiah(salesCashCollected)}) + Pembayaran Piutang ({formatRupiah(debtPaymentsCollected)})
            </div>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--success)" }}>
            {formatRupiah(totalCashIn)}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <div className="card-title">Barang Terlaris (Top 5)</div>
          
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th style={{ textAlign: "right" }}>Jumlah Terjual</th>
                  <th style={{ textAlign: "right" }}>Total Omset</th>
                </tr>
              </thead>
              <tbody>
                {topSellingItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: 700
                          }}
                        >
                          {idx + 1}
                        </span>
                        {item.name}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{item.qty} unit</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{formatRupiah(item.totalRevenue)}</td>
                  </tr>
                ))}

                {topSellingItems.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                      Belum ada penjualan tercatat dalam rentang waktu ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-card">
          <div className="card-title">Analisis Toko Supplier & Harga</div>
          
          <div style={{ overflowY: "auto", maxHeight: "250px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {supplierList.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px", fontSize: "13px" }}>
                Belum ada data belanja restock dalam rentang waktu ini.
              </div>
            ) : (
              supplierList.map((sup, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    background: "var(--bg-primary)",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    fontSize: "13px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginBottom: "8px" }}>
                    <span>{sup.name}</span>
                    <span style={{ color: "var(--primary)" }}>{formatRupiah(sup.totalSpent)}</span>
                  </div>
                  
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    <div style={{ fontWeight: 500, marginBottom: "4px" }}>Barang Dibeli (Harga Termurah):</div>
                    <ul style={{ listStyleType: "none", paddingLeft: "8px" }}>
                      {Object.entries(sup.itemsBought).map(([iName, info]) => (
                        <li key={iName} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                          <span>{iName}</span>
                          <strong>{formatRupiah(info.minPrice)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
