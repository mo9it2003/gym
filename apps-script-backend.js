// ============================================================
//  IRONFORGE — Google Apps Script Backend
//  Paste this ENTIRE file into script.google.com
// ============================================================

// This script uses a Google Spreadsheet as your database.
// It creates two sheets automatically: "products" and "orders"

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getProducts') return respond(getProducts());
  if (action === 'getOrders')   return respond(getOrders());
  return respond({ error: 'Unknown action' });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  if (action === 'addProduct')    return respond(addProduct(data.product));
  if (action === 'deleteProduct') return respond(deleteProduct(data.id));
  if (action === 'addOrder')      return respond(addOrder(data.order));
  if (action === 'updateOrder')   return respond(updateOrder(data.id, data.status));
  if (action === 'deleteOrder')   return respond(deleteOrder(data.id));
  return respond({ error: 'Unknown action' });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── SPREADSHEET HELPERS ──────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'products') {
      sheet.appendRow(['id','name','price','cat','emoji','desc','image']);
    }
    if (name === 'orders') {
      sheet.appendRow(['id','customerName','phone','email','address','items','total','status','time']);
    }
  }
  return sheet;
}

// ── PRODUCTS ────────────────────────────────────────────────

function getProducts() {
  const sheet = getSheet('products');
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { products: [] };
  const products = rows.slice(1).map(r => ({
    id: r[0], name: r[1], price: r[2],
    cat: r[3], emoji: r[4], desc: r[5], image: r[6] || null
  }));
  return { products };
}

function addProduct(p) {
  const sheet = getSheet('products');
  sheet.appendRow([p.id, p.name, p.price, p.cat||'', p.emoji||'📦', p.desc||'', p.image||'']);
  return { success: true };
}

function deleteProduct(id) {
  const sheet = getSheet('products');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

// ── ORDERS ──────────────────────────────────────────────────

function getOrders() {
  const sheet = getSheet('orders');
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { orders: [] };
  const orders = rows.slice(1).reverse().map(r => ({
    id: r[0],
    customer: { name: r[1], phone: r[2], email: r[3], address: r[4] },
    items: JSON.parse(r[5] || '[]'),
    total: r[6],
    status: r[7],
    time: r[8]
  }));
  return { orders };
}

function addOrder(o) {
  const sheet = getSheet('orders');
  sheet.appendRow([
    o.id,
    o.customer.name,
    o.customer.phone,
    o.customer.email || '',
    o.customer.address,
    JSON.stringify(o.items),
    o.total,
    o.status,
    o.time
  ]);
  return { success: true };
}

function updateOrder(id, status) {
  const sheet = getSheet('orders');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.getRange(i + 1, 8).setValue(status); // column 8 = status
      return { success: true };
    }
  }
  return { success: false };
}

function deleteOrder(id) {
  const sheet = getSheet('orders');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}


// ============================================================
//  SETUP GUIDE — Follow these steps ONCE
// ============================================================
//
//  STEP 1: Go to https://script.google.com
//  STEP 2: Click "New project" (top left)
//  STEP 3: Delete all existing code in the editor
//  STEP 4: Paste THIS entire file
//  STEP 5: Click the floppy disk icon to Save (Ctrl+S)
//  STEP 6: Click "Deploy" (blue button, top right)
//  STEP 7: Choose "New deployment"
//  STEP 8: Click the gear icon ⚙ next to "Type" → select "Web app"
//  STEP 9: Fill in:
//            Description: IRONFORGE Store
//            Execute as: Me
//            Who has access: Anyone
//  STEP 10: Click "Deploy"
//  STEP 11: If asked, click "Authorize access" and allow permissions
//  STEP 12: COPY the "Web app URL" that appears
//            It looks like: https://script.google.com/macros/s/XXXXX/exec
//
//  STEP 13: Open your gym-store.html in a browser
//  STEP 14: Paste that URL in the yellow setup banner at the top
//  STEP 15: Click SAVE & CONNECT
//
//  ✅ Done! Products and orders now sync across ALL phones and devices.
//
//  NOTE: Your data will also appear in a Google Spreadsheet.
//  Go to Google Drive → you'll see a new file called "Untitled spreadsheet"
//  Rename it to "IRONFORGE Store" for easy access.
//
//  IMPORTANT: Every time you re-deploy (after editing code),
//  choose "Deploy" → "Manage deployments" → edit the existing one.
//  Do NOT create a new deployment each time (the URL would change).
//
// ============================================================
