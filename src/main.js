const { app, BrowserWindow, ipcMain } = require('electron');
const os = require('os');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use a preload script to expose necessary APIs
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // Point to your React app's local development server
}

app.on('ready', createWindow);

ipcMain.handle('get-wifi-status', () => {
  const networkInterfaces = os.networkInterfaces();
  let wifiStatus = false;

  for (const iface of Object.values(networkInterfaces)) {
    for (const { family, internal, mac } of iface) {
      if (family === 'IPv4' && !internal && mac !== '00:00:00:00:00:00') {
        wifiStatus = true;
        break;
      }
    }
    if (wifiStatus) break;
  }

  return wifiStatus;
});
