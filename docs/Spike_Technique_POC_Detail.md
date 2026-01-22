# ⚡ SPIKE TECHNIQUE — Plan POC (3–5 jours)

**Objectif** : Valider que les 4 dépendances critiques sont faisables avant de start V0/V1.

**Timeline** : Février 3–10, 2026  
**Participants** : 2–3 devs backend, 1 dev infra  
**Deliverable** : POC validé + "go-light" decision pour chaque  

---

## 📌 POC 1: PSP Konnect Integration (Tunisie)

**Durée** : 1.5 days  
**Owner** : Backend Dev 1  
**Success criteria** :
- ✅ Sandbox account created + credentials in hand
- ✅ Test payment flow: web redirect → Konnect → webhook return → order created in Odoo
- ✅ Refund flow working (if available in sandbox)
- ✅ Documentation of API responses + error codes

### Setup (0.5 day)

```bash
# 1. Konnect sandbox account
Go to https://merchants.konnect.tn/register
Create account (use company sandbox credentials)
Request sandbox credentials (API key, merchant ID)

# 2. Konnect docs
Download/review API docs from Konnect
Check endpoints:
  - POST /api/v2/payments (create payment)
  - POST /api/v2/payments/{id}/refunds (refund)
  - Webhook (payment.confirmed)

# 3. Odoo payment acquirer module
cd odoo_addons/
pip install requests
Create module: payment_konnect/
  ├─ __manifest__.py
  ├─ models/payment_provider.py
  ├─ models/payment_transaction.py
  └─ controllers/konnect_webhook.py
```

### Implementation (1 day)

**Controller: Redirect to Konnect**

```python
# controllers/konnect_webhook.py
import json
import requests
from odoo import http, fields
from odoo.exceptions import ValidationError

class KonnectPaymentController(http.Controller):
    
    @http.route('/payment/konnect/return', type='http', auth='public', csrf=False)
    def konnect_return(self, **post):
        """
        Konnect redirects here after payment.
        Check payment_ref parameter and verify against Konnect API.
        """
        payment_ref = post.get('payment_ref')
        
        try:
            # Fetch payment status from Konnect
            provider = self._get_konnect_provider()
            payment_data = self._konnect_get_payment(provider, payment_ref)
            
            # Update transaction in Odoo
            transaction = self._find_transaction(payment_ref)
            
            if payment_data['status'] == 'completed':
                transaction.write({'state': 'done'})
                transaction.order_id.write({'state': 'sale'})  # Mark as paid
                return f"✅ Payment confirmed! Order: {transaction.order_id.name}"
            else:
                transaction.write({'state': 'error'})
                return f"❌ Payment failed: {payment_data.get('error_message')}"
        
        except Exception as e:
            return f"⚠️ Error: {str(e)}"
    
    @http.route('/payment/konnect/webhook', type='json', auth='public', csrf=False)
    def konnect_webhook(self, **post):
        """
        Konnect sends webhook when payment confirmed.
        Verify signature, then mark payment as done.
        """
        signature = request.headers.get('X-Konnect-Signature')
        payload = json.dumps(post, separators=(',', ':'))
        
        # Verify signature (Konnect provides HMAC method)
        provider = self._get_konnect_provider()
        expected_signature = self._verify_konnect_signature(provider, payload)
        
        if signature != expected_signature:
            return {'status': 'error', 'message': 'Invalid signature'}
        
        # Process payment
        transaction = self._find_transaction(post['payment_ref'])
        transaction.write({'state': 'done'})
        
        return {'status': 'ok'}
    
    def _get_konnect_provider(self):
        return http.request.env['payment.provider'].search(
            [('code', '=', 'konnect'), ('state', '!=', 'disabled')]
        )[0]
    
    def _konnect_get_payment(self, provider, payment_ref):
        """Fetch payment status from Konnect API."""
        api_key = provider.konnect_api_key
        url = f"https://api.konnect.tn/api/v2/payments/{payment_ref}"
        
        resp = requests.get(url, headers={'Authorization': f'Bearer {api_key}'})
        return resp.json()
    
    def _find_transaction(self, payment_ref):
        return http.request.env['payment.transaction'].search(
            [('external_reference', '=', payment_ref)]
        )[0]
    
    def _verify_konnect_signature(self, provider, payload):
        import hmac
        import hashlib
        
        secret = provider.konnect_secret_key
        return hmac.new(
            secret.encode(), 
            payload.encode(), 
            hashlib.sha256
        ).hexdigest()
```

