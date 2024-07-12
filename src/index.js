const electron = require("electron");
const session = electron.session;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const { spawn } = require('child_process');
const path = require('path');
const ipcMain = electron.ipcMain;

app.disableHardwareAcceleration()

let win = null;
let splash = null;
let notsplash = false;
let firstchange = true;

const createWindow = ()  => {
  win = new BrowserWindow({
    frame: false,
    width: 400,
    height: 610,
    minHeight: 430,
    minWidth: 300,
    maxHeight: 640,
    maxWidth: 400,
    maximizable: false,
    show: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    icon: path.join(__dirname, "icon.png"),
    opacity: 0.97,
    x: electron.screen.getPrimaryDisplay().bounds.width - 400,
    y: electron.screen.getPrimaryDisplay().bounds.height - 650,
  });

  localwin = new BrowserWindow({
    frame: false,
    width: 400,
    height: 640,
    minHeight: 430,
    minWidth: 300,
    maxHeight: 640,
    maxWidth: 400,
    maximizable: false,
    show: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    icon: path.join(__dirname, "icon.png"),
    opacity: 0.97,
    x: electron.screen.getPrimaryDisplay().bounds.width - 400,
    y: electron.screen.getPrimaryDisplay().bounds.height - 680,
  });

  splash = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    show: true,
    icon: path.join(__dirname, "icon.png"),
  });

  require("@electron/remote/main").initialize();
  require("@electron/remote/main").enable(splash.webContents);
  splash.loadFile('splash.html');
  splash.center();
  win.removeMenu();
  win.loadURL('https://gemini.google.com/');
  localwin.loadFile('local.html');
  localwin.removeMenu();

  if (notsplash === true) {
    console.log('Not executed');
  } else {
    win.webContents.on('did-finish-load', function () {
      splash.hide();
      win.show();
      notsplash = true;

      // Inject JavaScript to add a button and bind it to a function
      win.webContents.executeJavaScript(`
        const button = document.createElement('button');
        button.innerText = 'Change To Local AI';
        button.id = 'my-button'; 
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = 1000;
        document.body.appendChild(button);

        button.addEventListener('click', () => {
          // Send a message to the main process when clicked
          require('electron').ipcRenderer.send('button-clicked'); 
        });
      `);
    });

    win.on('close', function () {
      app.quit();
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  // Register global shortcut "Ctrl + Shift + X" or "Command + Shift + X"
  const ret = globalShortcut.register('CommandOrControl+Shift+X', () => {
    if (win) {
      win.show();
      win.focus();
    }
  });

  if (!ret) {
    console.error('Failed to register global shortcut');
  }
});
ipcMain.on('button-clicked', (event) => {
console.log("Visibility change button clicked!");
if (firstchange === true){
    // Also inject the button to the localwin too
    localwin.webContents.executeJavaScript(`
        const button = document.createElement('button');
        button.innerText = 'Change To Gemini';

        button.addEventListener('click', () => {
          // Send a message to the main process when clicked
          require('electron').ipcRenderer.send('button-clicked'); 
        });
      `);

}
if (win.isVisible()) {
  win.hide();
  localwin.show();
} else {
  localwin.hide();
  win.show();
}
});

app.on('will-quit', () => {
  // Unregister the global shortcut when the app is about to quit
  globalShortcut.unregisterAll();
});
