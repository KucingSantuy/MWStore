export const initialItems = [
  {
    id: "item-1",
    sku: "TP-001",
    name: "Tepung Lencana",
    category: "Tepung",
    stock: 8,
    minStock: 2,
    unit: "karung",
    purchasePrice: 190000,
    sellingPrice: 210000,
    purchaseHistory: [
      { id: "ph-1", date: "2026-07-02", price: 190000, location: "Toko Sumber Harian", qty: 8 }
    ]
  },
  {
    id: "item-2",
    sku: "TP-002",
    name: "Tepung Segitiga Biru",
    category: "Tepung",
    stock: 4,
    minStock: 2,
    unit: "karung",
    purchasePrice: 225000,
    sellingPrice: 250000,
    purchaseHistory: [
      { id: "ph-2", date: "2026-07-02", price: 225000, location: "Toko Sumber Harian", qty: 4 }
    ]
  },
  {
    id: "item-3",
    sku: "GL-001",
    name: "Gula GPM",
    category: "Gula",
    stock: 2,
    minStock: 1,
    unit: "karung",
    purchasePrice: 834000,
    sellingPrice: 900000,
    purchaseHistory: [
      { id: "ph-3", date: "2026-07-02", price: 834000, location: "Toko Sumber Harian", qty: 2 }
    ]
  },
  {
    id: "item-4",
    sku: "GL-002",
    name: "Gula Mint",
    category: "Gula",
    stock: 2,
    minStock: 1,
    unit: "karung",
    purchasePrice: 375000,
    sellingPrice: 410000,
    purchaseHistory: [
      { id: "ph-4", date: "2026-07-02", price: 375000, location: "Toko Aan Guci", qty: 2 }
    ]
  },
  {
    id: "item-5",
    sku: "CP-001",
    name: "Cup Gelas (Starindo 12)",
    category: "Cup Gelas",
    stock: 57,
    minStock: 10,
    unit: "roll",
    purchasePrice: 12750,
    sellingPrice: 15000,
    purchaseHistory: [
      { id: "ph-5", date: "2026-07-02", price: 12750, location: "Toko Aroma", qty: 57 }
    ]
  },
  {
    id: "item-6",
    sku: "CP-002",
    name: "Cup Bold 200ml",
    category: "Cup Gelas",
    stock: 25,
    minStock: 5,
    unit: "roll",
    purchasePrice: 17500,
    sellingPrice: 20000,
    purchaseHistory: [
      { id: "ph-6", date: "2026-07-02", price: 17500, location: "Toko Indah Plastik", qty: 25 }
    ]
  },
  {
    id: "item-7",
    sku: "CP-003",
    name: "Cup Puding 60ml",
    category: "Cup Gelas",
    stock: 30,
    minStock: 5,
    unit: "roll",
    purchasePrice: 5000,
    sellingPrice: 6500,
    purchaseHistory: [
      { id: "ph-7", date: "2026-07-02", price: 5000, location: "Toko Indah Plastik", qty: 30 }
    ]
  },
  {
    id: "item-8",
    sku: "MG-001",
    name: "Margarin Amanda 18kg",
    category: "Margarin",
    stock: 18,
    minStock: 5,
    unit: "kg",
    purchasePrice: 18600,
    sellingPrice: 21000,
    purchaseHistory: [
      { id: "ph-8", date: "2026-07-02", price: 18600, location: "Toko Sumber Harian", qty: 18 }
    ]
  },
  {
    id: "item-9",
    sku: "TP-003",
    name: "Tepung Panir",
    category: "Tepung",
    stock: 36,
    minStock: 5,
    unit: "kg",
    purchasePrice: 15800,
    sellingPrice: 18000,
    purchaseHistory: [
      { id: "ph-9", date: "2026-07-02", price: 15800, location: "Toko Aroma", qty: 36 }
    ]
  },
  {
    id: "item-10",
    sku: "TP-004",
    name: "Tepung Maizena",
    category: "Tepung",
    stock: 22,
    minStock: 5,
    unit: "kg",
    purchasePrice: 14200,
    sellingPrice: 16500,
    purchaseHistory: [
      { id: "ph-10", date: "2026-07-02", price: 14200, location: "Toko Aroma", qty: 22 }
    ]
  },
  {
    id: "item-11",
    sku: "SS-001",
    name: "Susu UHT",
    category: "Susu",
    stock: 35,
    minStock: 5,
    unit: "kotak",
    purchasePrice: 22500,
    sellingPrice: 26000,
    purchaseHistory: [
      { id: "ph-11", date: "2026-07-02", price: 22500, location: "Toko MP Harian", qty: 35 }
    ]
  }
];