**Model: Payment provider configuration**

```python
# models/payment_provider.py
from odoo import models, fields

class PaymentProvider(models.Model):
    _inherit = 'payment.provider'
    
    konnect_api_key = fields.Char(string="Konnect API Key")
    konnect_secret_key = fields.Char(string="Konnect Secret Key")
    konnect_merchant_id = fields.Char(string="Konnect Merchant ID")
    
    def _get_payment_form_values(self):
        """Return values for Konnect payment form."""
        res = super()._get_payment_form_values()
        
        if self.code == 'konnect':
            res['payment_ref'] = self._generate_payment_ref()
            res['konnect_url'] = "https://app.konnect.tn/pay"  # sandbox or prod
        
        return res
    
    def _generate_payment_ref(self):
        """Generate unique reference for this transaction."""
        import uuid
        return f"KONNECT-{uuid.uuid4().hex[:16]}"
```

### Testing (0.5 day)

```bash
# 1. Start Odoo in dev mode
cd odoo
python -m odoo.bin.odoo -d test_db --addons-path=addons,../odoo_addons

# 2. Go to Sales > Orders > Create test order
# 3. Checkout → Select "Konnect" payment
# 4. Get redirect URL
# 5. Manually visit sandbox Konnect payment page
# 6. Complete payment (use sandbox card)
# 7. Check: order status should be "Paid"

# Expected logs:
# ✅ Redirect to Konnect
# ✅ Webhook received (check Odoo logs)
# ✅ Order marked as "Paid"
```

### Validation checklist

- [ ] Sandbox credentials in hand
- [ ] Redirect flow working (HTTP 302 to Konnect)
- [ ] Payment completed (test card accepted)
- [ ] Webhook received + signature verified
- [ ] Order status updated to "Paid" in Odoo
- [ ] Error handling (invalid card, timeout, etc.)
- [ ] API response times < 1s
- [ ] Documentation: API endpoint, error codes, webhook format

### Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Sandbox unavailable | Contact Konnect support + use Stripe fallback |
| API docs incomplete | Reverse-engineer from sandbox responses |
| Slow API | Cache payment status, retry with exponential backoff |
| Webhook timeout | Store webhook attempt + replay if needed |

---

## 📌 POC 2: Transporteur API (Autobacs TN)

**Durée** : 1.5 days  
**Owner** : Backend Dev 2  
**Success criteria** :
- ✅ Create shipment API working
- ✅ Track shipment by reference
- ✅ Get label PDF
- ✅ Status mapping (pending → in transit → delivered)

### Setup (0.5 day)

```bash
# 1. Contact Autobacs API team
# Email: api@autobacs.tn
# Request: Sandbox credentials, API docs, rate limits
# Expected: API key + endpoint URLs

# 2. Review API docs
# Check endpoints:
#  - POST /shipments (create)
#  - GET /shipments/{id} (track)
#  - GET /shipments/{id}/label (PDF label)

# 3. Odoo delivery module
cd odoo_addons/
Create module: delivery_autobacs/
  ├─ __manifest__.py
  ├─ models/delivery_carrier.py
  ├─ models/stock_picking.py
  └─ controllers/webhook.py
```

### Implementation (1 day)

**Create shipment + get label**

