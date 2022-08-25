const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const pug = require('pug')

function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const compiledVoiceUI = pug.compileFile(path.join(__dirname, 'voice.pug'))
  ipcMain.handle('get-max-voices', async () => { return 4 })
  ipcMain.handle('ui:get-rendered-voice', async (event, i) => {
    return compiledVoiceUI({ id: i }) 
  })

  win.loadFile(path.join(__dirname, 'dgx.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

