import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'mwstore-super-secret-key-12345';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mwstore',
  port: Number(process.env.DB_PORT) || 3306,
};

let pool;

app.use('/api', async (req, res, next) => {
  if (!pool && req.path !== '/reset') {
    try {
      await initDB();
    } catch (err) {
      return res.status(503).json({ error: "Layanan database tidak tersedia. Pastikan server MySQL berjalan." });
    }
  }
  next();
});

async function initDB() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.end();

    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id VARCHAR(50) PRIMARY KEY,
        sku VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        minStock INT NOT NULL DEFAULT 0,
        unit VARCHAR(50) NOT NULL,
        purchasePrice DECIMAL(12, 2) NOT NULL DEFAULT 0,
        sellingPrice DECIMAL(12, 2) NOT NULL DEFAULT 0
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_history (
        id VARCHAR(50) PRIMARY KEY,
        itemId VARCHAR(50) NOT NULL,
        date VARCHAR(20) NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        location VARCHAR(255) NOT NULL,
        qty INT NOT NULL,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        invoiceId VARCHAR(50),
        date VARCHAR(20) NOT NULL,
        type VARCHAR(20) NOT NULL,
        itemId VARCHAR(50),
        itemName VARCHAR(255) NOT NULL,
        qty INT NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        total DECIMAL(12, 2) NOT NULL,
        location VARCHAR(255),
        notes TEXT,
        customer VARCHAR(255),
        paymentStatus VARCHAR(50),
        amountPaid DECIMAL(12, 2) DEFAULT 0,
        debt DECIMAL(12, 2) DEFAULT 0
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        type VARCHAR(20) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS debts (
        id VARCHAR(50) PRIMARY KEY,
        invoiceId VARCHAR(50),
        txId VARCHAR(50) NOT NULL,
        date VARCHAR(20) NOT NULL,
        customer VARCHAR(255) NOT NULL,
        total DECIMAL(12, 2) NOT NULL,
        paid DECIMAL(12, 2) NOT NULL,
        remaining DECIMAL(12, 2) NOT NULL,
        payments TEXT NOT NULL,
        status VARCHAR(50) NOT NULL
      )
    `);

    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      const adminPassHash = crypto.createHash('sha256').update('admin123').digest('hex');
      await pool.query(
        'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
        ['user-admin', 'admin', adminPassHash]
      );
    }

    const [rows] = await pool.query('SELECT COUNT(*) as count FROM items');
    if (rows[0].count === 0) {
      await seedInitialData();
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

async function seedInitialData() {
  const initialItems = [
    { id: "item-1", sku: "TP-001", name: "Tepung Lencana", category: "Tepung", stock: 8, minStock: 2, unit: "karung", purchasePrice: 190000, sellingPrice: 210000 },
    { id: "item-2", sku: "TP-002", name: "Tepung Segitiga Biru", category: "Tepung", stock: 4, minStock: 2, unit: "karung", purchasePrice: 225000, sellingPrice: 250000 },
    { id: "item-3", sku: "GL-001", name: "Gula GPM", category: "Gula", stock: 2, minStock: 1, unit: "karung", purchasePrice: 834000, sellingPrice: 900000 },
    { id: "item-4", sku: "GL-002", name: "Gula Mint", category: "Gula", stock: 2, minStock: 1, unit: "karung", purchasePrice: 375000, sellingPrice: 410000 },
    { id: "item-5", sku: "CP-001", name: "Cup Gelas (Starindo 12)", category: "Cup Gelas", stock: 57, minStock: 10, unit: "roll", purchasePrice: 12750, sellingPrice: 15000 },
    { id: "item-6", sku: "CP-002", name: "Cup Bold 200ml", category: "Cup Gelas", stock: 25, minStock: 5, unit: "roll", purchasePrice: 17500, sellingPrice: 20000 },
    { id: "item-7", sku: "CP-003", name: "Cup Puding 60ml", category: "Cup Gelas", stock: 30, minStock: 5, unit: "roll", purchasePrice: 5000, sellingPrice: 6500 },
    { id: "item-8", sku: "MG-001", name: "Margarin Amanda 18kg", category: "Margarin", stock: 18, minStock: 5, unit: "kg", purchasePrice: 18600, sellingPrice: 21000 },
    { id: "item-9", sku: "TP-003", name: "Tepung Panir", category: "Tepung", stock: 36, minStock: 5, unit: "kg", purchasePrice: 15800, sellingPrice: 18000 },
    { id: "item-10", sku: "TP-004", name: "Tepung Maizena", category: "Tepung", stock: 22, minStock: 5, unit: "kg", purchasePrice: 14200, sellingPrice: 16500 },
    { id: "item-11", sku: "SS-001", name: "Susu UHT", category: "Susu", stock: 35, minStock: 5, unit: "kotak", purchasePrice: 22500, sellingPrice: 26000 }
  ];

  const initialTransactions = [
    { id: "tx-1", date: "2026-07-02", type: "masuk", itemId: "item-1", itemName: "Tepung Lencana", qty: 8, price: 190000, total: 1520000, location: "Toko Sumber Harian", notes: "Restock Tepung Lencana (8 karung)" },
    { id: "tx-2", date: "2026-07-02", type: "masuk", itemId: "item-2", itemName: "Tepung Segitiga Biru", qty: 4, price: 225000, total: 900000, location: "Toko Sumber Harian", notes: "Restock Tepung Segitiga Biru (4 karung)" },
    { id: "tx-3", date: "2026-07-02", type: "masuk", itemId: "item-3", itemName: "Gula GPM", qty: 2, price: 834000, total: 1668000, location: "Toko Sumber Harian", notes: "Restock Gula GPM (2 karung)" },
    { id: "tx-4", date: "2026-07-02", type: "masuk", itemId: "item-4", itemName: "Gula Mint", qty: 2, price: 375000, total: 750000, location: "Toko Aan Guci", notes: "Restock Gula Mint (2 karung)" },
    { id: "tx-5", date: "2026-07-02", type: "masuk", itemId: "item-5", itemName: "Cup Gelas (Starindo 12)", qty: 57, price: 12750, total: 726750, location: "Toko Aroma", notes: "Restock Cup Gelas (Starindo 12) (57 roll)" },
    { id: "tx-6", date: "2026-07-02", type: "masuk", itemId: "item-6", itemName: "Cup Bold 200ml", qty: 25, price: 17500, total: 437500, location: "Toko Indah Plastik", notes: "Restock Cup Bold 200ml (25 roll)" },
    { id: "tx-7", date: "2026-07-02", type: "masuk", itemId: "item-7", itemName: "Cup Puding 60ml", qty: 30, price: 5000, total: 150000, location: "Toko Indah Plastik", notes: "Restock Cup Puding 60ml (30 roll)" },
    { id: "tx-8", date: "2026-07-02", type: "masuk", itemId: "item-8", itemName: "Margarin Amanda 18kg", qty: 18, price: 18600, total: 334800, location: "Toko Sumber Harian", notes: "Restock Margarin Amanda (18 kg)" },
    { id: "tx-9", date: "2026-07-02", type: "masuk", itemId: "item-9", itemName: "Tepung Panir", qty: 36, price: 15800, total: 568800, location: "Toko Aroma", notes: "Restock Tepung Panir (36 kg)" },
    { id: "tx-10", date: "2026-07-02", type: "masuk", itemId: "item-10", itemName: "Tepung Maizena", qty: 22, price: 14200, total: 312400, location: "Toko Aroma", notes: "Restock Tepung Maizena (22 kg)" },
    { id: "tx-11", date: "2026-07-02", type: "masuk", itemId: "item-11", itemName: "Susu UHT", qty: 35, price: 22500, total: 787500, location: "Toko MP Harian", notes: "Restock Susu UHT (35 kotak)" }
  ];

  const initialContacts = [
    { id: "contact-1", name: "Toko Sumber Harian", phone: "081234560001", address: "Pasar Harian Baru", type: "supplier" },
    { id: "contact-2", name: "Toko Aan Guci", phone: "081234560002", address: "Komp. Aan Guci", type: "supplier" },
    { id: "contact-3", name: "Toko Aroma", phone: "081234560003", address: "Komp. Aroma Indah", type: "supplier" },
    { id: "contact-4", name: "Toko Indah Plastik", phone: "081234560004", address: "Kawasan Plastik Terpadu", type: "supplier" },
    { id: "contact-5", name: "Toko MP Harian", phone: "081234560005", address: "Ruko MP Harian Baru", type: "supplier" }
  ];

  for (const item of initialItems) {
    await pool.query(
      'INSERT INTO items (id, sku, name, category, stock, minStock, unit, purchasePrice, sellingPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.sku, item.name, item.category, item.stock, item.minStock, item.unit, item.purchasePrice, item.sellingPrice]
    );

    await pool.query(
      'INSERT INTO purchase_history (id, itemId, date, price, location, qty) VALUES (?, ?, ?, ?, ?, ?)',
      [`ph-${item.id.split('-')[1]}`, item.id, '2026-07-02', item.purchasePrice, item.sku.startsWith('GL') && item.sku.endsWith('002') ? 'Toko Aan Guci' : (item.sku.startsWith('CP') && (item.sku.endsWith('002') || item.sku.endsWith('003')) ? 'Toko Indah Plastik' : (item.sku.startsWith('CP') || item.sku.startsWith('TP') && (item.sku.endsWith('003') || item.sku.endsWith('004')) ? 'Toko Aroma' : (item.sku.startsWith('SS') ? 'Toko MP Harian' : 'Toko Sumber Harian'))), item.stock]
    );
  }

  for (const tx of initialTransactions) {
    await pool.query(
      'INSERT INTO transactions (id, date, type, itemId, itemName, qty, price, total, location, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tx.id, tx.date, tx.type, tx.itemId, tx.itemName, tx.qty, tx.price, tx.total, tx.location, tx.notes]
    );
  }

  for (const contact of initialContacts) {
    await pool.query(
      'INSERT INTO contacts (id, name, phone, address, type) VALUES (?, ?, ?, ?, ?)',
      [contact.id, contact.name, contact.phone, contact.address, contact.type]
    );
  }
}

function generateToken(username) {
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  const data = `${username}:${expiry}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
  return Buffer.from(`${data}:${signature}`).toString('base64');
}