```python
# models/delivery_carrier.py
import requests
from odoo import models, fields, api

class DeliveryCarrier(models.Model):
    _inherit = 'delivery.carrier'
    
    autobacs_api_key = fields.Char("Autobacs API Key")
    autobacs_base_url = fields.Char(
        default="https://api.autobacs.tn/v1"  # or sandbox URL
    )
    
    def _send_shipment_to_autobacs(self, picking):
        """
        Create shipment in Autobacs when stock.picking is confirmed.
        """
        if self.delivery_type != 'autobacs':
            return
        
        # Prepare shipment data
        shipment_data = {
            'reference': picking.name,
            'recipient': {
                'name': picking.partner_id.name,
                'phone': picking.partner_id.phone,
                'address': picking.partner_id.street,
                'city': picking.partner_id.city,
                'zip': picking.partner_id.zip,
            },
            'items': [
                {
                    'description': move.product_id.name,
                    'quantity': int(move.quantity_done),
                    'weight': move.product_id.weight * move.quantity_done,
                }
                for move in picking.move_ids
            ],
            'cod_amount': picking.sale_id.amount_total if picking.sale_id.payment_term_id.name == 'COD' else 0,
        }
        
        try:
            # POST to Autobacs
            resp = requests.post(
                f"{self.autobacs_base_url}/shipments",
                json=shipment_data,
                headers={'Authorization': f'Bearer {self.autobacs_api_key}'},
                timeout=10
            )
            resp.raise_for_status()
            
            result = resp.json()
            
            # Store shipment reference in picking
            picking.write({
                'carrier_tracking_ref': result['shipment_id'],
                'carrier_label': result.get('label_url'),  # URL to PDF
            })
            
            # Download label
            label_resp = requests.get(result['label_url'])
            label_resp.raise_for_status()
            
            # Store PDF in Odoo attachments
            self._create_label_attachment(picking, label_resp.content)
            
            picking.write({'state': 'shipped'})
            
        except requests.exceptions.RequestException as e:
            picking.message_post(body=f"⚠️ Autobacs error: {str(e)}")
    
    def _create_label_attachment(self, picking, pdf_content):
        """Store label PDF as attachment."""
        self.env['ir.attachment'].create({
            'name': f"Label_{picking.name}.pdf",
            'type': 'binary',
            'datas': pdf_content,
            'res_model': 'stock.picking',
            'res_id': picking.id,
        })
```

**Track shipment**

```python
def _update_shipment_status(self, picking):
    """Poll Autobacs for shipment status updates."""
    if not picking.carrier_tracking_ref:
        return
    
    try:
        resp = requests.get(
            f"{self.autobacs_base_url}/shipments/{picking.carrier_tracking_ref}",
            headers={'Authorization': f'Bearer {self.autobacs_api_key}'},
        )
        resp.raise_for_status()
        
        result = resp.json()
        status_map = {
            'pending': 'Pending',
            'picked_up': 'Shipped',
            'in_transit': 'Shipped',
            'delivered': 'Done',
            'failed': 'Cancelled',
        }
        
        new_status = status_map.get(result['status'], 'Shipped')
        picking.write({'carrier_tracking_status': new_status})
        
        # Update related sales order
        if picking.sale_id:
            picking.sale_id.message_post(
                body=f"📦 Shipment update: {new_status} (Autobacs)"
            )
    
    except Exception as e:
        picking.message_post(body=f"⚠️ Failed to track: {str(e)}")
```

**Webhook for delivery confirmation**

```python
# controllers/webhook.py
from odoo import http

class AutobacsWebhook(http.Controller):
    
    @http.route('/delivery/autobacs/webhook', type='json', auth='public', csrf=False)
    def autobacs_webhook(self, **post):
        """
        Autobacs sends webhook when delivery status changes.
        post = {
            'shipment_id': 'AUTO-12345',
            'status': 'delivered',
            'timestamp': '2026-02-01T14:30:00Z',
            'notes': 'Delivered to customer'
        }
        """
        picking = http.request.env['stock.picking'].search(
            [('carrier_tracking_ref', '=', post['shipment_id'])]
        )
        
        if not picking:
            return {'status': 'not_found'}
        
        # Update status
        picking.write({
            'carrier_tracking_status': post['status'].title(),
            'carrier_tracking_notes': post.get('notes'),
        })
        
        if post['status'] == 'delivered':
            picking.write({'state': 'done'})
        
        return {'status': 'ok'}
```

### Testing (0.5 day)

```bash
# 1. Create order + delivery in Odoo
# 2. Confirm picking → Autobacs shipment should be created
# 3. Check picking.carrier_tracking_ref (should have value)
# 4. Manually trigger status update via webhook:
curl -X POST https://localhost:8069/delivery/autobacs/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "shipment_id": "AUTO-12345",
    "status": "delivered",
    "notes": "Delivered at 2pm"
  }'

# 5. Check: picking status should be "Done"
```

### Validation checklist

- [ ] Sandbox API credentials working
- [ ] Shipment created in Autobacs (tracking ref in Odoo)
- [ ] Label PDF retrievable
- [ ] Status updates via webhook working
- [ ] Status mapping correct (pending → in-transit → delivered)
- [ ] Error handling (timeout, invalid data, etc.)
- [ ] COD shipments marked correctly in Autobacs

### Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| API docs incomplete | Request live demo + reverse-engineer |
| Slow API response | Add queue, retry async |
| Webhook signature validation needed | Implement signature verification |
| Multiple transporteurs in future | Abstract to generic carrier interface |

---

## 📌 POC 3: Device Bridge (POS Hardware via LAN)

**Durée** : 2 days  
**Owner** : Infra Dev  
**Success criteria** :
- ✅ Node.js agent listening on LAN
- ✅ Receipt printing from Odoo → Sunmi printer
- ✅ Cash drawer opening from Odoo
- ✅ Barcode scanner input working
- ✅ Device healthcheck (uptime, logs)

### Architecture

```
┌─────────────────┐
│  Odoo POS       │ (Web browser)
│  (localhost:80) │
└────────┬────────┘
         │ HTTP POST /print
         │ { "template": "receipt", "data": {...} }
         │
         ├──→ [Internet] ❌ (NOT exposed)
         │
         └──→ [LAN, 192.168.1.x]
              │
         ┌────┴──────────────────┐
         │  Device Bridge Agent   │ (Node.js)
         │  (192.168.1.100:3000)  │
         │  ├─ Sunmi printer      │
         │  ├─ Cash drawer        │
         │  ├─ Barcode scanner    │
         │  └─ Device logs        │
         └────────────────────────┘
```

### Setup (0.5 day)

```bash
# 1. Node.js project setup
mkdir device-bridge
cd device-bridge
npm init -y
npm install express cors serialport escpos-printer axios dotenv

# 2. Sunmi hardware setup
# Get Sunmi V2 Pro device
# Connect to same LAN as POS
# Note IP address (e.g., 192.168.1.100)

# 3. Environment
cat > .env <<EOF
DEVICE_IP=192.168.1.100
DEVICE_PORT=3000
SUNMI_MODEL=V2Pro
ODOO_URL=https://localhost:8069
DEVICE_ID=$(uuidgen)
EOF
```

### Implementation (1.5 days)

**Device Bridge server**

```javascript
// device-bridge/server.js
const express = require('express');
const cors = require('cors');
const SerialPort = require('serialport').SerialPort;
const EscposNative = require('escpos-printer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

let printer = null;
let drawer = null;
let scanner = null;
const logs = [];
const PORT = process.env.DEVICE_PORT || 3000;

// ============= INITIALIZATION =============

function initPrinter() {
  try {
    // Sunmi V2 Pro: thermal printer on serial/USB
    const printPort = new SerialPort({ path: '/dev/ttyS1', baudRate: 115200 });
    printer = new EscposNative(printPort);
    printer.on('open', () => console.log('✅ Printer ready'));
    printer.on('error', (err) => logError(`Printer error: ${err}`));
  } catch (e) {
    logError(`Printer init failed: ${e.message}`);
  }
}

function initDrawer() {
  try {
    // Cash drawer on GPIO or serial pin
    // Sunmi V2 Pro has integrated drawer control
    drawer = {
      open: () => {
        // Send ESC/POS command to open drawer
        const cmd = Buffer.from([0x1B, 0x70, 0x00, 0x32, 0x32]);
        printer.write(cmd);
        logInfo('💰 Drawer opened');
      }
    };
  } catch (e) {
    logError(`Drawer init failed: ${e.message}`);
  }
}

function initScanner() {
  try {
    // Barcode scanner: USB HID input
    // Typically appears as keyboard input
    scanner = {
      lastBarcode: null,
      onScan: (callback) => {
        // In real impl, listen to USB HID events
        // For POC, expose webhook endpoint
      }
    };
  } catch (e) {
    logError(`Scanner init failed: ${e.message}`);
  }
}

// ============= API ENDPOINTS =============

app.post('/print', (req, res) => {
  const { template, data } = req.body;
  
  if (!printer) {
    return res.status(503).json({ error: 'Printer not ready' });
  }
  
  try {
    // Render template (ESC/POS commands)
    const receipt = renderReceipt(template, data);
    
    // Send to printer
    printer.write(Buffer.from(receipt));
    printer.flush();
    
    logInfo(`🖨️  Printed: ${template}`);
    res.json({ status: 'ok', message: 'Receipt printed' });
  } catch (e) {
    logError(`Print error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

