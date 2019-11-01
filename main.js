const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')

let win

function createWindow () {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')

    // Open the DevTools.
    //win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })

    autoUpdater.checkForUpdatesAndNotify();
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() })
})

autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
})

autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
})

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
})