function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, expiryStr, signature] = decoded.split(':');
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) return null;
    const data = `${username}:${expiry}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    if (signature === expectedSignature) return { username };
  } catch (e) {}
  return null;
}

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Akses ditolak. Token tidak disediakan.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Akses ditolak. Format token salah.' });
  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: 'Akses ditolak. Token tidak valid.' });
  req.user = user;
  next();
};

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashedPassword]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }
    const token = generateToken(username);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

app.get('/api/verify-token', authenticate, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});

app.get('/api/items', authenticate, async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM items');
    for (const item of items) {
      const [history] = await pool.query('SELECT * FROM purchase_history WHERE itemId = ?', [item.id]);
      item.purchaseHistory = history;
    }
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Gagal mengambil data barang dari database." });
  }
});

app.post('/api/items', authenticate, async (req, res) => {
  try {
    const { sku, name, category, stock, minStock, unit, purchasePrice, sellingPrice, purchaseLocation } = req.body;
    if (!sku || !name || !unit) {
      return res.status(400).json({ error: "Kode barang (SKU), nama, dan satuan wajib diisi." });
    }
    const numStock = Number(stock) || 0;
    const numMinStock = Number(minStock) || 0;
    const numPurchase = Number(purchasePrice) || 0;
    const numSelling = Number(sellingPrice) || 0;
    if (numStock < 0 || numMinStock < 0 || numPurchase < 0 || numSelling < 0) {
      return res.status(400).json({ error: "Stok, stok minimum, harga beli, dan harga jual tidak boleh bernilai negatif." });
    }
    const itemId = `item-${Date.now()}`;
    await pool.query(
      'INSERT INTO items (id, sku, name, category, stock, minStock, unit, purchasePrice, sellingPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [itemId, sku, name, category, numStock, numMinStock, unit, numPurchase, numSelling]
    );
    if (numPurchase > 0) {
      const phId = `ph-${Date.now()}`;
      const today = new Date().toISOString().split('T')[0];
      await pool.query(
        'INSERT INTO purchase_history (id, itemId, date, price, location, qty) VALUES (?, ?, ?, ?, ?, ?)',
        [phId, itemId, today, numPurchase, purchaseLocation || 'Stok Awal', numStock]
      );
    }
    const [history] = await pool.query('SELECT * FROM purchase_history WHERE itemId = ?', [itemId]);
    res.json({
      id: itemId, sku, name, category, stock: numStock, minStock: numMinStock, unit, purchasePrice: numPurchase, sellingPrice: numSelling,
      purchaseHistory: history
    });
  } catch (error) {
    console.error("Error creating item:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Kode barang / SKU sudah terdaftar." });
    }
    res.status(500).json({ error: "Gagal menyimpan data barang baru ke database." });
  }
});

app.put('/api/items/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, stock, minStock, unit, purchasePrice, sellingPrice } = req.body;
    if (!name || !unit) {
      return res.status(400).json({ error: "Nama dan satuan wajib diisi." });
    }
    const numStock = Number(stock) || 0;
    const numMinStock = Number(minStock) || 0;
    const numPurchase = Number(purchasePrice) || 0;
    const numSelling = Number(sellingPrice) || 0;
    if (numStock < 0 || numMinStock < 0 || numPurchase < 0 || numSelling < 0) {
      return res.status(400).json({ error: "Stok, stok minimum, harga beli, dan harga jual tidak boleh bernilai negatif." });
    }
    await pool.query(
      'UPDATE items SET name = ?, category = ?, stock = ?, minStock = ?, unit = ?, purchasePrice = ?, sellingPrice = ? WHERE id = ?',
      [name, category, numStock, numMinStock, unit, numPurchase, numSelling, id]
    );
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Gagal memperbarui data barang." });
  }
});

app.delete('/api/items/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM items WHERE id = ?', [id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Gagal menghapus data barang." });
  }
});

app.get('/api/transactions', authenticate, async (req, res) => {
  try {
    const [transactions] = await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC');
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Gagal mengambil log transaksi." });
  }
});

app.post('/api/transactions/restock', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { itemId, qty, purchasePrice, location, notes, date } = req.body;
    const quantity = Number(qty);
    const price = Number(purchasePrice);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Kuantitas restock harus lebih besar dari 0." });
    }
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: "Harga beli tidak boleh negatif." });
    }
    if (!itemId || !location || !date) {
      return res.status(400).json({ error: "Barang, supplier/lokasi, dan tanggal wajib diisi." });
    }
    const total = quantity * price;
    const [itemRows] = await conn.query('SELECT * FROM items WHERE id = ?', [itemId]);
    if (itemRows.length === 0) throw new Error('Item tidak ditemukan.');
    const item = itemRows[0];
    const txId = `tx-${Date.now()}`;
    await conn.query(
      'INSERT INTO transactions (id, date, type, itemId, itemName, qty, price, total, location, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [txId, date, 'masuk', itemId, item.name, quantity, price, total, location, notes]
    );
    const newStock = Number(item.stock) + quantity;
    await conn.query(
      'UPDATE items SET stock = ?, purchasePrice = ? WHERE id = ?',
      [newStock, price, itemId]
    );
    const phId = `ph-${Date.now()}`;
    await conn.query(
      'INSERT INTO purchase_history (id, itemId, date, price, location, qty) VALUES (?, ?, ?, ?, ?, ?)',
      [phId, itemId, date, price, location, quantity]
    );
    await conn.commit();
    res.json({ message: 'Restock recorded successfully' });
  } catch (error) {
    await conn.rollback();
    console.error("Error at restock transaction:", error);
    res.status(500).json({ error: error.message || "Gagal mencatat restock barang." });
  } finally {
    conn.release();
  }
});

app.post('/api/transactions/sale', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let { cart, customer, paymentStatus, amountPaid, notes, date } = req.body;
    if (!cart && req.body.itemId) {
      cart = [{ itemId: req.body.itemId, qty: Number(req.body.qty), price: Number(req.body.sellingPrice) }];
    }
    const paid = Number(amountPaid || 0);
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Keranjang belanja kosong!" });
    }
    if (isNaN(paid) || paid < 0) {
      return res.status(400).json({ error: "Jumlah uang dibayar tidak boleh negatif." });
    }
    if (!date) {
      return res.status(400).json({ error: "Tanggal transaksi wajib diisi." });
    }
    const itemsToUpdate = [];
    for (const cartItem of cart) {
      if (isNaN(Number(cartItem.qty)) || Number(cartItem.qty) <= 0) {
        return res.status(400).json({ error: "Kuantitas pembelian harus lebih besar dari 0." });
      }
      if (isNaN(Number(cartItem.price)) || Number(cartItem.price) < 0) {
        return res.status(400).json({ error: "Harga jual barang tidak boleh negatif." });
      }
      const [itemRows] = await conn.query('SELECT * FROM items WHERE id = ?', [cartItem.itemId]);
      if (itemRows.length === 0) throw new Error('Barang tidak ditemukan.');
      const item = itemRows[0];
      if (item.stock < cartItem.qty) {
        return res.status(400).json({ error: `Stok tidak mencukupi untuk ${item.name}! Sisa stok: ${item.stock} ${item.unit}` });
      }
      itemsToUpdate.push({ ...item, qtyToDeduct: cartItem.qty });
    }
    for (const item of itemsToUpdate) {
      const newStock = item.stock - item.qtyToDeduct;
      await conn.query('UPDATE items SET stock = ? WHERE id = ?', [newStock, item.id]);
    }
    const invoiceId = `INV-${Date.now()}`;
    const timestamp = Date.now();
    const totalInvoiceVal = cart.reduce((sum, ci) => sum + ci.qty * ci.price, 0);
    const totalDebt = paymentStatus === "belum_lunas" ? Math.max(0, totalInvoiceVal - paid) : 0;
    const newTxs = [];
    for (let idx = 0; idx < cart.length; idx++) {
      const cartItem = cart[idx];
      const targetItem = itemsToUpdate.find((it) => it.id === cartItem.itemId);
      const itemTotal = cartItem.qty * cartItem.price;
      const shareRatio = totalInvoiceVal > 0 ? itemTotal / totalInvoiceVal : 0;
      const itemPaid = paymentStatus === "lunas" ? itemTotal : Math.round(paid * shareRatio);
      const itemDebt = paymentStatus === "lunas" ? 0 : Math.max(0, itemTotal - itemPaid);
      const txId = `tx-${timestamp}-${idx}`;
      await conn.query(
        'INSERT INTO transactions (id, invoiceId, date, type, itemId, itemName, qty, price, total, customer, paymentStatus, amountPaid, debt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [txId, invoiceId, date, 'keluar', cartItem.itemId, targetItem.name, cartItem.qty, cartItem.price, itemTotal, customer || 'Umum', paymentStatus, itemPaid, itemDebt, notes]
      );
      newTxs.push({ id: txId });
    }
    if (paymentStatus === "belum_lunas" && totalDebt > 0) {
      const debtId = `debt-${Date.now()}`;
      const paymentsJson = JSON.stringify([{ date, amount: paid }]);
      await conn.query(
        'INSERT INTO debts (id, invoiceId, txId, date, customer, total, paid, remaining, payments, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [debtId, invoiceId, newTxs[0].id, date, customer || 'Umum', totalInvoiceVal, paid, totalDebt, paymentsJson, 'belum_lunas']
      );
    }
    await conn.commit();
    res.json({ message: 'Transaksi penjualan berhasil disimpan', invoiceId });
  } catch (error) {
    await conn.rollback();
    console.error("Error at sale transaction:", error);
    res.status(500).json({ error: error.message || "Gagal mencatat transaksi penjualan." });
  } finally {
    conn.release();
  }
});

app.get('/api/debts', authenticate, async (req, res) => {
  try {
    const [debts] = await pool.query('SELECT * FROM debts');
    for (const debt of debts) {
      try {
        debt.payments = JSON.parse(debt.payments);
      } catch {
        debt.payments = [];
      }
    }
    res.json(debts);
  } catch (error) {
    console.error("Error fetching debts:", error);
    res.status(500).json({ error: "Gagal mengambil data piutang." });
  }
});

app.post('/api/debts/:id/pay', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const { amount, date, notes } = req.body;
    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      return res.status(400).json({ error: "Jumlah pembayaran cicilan harus lebih besar dari 0." });
    }
    const [debtRows] = await conn.query('SELECT * FROM debts WHERE id = ?', [id]);
    if (debtRows.length === 0) {
      return res.status(404).json({ error: 'Piutang tidak ditemukan' });
    }
    const debt = debtRows[0];
    if (payAmt > Number(debt.remaining)) {
      return res.status(400).json({ error: `Jumlah pembayaran melebihi sisa piutang! Sisa piutang adalah ${debt.remaining}.` });
    }
    let payments = [];
    try {
      payments = JSON.parse(debt.payments);
    } catch {
      payments = [];
    }
    const newPaid = Number(debt.paid) + payAmt;
    const newRemaining = Math.max(0, Number(debt.total) - newPaid);
    const newStatus = newRemaining <= 0 ? 'lunas' : 'belum_lunas';
    payments.push({ date, amount: payAmt });
    await conn.query(
      'UPDATE debts SET paid = ?, remaining = ?, status = ?, payments = ? WHERE id = ?',
      [newPaid, newRemaining, newStatus, JSON.stringify(payments), id]
    );
    const txId = `tx-pay-${Date.now()}`;
    await conn.query(
      'INSERT INTO transactions (id, date, type, itemName, qty, price, total, customer, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [txId, date, 'bayar_hutang', `Cicilan Piutang - ${debt.customer}`, 1, payAmt, payAmt, debt.customer, notes || 'Pembayaran cicilan piutang']
    );
    const [txRows] = await conn.query('SELECT * FROM transactions WHERE invoiceId = ? OR id = ?', [debt.invoiceId, debt.txId]);
    for (const tx of txRows) {
      const percentagePaid = newPaid / debt.total;
      const txAmountPaid = Math.round(tx.total * percentagePaid);
      const txDebt = Math.max(0, tx.total - txAmountPaid);
      await conn.query(
        'UPDATE transactions SET amountPaid = ?, debt = ?, paymentStatus = ? WHERE id = ?',
        [txAmountPaid, txDebt, newStatus, tx.id]
      );
    }
    await conn.commit();
    res.json({ message: 'Pembayaran cicilan piutang berhasil disimpan' });
  } catch (error) {
    await conn.rollback();
    console.error("Error at debt payment:", error);
    res.status(500).json({ error: "Gagal memproses pembayaran cicilan piutang." });
  } finally {
    conn.release();
  }
});

app.get('/api/contacts', authenticate, async (req, res) => {
  try {
    const [contacts] = await pool.query('SELECT * FROM contacts');
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Gagal mengambil data kontak." });
  }
});

app.post('/api/contacts', authenticate, async (req, res) => {
  try {
    const { name, phone, address, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "Nama dan tipe kontak wajib diisi." });
    }
    const contactId = `contact-${Date.now()}`;
    await pool.query(
      'INSERT INTO contacts (id, name, phone, address, type) VALUES (?, ?, ?, ?, ?)',
      [contactId, name, phone || '', address || '', type]
    );
    res.json({ id: contactId, name, phone, address, type });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Gagal menyimpan data kontak." });
  }
});

app.put('/api/contacts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "Nama dan tipe kontak wajib diisi." });
    }
    await pool.query(
      'UPDATE contacts SET name = ?, phone = ?, address = ?, type = ? WHERE id = ?',
      [name, phone || '', address || '', type, id]
    );
    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Gagal memperbarui data kontak." });
  }
});

app.delete('/api/contacts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Gagal menghapus data kontak." });
  }
});

app.post('/api/reset', authenticate, async (req, res) => {
  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('DROP TABLE IF EXISTS purchase_history');
    await pool.query('DROP TABLE IF EXISTS items');
    await pool.query('DROP TABLE IF EXISTS transactions');
    await pool.query('DROP TABLE IF EXISTS contacts');
    await pool.query('DROP TABLE IF EXISTS debts');
    await pool.query('DROP TABLE IF EXISTS users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    await initDB();
    res.json({ message: 'Database reset successfully' });
  } catch (error) {
    console.error("Error resetting database:", error);
    res.status(500).json({ error: "Gagal mereset database." });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (!process.env.VERCEL) {
  initDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

export default app;