app.post('/drawer/open', (req, res) => {
  if (!drawer) {
    return res.status(503).json({ error: 'Drawer not ready' });
  }
  
  try {
    drawer.open();
    res.json({ status: 'ok', message: 'Drawer opened' });
  } catch (e) {
    logError(`Drawer error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

app.post('/scanner/input', (req, res) => {
  // Webhook: barcode scanner sends here
  const { barcode } = req.body;
  
  scanner.lastBarcode = barcode;
  logInfo(`📦 Scanned: ${barcode}`);
  
  res.json({ status: 'ok', barcode });
});

app.get('/health', (req, res) => {
  res.json({
    device_id: process.env.DEVICE_ID,
    uptime: process.uptime(),
    printer_ready: !!printer,
    drawer_ready: !!drawer,
    scanner_ready: !!scanner,
    last_barcode: scanner?.lastBarcode,
    timestamp: new Date().toISOString(),
  });
});

app.get('/logs', (req, res) => {
  const limit = req.query.limit || 50;
  res.json({ logs: logs.slice(-limit) });
});

app.post('/logs/clear', (req, res) => {
  logs.length = 0;
  res.json({ status: 'ok' });
});

// ============= HELPERS =============

function renderReceipt(template, data) {
  // Convert Odoo receipt template to ESC/POS commands
  // Simplified example:
  let receipt = '';
  
  if (template === 'receipt') {
    receipt += '\n\n';
    receipt += '═══════════════════════\n';
    receipt += `${data.shop_name}\n`;
    receipt += '═══════════════════════\n\n';
    
    receipt += `Order: ${data.order_name}\n`;
    receipt += `Date: ${data.date}\n`;
    receipt += `Cashier: ${data.cashier_name}\n\n`;
    
    receipt += '───────────────────────\n';
    data.items.forEach(item => {
      receipt += `${item.name}\n`;
      receipt += `${item.qty} x ${item.price} = ${item.total}\n`;
    });
    
    receipt += '───────────────────────\n';
    receipt += `Total: ${data.total}\n\n`;
    
    receipt += `Payment: ${data.payment_method}\n`;
    receipt += `\n✓ Thank you!\n\n\n`;
  }
  
  return receipt;
}

function logInfo(msg) {
  const entry = { timestamp: new Date().toISOString(), level: 'INFO', msg };
  logs.push(entry);
  console.log(`[INFO] ${msg}`);
}

function logError(msg) {
  const entry = { timestamp: new Date().toISOString(), level: 'ERROR', msg };
  logs.push(entry);
  console.error(`[ERROR] ${msg}`);
}

// ============= START =============

initPrinter();
initDrawer();
initScanner();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Device Bridge listening on port ${PORT}`);
  logInfo(`Device Bridge started, ID: ${process.env.DEVICE_ID}`);
});
```

**Odoo integration (POS)**

```python
# odoo_addons/pos_device_bridge/models/pos_session.py
import requests
from odoo import models, fields

class PosSession(models.Model):
    _inherit = 'pos.session'
    
    device_bridge_ip = fields.Char(
        string="Device Bridge IP",
        default="192.168.1.100",
    )
    device_bridge_port = fields.Integer(default=3000)
    device_bridge_status = fields.Selection(
        [('online', 'Online'), ('offline', 'Offline')],
        compute='_compute_device_status',
    )
    
    def _print_receipt(self, receipt_html):
        """Print receipt via Device Bridge."""
        if not self.device_bridge_ip:
            raise ValueError("Device Bridge IP not configured")
        
        try:
            url = f"http://{self.device_bridge_ip}:{self.device_bridge_port}/print"
            response = requests.post(url, json={
                'template': 'receipt',
                'data': {
                    'shop_name': self.config_id.name,
                    'order_name': self.current_order.name,
                    'date': fields.Datetime.now(),
                    'cashier_name': self.user_id.name,
                    'items': [
                        {
                            'name': line.product_id.name,
                            'qty': line.qty,
                            'price': line.price_unit,
                            'total': line.price_subtotal,
                        }
                        for line in self.current_order.lines
                    ],
                    'total': self.current_order.amount_total,
                    'payment_method': self.current_order.payment_ids[0].payment_method_id.name if self.current_order.payment_ids else 'Cash',
                }
            }, timeout=5)
            
            response.raise_for_status()
            return True
        
        except requests.exceptions.RequestException as e:
            self.env['bus.bus']._sendone(
                f'pos_session_{self.id}',
                'notify', {
                    'title': 'Print failed',
                    'message': f'Device Bridge error: {str(e)}',
                }
            )
            return False
    
    def _open_drawer(self):
        """Open cash drawer via Device Bridge."""
        try:
            url = f"http://{self.device_bridge_ip}:{self.device_bridge_port}/drawer/open"
            requests.post(url, timeout=2)
        except Exception as e:
            print(f"⚠️ Drawer error: {e}")
    
    def _compute_device_status(self):
        """Check if Device Bridge is online."""
        for session in self:
            try:
                url = f"http://{session.device_bridge_ip}:{session.device_bridge_port}/health"
                resp = requests.get(url, timeout=2)
                session.device_bridge_status = 'online' if resp.status_code == 200 else 'offline'
            except:
                session.device_bridge_status = 'offline'
```

### Testing (0.5 day)

```bash
# 1. Start Device Bridge
cd device-bridge
node server.js

# 2. Test health endpoint
curl http://192.168.1.100:3000/health
# Response: { "device_id": "...", "uptime": 1234, ... }

# 3. Test print (with real printer)
curl -X POST http://192.168.1.100:3000/print \
  -H "Content-Type: application/json" \
  -d '{
    "template": "receipt",
    "data": {
      "shop_name": "Test Shop",
      "order_name": "SO-001",
      "date": "2026-02-01",
      "items": [
        { "name": "T-shirt", "qty": 1, "price": 50, "total": 50 }
      ],
      "total": 50,
      "payment_method": "Cash"
    }
  }'