export const initialTransactions = [
  {
    id: "tx-1",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-1",
    itemName: "Tepung Lencana",
    qty: 8,
    price: 190000,
    total: 1520000,
    location: "Toko Sumber Harian",
    notes: "Restock Tepung Lencana (8 karung)"
  },
  {
    id: "tx-2",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-2",
    itemName: "Tepung Segitiga Biru",
    qty: 4,
    price: 225000,
    total: 900000,
    location: "Toko Sumber Harian",
    notes: "Restock Tepung Segitiga Biru (4 karung)"
  },
  {
    id: "tx-3",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-3",
    itemName: "Gula GPM",
    qty: 2,
    price: 834000,
    total: 1668000,
    location: "Toko Sumber Harian",
    notes: "Restock Gula GPM (2 karung)"
  },
  {
    id: "tx-4",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-4",
    itemName: "Gula Mint",
    qty: 2,
    price: 375000,
    total: 750000,
    location: "Toko Aan Guci",
    notes: "Restock Gula Mint (2 karung)"
  },
  {
    id: "tx-5",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-5",
    itemName: "Cup Gelas (Starindo 12)",
    qty: 57,
    price: 12750,
    total: 726750,
    location: "Toko Aroma",
    notes: "Restock Cup Gelas (Starindo 12) (57 roll)"
  },
  {
    id: "tx-6",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-6",
    itemName: "Cup Bold 200ml",
    qty: 25,
    price: 17500,
    total: 437500,
    location: "Toko Indah Plastik",
    notes: "Restock Cup Bold 200ml (25 roll)"
  },
  {
    id: "tx-7",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-7",
    itemName: "Cup Puding 60ml",
    qty: 30,
    price: 5000,
    total: 150000,
    location: "Toko Indah Plastik",
    notes: "Restock Cup Puding 60ml (30 roll)"
  },
  {
    id: "tx-8",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-8",
    itemName: "Margarin Amanda 18kg",
    qty: 18,
    price: 18600,
    total: 334800,
    location: "Toko Sumber Harian",
    notes: "Restock Margarin Amanda (18 kg)"
  },
  {
    id: "tx-9",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-9",
    itemName: "Tepung Panir",
    qty: 36,
    price: 15800,
    total: 568800,
    location: "Toko Aroma",
    notes: "Restock Tepung Panir (36 kg)"
  },
  {
    id: "tx-10",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-10",
    itemName: "Tepung Maizena",
    qty: 22,
    price: 14200,
    total: 312400,
    location: "Toko Aroma",
    notes: "Restock Tepung Maizena (22 kg)"
  },
  {
    id: "tx-11",
    date: "2026-07-02",
    type: "masuk",
    itemId: "item-11",
    itemName: "Susu UHT",
    qty: 35,
    price: 22500,
    total: 787500,
    location: "Toko MP Harian",
    notes: "Restock Susu UHT (35 kotak)"
  }
];

export const initialDebts = [];

export const initialContacts = [
  {
    id: "contact-1",
    name: "Toko Sumber Harian",
    phone: "081234560001",
    address: "Pasar Harian Baru",
    type: "supplier"
  },
  {
    id: "contact-2",
    name: "Toko Aan Guci",
    phone: "081234560002",
    address: "Komp. Aan Guci",
    type: "supplier"
  },
  {
    id: "contact-3",
    name: "Toko Aroma",
    phone: "081234560003",
    address: "Komp. Aroma Indah",
    type: "supplier"
  },
  {
    id: "contact-4",
    name: "Toko Indah Plastik",
    phone: "081234560004",
    address: "Kawasan Plastik Terpadu",
    type: "supplier"
  },
  {
    id: "contact-5",
    name: "Toko MP Harian",
    phone: "081234560005",
    address: "Ruko MP Harian Baru",
    type: "supplier"
  }
];
