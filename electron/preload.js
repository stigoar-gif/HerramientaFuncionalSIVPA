const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  productos: {
    listar: () => ipcRenderer.invoke('api:get-products'),
    crear: (data) => ipcRenderer.invoke('api:create-product', data),
    actualizar: (sku, data) => ipcRenderer.invoke('api:update-product', sku, data),
  },
  inventario: {
    listar: () => ipcRenderer.invoke('api:get-movements'),
    registrar: (data) => ipcRenderer.invoke('api:create-movement', data),
  },
  ventas: {
    listar: () => ipcRenderer.invoke('api:get-sales'),
    registrar: (data) => ipcRenderer.invoke('api:create-sale', data),
  },
});