# Expected: Receipt prints on Sunmi printer ✅

# 4. Test drawer
curl -X POST http://192.168.1.100:3000/drawer/open
# Expected: Drawer pops open ✅

# 5. POS in Odoo
# Create order → Confirm → Print (via Device Bridge)
# Check Device Bridge logs for confirmation
```

### Validation checklist

- [ ] Device Bridge starts without errors
- [ ] Health endpoint responding
- [ ] Receipt prints to Sunmi printer
- [ ] Drawer opens when requested
- [ ] Logs accessible via `/logs` endpoint
- [ ] Graceful error handling (offline device)
- [ ] Network latency acceptable (<1s)
- [ ] TLS certificate (self-signed OK for LAN)

### Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Network timeout | Queue locally, retry with backoff |
| Printer driver incompatibility | Test all device models in advance |
| Device goes offline | Queue print jobs locally, auto-print on reconnect |
| Security (exposed on LAN) | Use TLS + device pairing (IMEI hash) |

---

## 📌 POC 4: API /api/v1 (Mobile app foundation)

**Durée** : 1 day  
**Owner** : Backend Dev 1  
**Success criteria** :
- ✅ /api/v1/auth (login, token refresh)
- ✅ /api/v1/products (list + detail + variants)
- ✅ /api/v1/cart (add, remove, get)
- ✅ OpenAPI docs auto-generated
- ✅ Error handling (400, 401, 500)

### Setup (0.25 day)

```bash
# 1. Create Odoo addon
mkdir odoo_addons/api_rest_v1/
touch __manifest__.py __init__.py

# 2. Install dependencies
pip install python-jose pydantic

# 3. Project structure
odoo_addons/api_rest_v1/
├─ __manifest__.py
├─ __init__.py
├─ models/
│  ├─ __init__.py
│  └─ api_token.py
├─ controllers/
│  ├─ __init__.py
│  ├─ auth.py
│  ├─ products.py
│  ├─ cart.py
│  └─ orders.py
└─ tests/
   └─ test_api.py
```

### Implementation (0.75 day)

**Auth controller**

```python
# controllers/auth.py
import json
from datetime import datetime, timedelta
from odoo import http, fields
from odoo.exceptions import AccessDenied
import jwt

SECRET_KEY = "your-secret-key-change-in-prod"  # Use env var in prod
ALGORITHM = "HS256"

