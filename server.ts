import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const db = new Database("landlordhub.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS landlords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    landlord_id INTEGER,
    name TEXT,
    address TEXT,
    type TEXT,
    sqft INTEGER,
    rooms INTEGER,
    rent_price REAL,
    deposit_amount REAL,
    lease_terms TEXT,
    FOREIGN KEY(landlord_id) REFERENCES landlords(id)
  );

  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    unit_number TEXT,
    rent_price REAL,
    status TEXT DEFAULT 'vacant',
    FOREIGN KEY(property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER,
    name TEXT,
    email TEXT,
    phone TEXT,
    lease_start TEXT,
    lease_end TEXT,
    rent_due_day INTEGER,
    FOREIGN KEY(unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    amount REAL,
    payment_date TEXT,
    status TEXT DEFAULT 'paid', -- 'paid', 'pending', 'late'
    period_month INTEGER,
    period_year INTEGER,
    late_fee REAL DEFAULT 0,
    receipt_url TEXT,
    FOREIGN KEY(tenant_id) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_type TEXT, -- 'landlord' or 'tenant'
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS late_fee_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    grace_period_days INTEGER DEFAULT 5,
    flat_fee REAL DEFAULT 50,
    daily_fee REAL DEFAULT 5,
    FOREIGN KEY(property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT, -- 'property' or 'tenant'
    entity_id INTEGER,
    file_name TEXT,
    file_path TEXT,
    mime_type TEXT,
    summary TEXT,
    extracted_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    category TEXT, -- 'Utilities', 'Maintenance', 'Taxes', 'Insurance', 'Mortgage', 'Management', 'Other'
    amount REAL,
    date TEXT,
    description TEXT,
    FOREIGN KEY(property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    unit_id INTEGER,
    tenant_id INTEGER,
    title TEXT,
    description TEXT,
    priority TEXT, -- Low, Medium, High, Emergency
    status TEXT DEFAULT 'Pending', -- Pending, Approved, In Progress, Completed, Cancelled
    vendor_id INTEGER,
    images TEXT, -- JSON array of image URLs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(property_id) REFERENCES properties(id),
    FOREIGN KEY(unit_id) REFERENCES units(id),
    FOREIGN KEY(tenant_id) REFERENCES tenants(id),
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
  );

  CREATE TABLE IF NOT EXISTS scheduled_maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    title TEXT,
    description TEXT,
    scheduled_date TEXT,
    frequency TEXT, -- One-time, Monthly, Quarterly, Annually
    vendor_id INTEGER,
    status TEXT DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
    FOREIGN KEY(property_id) REFERENCES properties(id),
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
  );

  CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    type TEXT, -- 'rent_reminder', 'maintenance_update', 'general'
    content TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent',
    FOREIGN KEY(tenant_id) REFERENCES tenants(id)
  );
`);

// --- Seeding Logic ---
const propertiesCount = db.prepare("SELECT COUNT(*) as count FROM properties").get() as { count: number };

if (propertiesCount.count === 0) {
  console.log("Seeding database with mock data...");
  
  const insertProperty = db.prepare("INSERT INTO properties (landlord_id, name, address, type, sqft, rooms, rent_price, deposit_amount, lease_terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insertUnit = db.prepare("INSERT INTO units (property_id, unit_number, rent_price, status) VALUES (?, ?, ?, ?)");
  const insertTenant = db.prepare("INSERT INTO tenants (unit_id, name, email, phone, lease_start, lease_end, rent_due_day) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertPayment = db.prepare("INSERT INTO payments (tenant_id, amount, payment_date, status, period_month, period_year, late_fee) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertVendor = db.prepare("INSERT INTO vendors (name, category, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?)");
  const insertMaintenance = db.prepare("INSERT INTO maintenance_requests (property_id, unit_id, tenant_id, title, description, priority, status, vendor_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insertScheduled = db.prepare("INSERT INTO scheduled_maintenance (property_id, title, description, scheduled_date, frequency, vendor_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertExpense = db.prepare("INSERT INTO expenses (property_id, category, amount, date, description) VALUES (?, ?, ?, ?, ?)");
  const insertCommunication = db.prepare("INSERT INTO communications (tenant_id, type, content, sent_at, status) VALUES (?, ?, ?, ?, ?)");

  db.transaction(() => {
    // Landlord
    db.prepare("INSERT OR IGNORE INTO landlords (id, email, name) VALUES (1, 'john@example.com', 'John Doe')").run();

    // Properties
    const p1 = insertProperty.run(1, 'Sunset Apartments', '123 Sunset Blvd, Los Angeles, CA', 'Apartment', 12000, 20, 12600, 0, '12 months').lastInsertRowid;
    const p2 = insertProperty.run(1, 'Maple Residence', '456 Maple Ave, Portland, OR', 'Single Family', 2500, 4, 3200, 3200, '12 months').lastInsertRowid;
    const p3 = insertProperty.run(1, 'Oakwood Duplex', '789 Oak St, Austin, TX', 'Duplex', 3000, 6, 3600, 0, '12 months').lastInsertRowid;

    // Vendors
    const v1 = insertVendor.run('Joe the Plumber', 'Plumbing', '555-1001', 'joe@plumbing.com', '123 Pipe Ln', 'Reliable, good rates').lastInsertRowid;
    const v2 = insertVendor.run('Bright Sparks', 'Electrician', '555-1002', 'sparks@electric.com', '456 Wire Rd', 'Expensive but available 24/7').lastInsertRowid;
    const v3 = insertVendor.run('Green Thumb Landscaping', 'Landscaping', '555-1003', 'green@thumb.com', '789 Grass Way', 'Weekly service').lastInsertRowid;

    // --- Sunset Apartments (P1) ---
    // 4 Occupied Units
    for (let i = 1; i <= 4; i++) {
      const u = insertUnit.run(p1, `10${i}`, 2500, 'occupied').lastInsertRowid;
      const t = insertTenant.run(u, `Tenant ${i}`, `tenant${i}@example.com`, `555-010${i}`, '2025-01-01', '2025-12-31', 1).lastInsertRowid;
      
      // Payments for last 3 months
      for (let m = 0; m < 3; m++) {
        const date = new Date();
        date.setMonth(date.getMonth() - m);
        date.setDate(1); // 1st of the month
        insertPayment.run(t, 2500, date.toISOString().split('T')[0], 'paid', date.getMonth() + 1, date.getFullYear(), 0);
      }
    }
    // 1 Vacant Unit
    insertUnit.run(p1, '105', 2600, 'vacant');

    // --- Maple Residence (P2) ---
    const u2 = insertUnit.run(p2, 'Main', 3200, 'occupied').lastInsertRowid;
    const t2 = insertTenant.run(u2, 'Sarah Connor', 'sarah@example.com', '555-0201', '2024-06-01', '2026-06-01', 5).lastInsertRowid;
    // Late payment history
    insertPayment.run(t2, 3200, '2025-12-05', 'late', 12, 2025, 50);
    insertPayment.run(t2, 3200, '2026-01-05', 'paid', 1, 2026, 0);

    // --- Oakwood Duplex (P3) ---
    const u3a = insertUnit.run(p3, 'A', 1800, 'occupied').lastInsertRowid;
    const t3a = insertTenant.run(u3a, 'Mike Ross', 'mike@example.com', '555-0301', '2025-03-01', '2026-02-28', 1).lastInsertRowid;
    const u3b = insertUnit.run(p3, 'B', 1800, 'vacant').lastInsertRowid;

    // --- Maintenance Requests ---
    insertMaintenance.run(p1, null, null, 'Leaky Faucet in Lobby', 'The faucet in the main lobby restroom is dripping.', 'Low', 'Pending', v1, new Date().toISOString());
    insertMaintenance.run(p2, u2, t2, 'Broken HVAC', 'Heating is not working properly, making weird noises.', 'Emergency', 'In Progress', v2, new Date().toISOString());
    insertMaintenance.run(p3, u3a, t3a, 'Window Stuck', 'Bedroom window wont close all the way.', 'Medium', 'Completed', null, new Date(Date.now() - 86400000 * 5).toISOString());

    // --- Scheduled Maintenance ---
    insertScheduled.run(p1, 'Quarterly Pest Control', 'Routine spray for common pests.', '2026-04-01', 'Quarterly', null, 'Scheduled');
    insertScheduled.run(p2, 'HVAC Filter Change', 'Replace air filters.', '2026-03-15', 'Quarterly', v2, 'Scheduled');
    insertScheduled.run(p3, 'Lawn Mowing', 'Weekly lawn service.', '2026-03-05', 'One-time', v3, 'Scheduled');

    // --- Expenses ---
    const today = new Date();
    insertExpense.run(p1, 'Utilities', 450.00, new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0], 'Water Bill');
    insertExpense.run(p1, 'Management', 200.00, new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0], 'Monthly Management Fee');
    insertExpense.run(p2, 'Maintenance', 150.00, new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0], 'Minor repairs');
    insertExpense.run(p3, 'Insurance', 1200.00, new Date(today.getFullYear(), 0, 15).toISOString().split('T')[0], 'Annual Premium');

    // --- Communications ---
    insertCommunication.run(t2, 'rent_reminder', 'Hi Sarah, just a friendly reminder that rent is due on the 5th.', new Date(Date.now() - 86400000 * 2).toISOString(), 'sent');
    insertCommunication.run(t3a, 'general', 'Welcome to Oakwood Duplex! Let us know if you need anything.', new Date(Date.now() - 86400000 * 10).toISOString(), 'sent');

  })();
  console.log("Database seeded successfully!");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Multer setup for file uploads
  const upload = multer({ dest: 'uploads/' });

  // Gemini setup
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY, API_KEY, or GOOGLE_API_KEY is not set in the environment.");
  } else {
    console.log("API Key found:", apiKey.substring(0, 5) + "...");
  }
  const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

  // API Routes
  app.get("/api/properties", (req, res) => {
    const properties = db.prepare(`
      SELECT p.*, 
      COALESCE((SELECT SUM(rent_price) FROM units WHERE property_id = p.id AND status = 'occupied'), 0) as rent_price
      FROM properties p
    `).all();
    res.json(properties);
  });

  app.post("/api/properties", (req, res) => {
    console.log("Creating property:", req.body);
    const { landlord_id, name, address, type, sqft, rooms, rent_price, deposit_amount, lease_terms } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO properties (landlord_id, name, address, type, sqft, rooms, rent_price, deposit_amount, lease_terms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(landlord_id || 1, name, address, type, sqft, rooms, rent_price, deposit_amount, lease_terms);
      console.log("Property created with ID:", info.lastInsertRowid);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.get("/api/properties/:id/units", (req, res) => {
    const units = db.prepare("SELECT * FROM units WHERE property_id = ?").all(req.params.id);
    res.json(units);
  });

  app.post("/api/units", (req, res) => {
    const { property_id, unit_number, rent_price, status } = req.body;
    const info = db.prepare(`
      INSERT INTO units (property_id, unit_number, rent_price, status)
      VALUES (?, ?, ?, ?)
    `).run(property_id, unit_number, rent_price, status || 'vacant');
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/units/:id/tenant", (req, res) => {
    const tenant = db.prepare("SELECT * FROM tenants WHERE unit_id = ?").get(req.params.id);
    res.json(tenant || null);
  });

  app.post("/api/tenants", (req, res) => {
    const { unit_id, name, email, phone, lease_start, lease_end, rent_due_day } = req.body;
    const info = db.prepare(`
      INSERT INTO tenants (unit_id, name, email, phone, lease_start, lease_end, rent_due_day)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(unit_id, name, email, phone, lease_start, lease_end, rent_due_day);
    
    // Update unit status
    db.prepare("UPDATE units SET status = 'occupied' WHERE id = ?").run(unit_id);
    
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/tenants/:id", (req, res) => {
    const { name, email, phone, lease_start, lease_end, rent_due_day } = req.body;
    db.prepare(`
      UPDATE tenants 
      SET name = ?, email = ?, phone = ?, lease_start = ?, lease_end = ?, rent_due_day = ?
      WHERE id = ?
    `).run(name, email, phone, lease_start, lease_end, rent_due_day, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/tenants/:id", (req, res) => {
    const tenant = db.prepare("SELECT unit_id FROM tenants WHERE id = ?").get(req.params.id) as { unit_id: number };
    if (tenant) {
      db.prepare("DELETE FROM tenants WHERE id = ?").run(req.params.id);
      db.prepare("UPDATE units SET status = 'vacant' WHERE id = ?").run(tenant.unit_id);
    }
    res.json({ success: true });
  });

  app.get("/api/tenants/:id/payments", (req, res) => {
    const payments = db.prepare("SELECT * FROM payments WHERE tenant_id = ? ORDER BY payment_date DESC").all(req.params.id);
    res.json(payments);
  });

  app.post("/api/payments", (req, res) => {
    const { tenant_id, amount, payment_date, period_month, period_year, late_fee } = req.body;
    const info = db.prepare(`
      INSERT INTO payments (tenant_id, amount, payment_date, period_month, period_year, late_fee)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tenant_id, amount, payment_date, period_month, period_year, late_fee || 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/messages/:tenantId", (req, res) => {
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_type = 'landlord' AND receiver_id = ?) 
      OR (sender_type = 'tenant' AND sender_id = ?)
      ORDER BY created_at ASC
    `).all(req.params.tenantId, req.params.tenantId);
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { sender_type, sender_id, receiver_id, content } = req.body;
    const info = db.prepare(`
      INSERT INTO messages (sender_type, sender_id, receiver_id, content)
      VALUES (?, ?, ?, ?)
    `).run(sender_type, sender_id, receiver_id, content);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/upcoming-rents", (req, res) => {
    const rents = db.prepare(`
      SELECT 
        t.id, t.name, t.rent_due_day, 
        u.unit_number, u.rent_price,
        p.name as property_name
      FROM tenants t
      JOIN units u ON t.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      ORDER BY t.rent_due_day ASC
    `).all();
    res.json(rents);
  });

  app.get("/api/properties/:id/expenses", (req, res) => {
    const expenses = db.prepare("SELECT * FROM expenses WHERE property_id = ? ORDER BY date DESC").all(req.params.id);
    res.json(expenses);
  });

  app.post("/api/expenses", (req, res) => {
    const { property_id, category, amount, date, description } = req.body;
    const info = db.prepare(`
      INSERT INTO expenses (property_id, category, amount, date, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(property_id, category, amount, date, description);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/properties/:id/late-fee-rules", (req, res) => {
    const rules = db.prepare("SELECT * FROM late_fee_rules WHERE property_id = ?").get(req.params.id);
    res.json(rules || { grace_period_days: 5, flat_fee: 50, daily_fee: 5 });
  });

  app.post("/api/properties/:id/late-fee-rules", (req, res) => {
    const { grace_period_days, flat_fee, daily_fee } = req.body;
    const existing = db.prepare("SELECT id FROM late_fee_rules WHERE property_id = ?").get(req.params.id);
    if (existing) {
      db.prepare("UPDATE late_fee_rules SET grace_period_days = ?, flat_fee = ?, daily_fee = ? WHERE property_id = ?")
        .run(grace_period_days, flat_fee, daily_fee, req.params.id);
    } else {
      db.prepare("INSERT INTO late_fee_rules (property_id, grace_period_days, flat_fee, daily_fee) VALUES (?, ?, ?, ?)")
        .run(req.params.id, grace_period_days, flat_fee, daily_fee);
    }
    res.json({ success: true });
  });

  app.post("/api/upload", upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    
    const { entity_type, entity_id } = req.body;
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    try {
      // AI analysis with Gemini
      const fileData = fs.readFileSync(filePath).toString("base64");
      
      const prompt = `Analyze this document (${req.file.originalname}). 
      If it's a lease, extract rent, dates, and names. 
      If it's an ID, extract name and expiry. 
      Provide a concise summary and structured JSON data.`;

      const result = await genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { data: fileData, mimeType } }
          ]
        }]
      });

      const text = result.text;
      
      // Store in DB
      const info = db.prepare(`
        INSERT INTO documents (entity_type, entity_id, file_name, file_path, mime_type, summary)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(entity_type, entity_id, req.file.originalname, filePath, mimeType, text);

      res.json({ id: info.lastInsertRowid, summary: text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to process document with AI" });
    }
  });

  app.get("/api/documents/:type/:id", (req, res) => {
    const docs = db.prepare("SELECT * FROM documents WHERE entity_type = ? AND entity_id = ?").all(req.params.type, req.params.id);
    res.json(docs);
  });

  app.get("/api/ai/market-news", async (req, res) => {
    try {
      // Get property locations to personalize news
      const properties = db.prepare("SELECT address FROM properties").all() as { address: string }[];
      const locations = properties.map(p => p.address).join(", ");
      
      let prompt = "Provide a concise summary of the current real estate market trends for landlords.";
      if (locations) {
        prompt += ` Include specific current average rent rates and trends for the cities in these locations: ${locations}.`;
      } else {
        prompt += " Include current average rent rates for major US cities.";
      }

      const result = await genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      res.json({ text: result.text });
    } catch (error) {
      console.error("Market News Error:", error);
      res.json({ 
        text: `### Market Update (Unavailable)\n\nWe couldn't fetch the latest real-time market data at this moment.\n\n**Possible reasons:**\n- API Key configuration issue\n- Network connectivity\n\n**General Market Context:**\nReal estate markets vary significantly by location. Please check back later for personalized insights.` 
      });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      // 1. Gather Context
      const tenants = db.prepare(`
        SELECT t.id, t.name, t.email, t.phone, u.unit_number, p.name as property_name,
        (SELECT SUM(amount) FROM payments WHERE tenant_id = t.id AND status = 'pending') as pending_amount,
        (SELECT COUNT(*) FROM payments WHERE tenant_id = t.id AND status = 'late') as late_payments
        FROM tenants t
        LEFT JOIN units u ON t.unit_id = u.id
        LEFT JOIN properties p ON u.property_id = p.id
      `).all();

      const maintenance = db.prepare(`
        SELECT m.id, m.title, m.status, t.name as tenant_name
        FROM maintenance_requests m
        JOIN tenants t ON m.tenant_id = t.id
        WHERE m.status != 'Completed'
      `).all();

      const context = {
        current_date: new Date().toISOString().split('T')[0],
        tenants,
        maintenance_requests: maintenance
      };

      // 2. Prompt Gemini
      const prompt = `
        You are an AI property management assistant.
        User Request: "${message}"
        
        Context:
        ${JSON.stringify(context, null, 2)}
        
        Instructions:
        1. Analyze the user's request.
        2. If they want to send messages (e.g., rent reminders, maintenance updates), generate the message content for each relevant tenant.
        3. If it's a general question, answer it based on the context.
        
        Return a JSON object with this structure:
        {
          "reply": "Text response to the user summarizing what you did or answering their question.",
          "actions": [
            {
              "type": "send_message",
              "tenant_id": 123,
              "message_type": "rent_reminder" | "maintenance_update" | "general",
              "content": "The actual message text to send to the tenant."
            }
          ]
        }
        
        Only return valid JSON. Do not include markdown formatting.
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json"
        }
      });
      
      const responseText = result.text || "{}";
      const aiResponse = JSON.parse(responseText);

      // 3. Execute Actions
      if (aiResponse.actions && aiResponse.actions.length > 0) {
        const stmt = db.prepare("INSERT INTO communications (tenant_id, type, content) VALUES (?, ?, ?)");
        for (const action of aiResponse.actions) {
          if (action.type === 'send_message') {
            stmt.run(action.tenant_id, action.message_type, action.content);
          }
        }
      }

      res.json(aiResponse);

    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.get("/api/communications", (req, res) => {
    const comms = db.prepare(`
      SELECT c.*, t.name as tenant_name 
      FROM communications c
      JOIN tenants t ON c.tenant_id = t.id
      ORDER BY c.sent_at DESC
    `).all();
    res.json(comms);
  });

  // --- Financial Endpoints ---

  app.get("/api/financials/summary", (req, res) => {
    const currentYear = new Date().getFullYear();
    
    const income = db.prepare(`
      SELECT SUM(amount) as total 
      FROM payments 
      WHERE status = 'paid' AND period_year = ?
    `).get(currentYear) as { total: number };

    const expenses = db.prepare(`
      SELECT SUM(amount) as total 
      FROM expenses 
      WHERE strftime('%Y', date) = ?
    `).get(String(currentYear)) as { total: number };

    res.json({
      income: income.total || 0,
      expenses: expenses.total || 0,
      net_profit: (income.total || 0) - (expenses.total || 0)
    });
  });

  app.get("/api/financials/monthly", (req, res) => {
    const currentYear = new Date().getFullYear();
    
    const income = db.prepare(`
      SELECT period_month as month, SUM(amount) as total 
      FROM payments 
      WHERE status = 'paid' AND period_year = ?
      GROUP BY period_month
    `).all(currentYear) as { month: number, total: number }[];

    const expenses = db.prepare(`
      SELECT strftime('%m', date) as month, SUM(amount) as total 
      FROM expenses 
      WHERE strftime('%Y', date) = ?
      GROUP BY month
    `).all(String(currentYear)) as { month: string, total: number }[];

    // Merge data for 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const inc = income.find(d => d.month === monthNum)?.total || 0;
      const exp = expenses.find(d => parseInt(d.month) === monthNum)?.total || 0;
      return {
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        income: inc,
        expenses: exp,
        profit: inc - exp
      };
    });

    res.json(monthlyData);
  });

  app.get("/api/financials/expenses-by-category", (req, res) => {
    const currentYear = new Date().getFullYear();
    const expenses = db.prepare(`
      SELECT category, SUM(amount) as value 
      FROM expenses 
      WHERE strftime('%Y', date) = ?
      GROUP BY category
    `).all(String(currentYear));
    res.json(expenses);
  });

  app.get("/api/financials/rent-roll", (req, res) => {
    const rentRoll = db.prepare(`
      SELECT 
        p.name as property_name,
        u.unit_number,
        t.name as tenant_name,
        u.rent_price,
        t.lease_end,
        u.status
      FROM units u
      JOIN properties p ON u.property_id = p.id
      LEFT JOIN tenants t ON u.id = t.unit_id
      ORDER BY p.name, u.unit_number
    `).all();
    res.json(rentRoll);
  });

  app.get("/api/financials/projections", (req, res) => {
    // Simple projection: Current monthly rent * 12 vs Average monthly expenses * 12
    const monthlyRent = db.prepare(`
      SELECT SUM(rent_price) as total 
      FROM units 
      WHERE status = 'occupied'
    `).get() as { total: number };

    const avgMonthlyExpenses = db.prepare(`
      SELECT AVG(monthly_total) as average
      FROM (
        SELECT strftime('%Y-%m', date) as month, SUM(amount) as monthly_total
        FROM expenses
        GROUP BY month
      )
    `).get() as { average: number };

    const projectedIncome = (monthlyRent.total || 0) * 12;
    const projectedExpenses = (avgMonthlyExpenses.average || 0) * 12;

    res.json({
      projected_income: projectedIncome,
      projected_expenses: projectedExpenses,
      projected_cash_flow: projectedIncome - projectedExpenses
    });
  });

  // --- Maintenance Endpoints ---

  app.get("/api/maintenance/requests", (req, res) => {
    const requests = db.prepare(`
      SELECT 
        m.*,
        p.name as property_name,
        u.unit_number,
        t.name as tenant_name,
        v.name as vendor_name
      FROM maintenance_requests m
      LEFT JOIN properties p ON m.property_id = p.id
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN tenants t ON m.tenant_id = t.id
      LEFT JOIN vendors v ON m.vendor_id = v.id
      ORDER BY m.created_at DESC
    `).all();
    res.json(requests);
  });

  app.post("/api/maintenance/requests", (req, res) => {
    const { property_id, unit_id, tenant_id, title, description, priority, images } = req.body;
    const info = db.prepare(`
      INSERT INTO maintenance_requests (property_id, unit_id, tenant_id, title, description, priority, images)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(property_id, unit_id, tenant_id, title, description, priority, JSON.stringify(images || []));
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/maintenance/requests/:id", (req, res) => {
    const { status, vendor_id, title, description, priority, property_id, unit_id } = req.body;
    
    // If specific fields are provided (edit mode), update them
    if (title || description || priority) {
      db.prepare(`
        UPDATE maintenance_requests 
        SET title = ?, description = ?, priority = ?, property_id = ?, unit_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, description, priority, property_id, unit_id, req.params.id);
    }
    
    // Always check for status/vendor updates (quick actions)
    if (status || vendor_id !== undefined) {
      db.prepare(`
        UPDATE maintenance_requests 
        SET status = COALESCE(?, status), vendor_id = COALESCE(?, vendor_id), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, vendor_id, req.params.id);
    }
    
    res.json({ success: true });
  });

  app.delete("/api/maintenance/requests/:id", (req, res) => {
    db.prepare("DELETE FROM maintenance_requests WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/vendors", (req, res) => {
    const vendors = db.prepare("SELECT * FROM vendors ORDER BY name").all();
    res.json(vendors);
  });

  app.post("/api/vendors", (req, res) => {
    const { name, category, phone, email, address, notes } = req.body;
    const info = db.prepare(`
      INSERT INTO vendors (name, category, phone, email, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, category, phone, email, address, notes);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/vendors/:id", (req, res) => {
    const { name, category, phone, email, address, notes } = req.body;
    db.prepare(`
      UPDATE vendors 
      SET name = ?, category = ?, phone = ?, email = ?, address = ?, notes = ?
      WHERE id = ?
    `).run(name, category, phone, email, address, notes, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/vendors/:id", (req, res) => {
    db.prepare("DELETE FROM vendors WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/maintenance/scheduled", (req, res) => {
    const scheduled = db.prepare(`
      SELECT 
        s.*,
        p.name as property_name,
        v.name as vendor_name
      FROM scheduled_maintenance s
      LEFT JOIN properties p ON s.property_id = p.id
      LEFT JOIN vendors v ON s.vendor_id = v.id
      ORDER BY s.scheduled_date ASC
    `).all();
    res.json(scheduled);
  });

  app.post("/api/maintenance/scheduled", (req, res) => {
    const { property_id, title, description, scheduled_date, frequency, vendor_id } = req.body;
    const info = db.prepare(`
      INSERT INTO scheduled_maintenance (property_id, title, description, scheduled_date, frequency, vendor_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(property_id, title, description, scheduled_date, frequency, vendor_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/maintenance/scheduled/:id", (req, res) => {
    const { property_id, title, description, scheduled_date, frequency, vendor_id } = req.body;
    db.prepare(`
      UPDATE scheduled_maintenance 
      SET property_id = ?, title = ?, description = ?, scheduled_date = ?, frequency = ?, vendor_id = ?
      WHERE id = ?
    `).run(property_id, title, description, scheduled_date, frequency, vendor_id, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/maintenance/scheduled/:id", (req, res) => {
    db.prepare("DELETE FROM scheduled_maintenance WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
