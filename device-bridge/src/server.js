require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

// Configuration
const PORT = process.env.PORT || 3001;
const DEVICE_ID = process.env.DEVICE_ID || uuidv4();

// In-memory logs
const logs = [];
const MAX_LOGS = 100;

// Logging helpers
function logInfo(msg) {
  const entry = { timestamp: new Date().toISOString(), level: 'INFO', msg };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  console.log(`[INFO] ${msg}`);
}

function logError(msg) {
  const entry = { timestamp: new Date().toISOString(), level: 'ERROR', msg };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  console.error(`[ERROR] ${msg}`);
}

// ===========================================
// Health Check
// ===========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    device_id: DEVICE_ID,
    uptime: process.uptime(),
    printer_ready: true, // TODO: Check actual printer status
    drawer_ready: true,  // TODO: Check actual drawer status
    scanner_ready: true, // TODO: Check actual scanner status
    timestamp: new Date().toISOString(),
  });
});

// ===========================================
// Print Receipt
// ===========================================
app.post('/print', (req, res) => {
  const { template, data } = req.body;

  if (!template || !data) {
    return res.status(400).json({ error: 'Missing template or data' });
  }

  try {
    // Render receipt (mock implementation)
    const receipt = renderReceipt(template, data);

    // TODO: In production, send to actual printer via serial/USB
    // For now, just log the receipt
    logInfo(`Print request: ${template}`);
    console.log('--- RECEIPT START ---');
    console.log(receipt);
    console.log('--- RECEIPT END ---');

    res.json({
      status: 'ok',
      message: 'Receipt printed successfully',
      receipt_id: uuidv4(),
    });
  } catch (e) {
    logError(`Print error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ===========================================
// Open Cash Drawer
// ===========================================
app.post('/drawer/open', (req, res) => {
  try {
    // TODO: In production, send ESC/POS command to open drawer
    // const cmd = Buffer.from([0x1B, 0x70, 0x00, 0x32, 0x32]);

    logInfo('Cash drawer opened');
    res.json({ status: 'ok', message: 'Drawer opened' });
  } catch (e) {
    logError(`Drawer error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ===========================================
// Barcode Scanner Input
// ===========================================
app.post('/scanner/input', (req, res) => {
  const { barcode } = req.body;

  if (!barcode) {
    return res.status(400).json({ error: 'Missing barcode' });
  }

  logInfo(`Barcode scanned: ${barcode}`);
  res.json({ status: 'ok', barcode });
});

// ===========================================
// Logs
// ===========================================
app.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({ logs: logs.slice(-limit) });
});

app.post('/logs/clear', (req, res) => {
  logs.length = 0;
  res.json({ status: 'ok' });
});

// ===========================================
// Receipt Rendering
// ===========================================
function renderReceipt(template, data) {
  let receipt = '';

  if (template === 'receipt') {
    receipt += '\n';
    receipt += '═══════════════════════════════\n';
    receipt += `       ${data.shop_name || 'QUELYOS SHOP'}       \n`;
    receipt += '═══════════════════════════════\n\n';

    receipt += `Commande: ${data.order_name || 'N/A'}\n`;
    receipt += `Date: ${data.date || new Date().toLocaleString()}\n`;
    receipt += `Caissier: ${data.cashier_name || 'N/A'}\n\n`;

    receipt += '───────────────────────────────\n';

    if (data.items && data.items.length > 0) {
      data.items.forEach(item => {
        receipt += `${item.name}\n`;
        receipt += `  ${item.qty} x ${item.price.toFixed(2)} = ${item.total.toFixed(2)} TND\n`;
      });
    }

    receipt += '───────────────────────────────\n';
    receipt += `TOTAL: ${(data.total || 0).toFixed(2)} TND\n\n`;

    receipt += `Paiement: ${data.payment_method || 'Especes'}\n`;
    receipt += '\n✓ Merci de votre visite!\n\n';
  }

  return receipt;
}

// ===========================================
// Start Server
// ===========================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('  QUELYOS DEVICE BRIDGE');
  console.log('═══════════════════════════════════════');
  console.log(`  Device ID: ${DEVICE_ID}`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════');
  logInfo(`Device Bridge started on port ${PORT}`);
});