class AuthAPI(http.Controller):
    
    @http.route('/api/v1/auth/login', type='json', auth='public', csrf=False)
    def login(self, **post):
        """
        POST /api/v1/auth/login
        { "email": "user@example.com", "password": "pass" }
        
        Returns:
        { "access_token": "eyJhbGc...", "refresh_token": "...", "user": {...} }
        """
        email = post.get('email')
        password = post.get('password')
        
        if not email or not password:
            return {
                'error': 'Missing email or password',
                'code': 'INVALID_REQUEST',
            }, 400
        
        try:
            # Find user by email
            user = http.request.env['res.users'].search([('login', '=', email)])
            if not user:
                raise AccessDenied("Invalid credentials")
            
            # Authenticate
            user.check_credentials(password)
            
            # Create JWT tokens
            access_token = _create_token(user, expires_in=3600)  # 1 hour
            refresh_token = _create_token(user, expires_in=86400*30)  # 30 days
            
            # Store refresh token in DB (for revocation)
            http.request.env['api.token'].create({
                'user_id': user.id,
                'token': refresh_token,
                'expires_at': fields.Datetime.now() + timedelta(days=30),
            })
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'token_type': 'Bearer',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.login,
                }
            }
        
        except AccessDenied:
            return {
                'error': 'Invalid email or password',
                'code': 'INVALID_CREDENTIALS',
            }, 401
    
    @http.route('/api/v1/auth/refresh', type='json', auth='public', csrf=False)
    def refresh(self, **post):
        """
        POST /api/v1/auth/refresh
        { "refresh_token": "..." }
        
        Returns new access_token.
        """
        refresh_token = post.get('refresh_token')
        
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get('sub')
            
            user = http.request.env['res.users'].browse(user_id)
            
            # Verify token not revoked
            token_record = http.request.env['api.token'].search(
                [('token', '=', refresh_token), ('revoked', '=', False)]
            )
            if not token_record:
                raise ValueError("Token revoked")
            
            # Create new access token
            new_access_token = _create_token(user, expires_in=3600)
            
            return {
                'access_token': new_access_token,
                'token_type': 'Bearer',
            }
        
        except jwt.ExpiredSignatureError:
            return {'error': 'Refresh token expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}, 401
    
    @http.route('/api/v1/auth/logout', type='json', auth='bearer', csrf=False)
    def logout(self, **post):
        """
        POST /api/v1/auth/logout
        Revoke all tokens for current user.
        """
        user = http.request.env.user
        
        http.request.env['api.token'].search([
            ('user_id', '=', user.id)
        ]).write({'revoked': True})
        
        return {'status': 'ok'}

def _create_token(user, expires_in=3600):
    """Create JWT token."""
    payload = {
        'sub': user.id,
        'email': user.login,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(seconds=expires_in),
    }
    
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
```

**Products controller**

```python
# controllers/products.py
from odoo import http
from datetime import datetime

class ProductsAPI(http.Controller):
    
    @http.route('/api/v1/products', type='json', auth='public', csrf=False)
    def list_products(self, **kwargs):
        """
        GET /api/v1/products?limit=20&offset=0&category=T-Shirts&color=Red
        
        Returns paginated product list.
        """
        limit = int(kwargs.get('limit', 20))
        offset = int(kwargs.get('offset', 0))
        category = kwargs.get('category')
        color = kwargs.get('color')
        
        # Build domain
        domain = [('available_in_pos', '=', True)]
        if category:
            domain.append(('categ_id.name', '=', category))
        
        # Search
        products = http.request.env['product.product'].search(
            domain,
            limit=limit,
            offset=offset,
            order='name asc'
        )
        
        total = http.request.env['product.product'].search_count(domain)
        
        return {
            'data': [
                _serialize_product(p) for p in products
            ],
            'meta': {
                'total': total,
                'limit': limit,
                'offset': offset,
                'timestamp': datetime.utcnow().isoformat(),
            }
        }
    
    @http.route('/api/v1/products/<int:product_id>', type='json', auth='public', csrf=False)
    def get_product(self, product_id, **kwargs):
        """
        GET /api/v1/products/123
        
        Returns full product detail with variants.
        """
        product = http.request.env['product.product'].browse(product_id)
        
        if not product:
            return {'error': 'Product not found'}, 404
        
        return {
            'data': {
                **_serialize_product(product),
                'variants': [
                    {
                        'id': variant.id,
                        'name': variant.name,
                        'attributes': variant.product_template_attribute_value_ids.mapped(
                            lambda x: {
                                'attribute': x.attribute_id.name,
                                'value': x.name,
                            }
                        ),
                        'stock': variant.with_context(warehouse=self._get_warehouse()).qty_available,
                        'sku': variant.barcode or variant.default_code,
                    }
                    for variant in product.product_variant_ids
                ],
                'images': [
                    {
                        'id': image.id,
                        'url': f"/web/image/product.image/{image.id}/image_1024",
                        'alt': image.name,
                    }
                    for image in product.product_template_id.product_image_ids
                ],
            }
        }

def _serialize_product(product):
    """Serialize product to API format."""
    return {
        'id': product.id,
        'name': product.name,
        'description': product.description_sale[:200] + '...' if product.description_sale else '',
        'price': product.list_price,
        'price_discounted': product.lst_price * 0.9,  # 10% discount example
        'stock': product.qty_available,
        'rating': 4.5,  # TODO: calculate from reviews
        'image_url': f"/web/image/product.product/{product.id}/image_1024",
        'sku': product.barcode or product.default_code,
    }
```

**Cart + Orders (similar pattern)**

```python
# controllers/cart.py
@http.route('/api/v1/cart', type='json', auth='bearer', csrf=False)
def get_cart(self, **kwargs):
    user = http.request.env.user
    # Get user's current cart (sale order with state='draft')
    
@http.route('/api/v1/cart', type='json', auth='bearer', methods=['POST'], csrf=False)
def add_to_cart(self, **post):
    # Add item to cart
    
@http.route('/api/v1/orders', type='json', auth='bearer', methods=['POST'], csrf=False)
def create_order(self, **post):
    # Create order from cart
```

### Testing (0.5 day)

```bash
# 1. Start Odoo
python -m odoo.bin.odoo -d test_db

# 2. Create test user
# Admin → Users → Create "testuser@example.com" / "password123"

# 3. Login
curl -X POST http://localhost:8069/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}'

# Response:
# {
#   "access_token": "eyJhbGc...",
#   "refresh_token": "...",
#   "user": {"id": 2, "name": "Test User", ...}
# }

# 4. Get products
curl -X GET 'http://localhost:8069/api/v1/products?limit=10' \
  -H "Authorization: Bearer <access_token>"

# 5. Get product detail
curl -X GET 'http://localhost:8069/api/v1/products/123' \
  -H "Authorization: Bearer <access_token>"
```

### Validation checklist

- [ ] Login returns valid JWT tokens
- [ ] Products endpoint returns paginated results
- [ ] Product detail includes variants + images
- [ ] Cart endpoints working (add, get, remove)
- [ ] Order creation working
- [ ] OpenAPI docs accessible at /api/v1/docs
- [ ] Error codes consistent (400, 401, 404, 500)
- [ ] Rate limiting working (100 req/min)

### Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Token expiration edge cases | Clear test plan for refresh flow |
| Product variant combinations complex | Simplify for V1, enhance V2 |
| Performance (N+1 queries) | Use select_related, prefetch_related |
| CORS issues (mobile app) | Enable CORS in controller headers |

---

## 🎯 SPIKE SUMMARY & GO/NO-GO DECISIONS

**Date POC completed** : [Fill in]

### Checklist

| POC | Success? | Issues | Effort estimate | Go/No-go |
|-----|----------|--------|-----------------|----------|
| **1. Konnect PSP** | ✅/❌ | [list] | [actual days] | ✅ Go / 🔴 No-go |
| **2. Autobacs Transport** | ✅/❌ | [list] | [actual days] | ✅ Go / 🔴 No-go |
| **3. Device Bridge** | ✅/❌ | [list] | [actual days] | ✅ Go / 🔴 No-go |
| **4. /api/v1** | ✅/❌ | [list] | [actual days] | ✅ Go / 🔴 No-go |

### Decision: GO TO V0?

**Criteria** :
- ✅ All 4 POCs at least "Green" (solvable with known effort)
- ✅ No "Red" risks without mitigation
- ✅ Effort estimates within 30% of planning

**Result** : [✅ YES / 🔴 NO]

**If YES** : Start V0 infra immediately (follow timeline)  
**If NO** : Re-plan spike, add resources, or adjust scope

---

**Spike completion date** : [Fill in]  
**Owner sign-off** : CTO [Name]  
**Stakeholder approval** : CEO [Name]
