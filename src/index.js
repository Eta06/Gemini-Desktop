const electron = require("electron");
const session = electron.session;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const { spawn } = require('child_process');

const path = require('path');

app.disableHardwareAcceleration()

let win = null;
let splash = null;
let notsplash = false;

const createWindow = () => {
  win = new BrowserWindow({
    frame: false,
    width: 400,
    height: 610,
    minHeight: 400,
    minWidth: 300,
    maxHeight: 610,
    maxWidth: 400,
    maximizable: false,
    show: false,
    webPreferences: { nodeIntegration: true },
    icon: path.join(__dirname, "icon.png"),
    opacity: 0.97,
    x: electron.screen.getPrimaryDisplay().bounds.width - 400,
    y: electron.screen.getPrimaryDisplay().bounds.height - 650,
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
  win.loadURL('https://bard.google.com/', {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
  });

  if (notsplash === true) {
    console.log('Not executed');
  } else {
    win.webContents.on('did-finish-load', function () {
      //If you want to make integration with python script, you can use this code
      session.defaultSession.cookies.get({ url: 'https://www.bard.google.com', name: '__Secure-1PSID'})
      .then((cookies) => {
        const cookie = cookies[0]; 
        const cookieValue = cookie.value;
      }).catch((error) => {
        console.log(error)
      })
      splash.hide();
      win.show();
      notsplash = true;
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

app.on('will-quit', () => {
  // Unregister the global shortcut when the app is about to quit
  globalShortcut.unregisterAll();
});
