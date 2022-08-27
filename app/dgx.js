const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const pug = require("pug")
const JZZ = require("jzz")

const fConfigDgxPgmData = fs.readFileSync(path.join(__dirname, "config", "dgx_pgm_data.json"), { encoding: "utf8" })
compiledConfigDgxPgmData = JSON.parse(fConfigDgxPgmData)

const fUIMidi = fs.readFileSync(path.join(__dirname, "views", "components", "midi.pug"), { encoding: "utf8" })
const fUIVoice = fs.readFileSync(path.join(__dirname, "views", "components", "part.pug"), { encoding: "utf8" })
const compiledUIMidi = pug.compile(fUIMidi)
const compiledUIPart = pug.compile(fUIVoice)


const midi = {
  ready: false,
  outputs: []
}

/*
function connectMIDI () {
  navigator.requestMIDIAccess().then(
    (access) => {
      const scanMidiDevices = (_access) => {
        midi.outputs = []

        const outputs = _access.outputs.values()
        for (let outputs = outputs.next(); output && !output.done; output = outputs.next()) {
          midi.outputs.push(output.value)
        }

        midi.ready = true
      }

      access.addEventListener('statechange', (event) => scanMidiDevices(event.target))
      scanMidiDevices(access)
    },
    (err) => {
      console.log("ERROR")
      midi.ready = false

      throw(err)
    }
  )
}
*/

function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })

  JZZ().or("Cannot start MIDI enginge")

  // ---- IPC CONFIG ----
  // send configuration data to controller
  ipcMain.handle("config:get-max-parts", async (_) => { return 4 })
  ipcMain.handle("config:get-dgx-program-data", async (_) => {
    return compiledConfigDgxPgmData
  })

  // ---- IPC UI ----
  // send rendered pug ui components
  ipcMain.handle("ui:get-rendered-midi", async (_, id) => {
    outputs = []

    for (let i = 0; i < JZZ.info().outputs.length; i++) {
      outputs.push(JZZ.info().outputs[i].name)
    }

    return compiledUIMidi({ outputs: outputs }) 
  })
  ipcMain.handle("ui:get-rendered-part", async (_, id) => {
    return compiledUIPart({ 
      id: id, 
      pgm_data: compiledConfigDgxPgmData, 
      default_category: 1 }
    ) 
  })

  // ---- IPC MIDI ----
  // handle midi ports and data
  ipcMain.handle("midi:get-outputs", async (_) => {
    midi.ouputs = []
    for (let i = 0; i < JZZ.info().outputs.length; i++) {
      midi.outputs.push(JZZ.info().outputs[i].name)
    }
    return midi.outputs
  })

  win.loadFile(path.join(__dirname, "views/dgx.html"))
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

