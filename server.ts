import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { Product, Order, UserProfile } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// Ensure data directory and files exist
async function initData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    for (const file of [PRODUCTS_FILE, ORDERS_FILE, USERS_FILE, SETTINGS_FILE]) {
      try {
        await fs.access(file);
      } catch {
        const defaultData = file === SETTINGS_FILE ? {} : [];
        await fs.writeFile(file, JSON.stringify(defaultData));
      }
    }
  } catch (err) {
    console.error("Failed to initialize data:", err);
  }
}

async function readData<T>(file: string): Promise<T[]> {
  const content = await fs.readFile(file, "utf-8");
  return JSON.parse(content);
}

async function writeData<T>(file: string, data: T[]) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

async function startServer() {
  await initData();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await readData<Product>(PRODUCTS_FILE);
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const products = await readData<Product>(PRODUCTS_FILE);
    const product = products.find(p => p.id === req.params.id);
    product ? res.json(product) : res.status(404).json({ error: "Not found" });
  });

  app.post("/api/products", async (req, res) => {
    const products = await readData<Product>(PRODUCTS_FILE);
    const newProduct = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
    products.push(newProduct);
    await writeData(PRODUCTS_FILE, products);
    res.status(201).json(newProduct);
  });

  app.put("/api/products/:id", async (req, res) => {
    const products = await readData<Product>(PRODUCTS_FILE);
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    products[index] = { ...products[index], ...req.body };
    await writeData(PRODUCTS_FILE, products);
    res.json(products[index]);
  });

  app.delete("/api/products/:id", async (req, res) => {
    let products = await readData<Product>(PRODUCTS_FILE);
    products = products.filter(p => p.id !== req.params.id);
    await writeData(PRODUCTS_FILE, products);
    res.status(204).send();
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    const orders = await readData<Order>(ORDERS_FILE);
    const { userId } = req.query;
    if (userId) {
      return res.json(orders.filter(o => o.userId === userId));
    }
    res.json(orders);
  });

  app.get("/api/orders/:id", async (req, res) => {
    const orders = await readData<Order>(ORDERS_FILE);
    const order = orders.find(o => o.id === req.params.id);
    order ? res.json(order) : res.status(404).json({ error: "Not found" });
  });

  app.post("/api/orders", async (req, res) => {
    const orders = await readData<Order>(ORDERS_FILE);
    const newOrder = { 
      ...req.body, 
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString() 
    };
    orders.push(newOrder);
    await writeData(ORDERS_FILE, orders);
    res.status(201).json(newOrder);
  });

  app.put("/api/orders/:id", async (req, res) => {
    const orders = await readData<Order>(ORDERS_FILE);
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    orders[index] = { ...orders[index], ...req.body };
    await writeData(ORDERS_FILE, orders);
    res.json(orders[index]);
  });

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    const { username, password, email, displayName } = req.body;
    const users = await readData<any>(USERS_FILE);
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = {
      uid: Date.now().toString(),
      username,
      password, // In a real app, hash this!
      email,
      displayName,
      photoURL: `https://ui-avatars.com/api/?name=${displayName}`,
      role: email === 'kalam172010@gmail.com' ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);
    
    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const users = await readData<any>(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Settings
  app.get("/api/settings/:id", async (req, res) => {
    const settings = await fs.readFile(SETTINGS_FILE, "utf-8").then(JSON.parse);
    res.json(settings[req.params.id] || {});
  });

  app.post("/api/settings/:id", async (req, res) => {
    const settings = await fs.readFile(SETTINGS_FILE, "utf-8").then(JSON.parse);
    settings[req.params.id] = req.body;
    await writeData(SETTINGS_FILE, settings);
    res.json(settings[req.params.id]);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
