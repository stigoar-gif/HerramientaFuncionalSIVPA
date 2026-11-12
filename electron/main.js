const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const API_BASE_URL = 'http://127.0.0.1:8000';

function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('api:get-products', async () => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  if (!response.ok) throw new Error(`Error ${response.status} al obtener productos`);
  return response.json();
});

ipcMain.handle('api:create-product', async (_event, data) => {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
  return response.json();
});

ipcMain.handle('api:update-product', async (_event, sku, data) => {
  const response = await fetch(`${API_BASE_URL}/api/products/${sku}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
  return response.json();
});

ipcMain.handle('api:get-movements', async () => {
  const response = await fetch(`${API_BASE_URL}/api/inventory/movements`);
  if (!response.ok) throw new Error(`Error ${response.status} al obtener movimientos`);
  return response.json();
});

ipcMain.handle('api:create-movement', async (_event, data) => {
  const response = await fetch(`${API_BASE_URL}/api/inventory/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
  return response.json();
});

ipcMain.handle('api:get-sales', async () => {
  const response = await fetch(`${API_BASE_URL}/api/sales`);
  if (!response.ok) throw new Error(`Error ${response.status} al obtener ventas`);
  return response.json();
});

ipcMain.handle('api:create-sale', async (_event, data) => {
  const response = await fetch(`${API_BASE_URL}/api/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
  return response.json();
});
