const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const pug = require("pug")
const JZZ = require("jzz")

// config JSON files
const fConfigDefaultState = fs.readFileSync(path.join(__dirname, "config", "state.json"), { encoding: "utf8" })
const fConfigDgxPgmData = fs.readFileSync(path.join(__dirname, "config", "dgx_pgm_data.json"), { encoding: "utf8" })
cConfigDefaultState = JSON.parse(fConfigDefaultState)
cConfigDgxPgmData = JSON.parse(fConfigDgxPgmData)

// PUG components
const fUIMidi = fs.readFileSync(path.join(__dirname, "views", "components", "midi.pug"), { encoding: "utf8" })
const fUIPart = fs.readFileSync(path.join(__dirname, "views", "components", "part.pug"), { encoding: "utf8" })
const fUIPart_VoiceSelector = fs.readFileSync(path.join(__dirname, "views", "components", "part_voice-selector.pug"), { encoding: "utf8" })

const cUIMidi = pug.compile(fUIMidi)
const cUIPart = pug.compile(fUIPart)
const cUIPart_VoiceSelector = pug.compile(fUIPart_VoiceSelector)

const state = cConfigDefaultState

const midi = {
  ready: false,
  connected: false,
  output: null,
  outputs: [],

  codes: {
    cc: {
      msb: 0,
      lsb: 32,
      part_volume: 7,
      pan: 10,
      expression: 11,
      sustain: 64,
      harmonics: 71,
      release: 72,
      attack: 73,
      brightness: 74,
      portamento: 84,
      reverb: 91,
      chorus: 93,
      dsp: 94
    }
  }
}

function connectToMidiOut(name) {
  midi.output = JZZ().openMidiOut(name).or(() => {
      midi.connected = false
    }).and(() => {
      midi.connected = true
    })
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })

  // ---- IPC CONFIG ----
  // send configuration data to controller
  ipcMain.handle("config:get-max-parts", async (_) => { return 4 })

  // ---- IPC UI ----
  // send rendered pug ui components
  ipcMain.handle("ui:get-rendered-midi", async (_, id) => {
    return cUIMidi({ 
      ready: midi.ready, 
      connected: midi.connected,
      outputName: (midi.ready && midi.connected ? midi.output.name() : "undefined"),
      outputs: midi.outputs 
    }) 
  })

  ipcMain.handle("ui:get-rendered-part", async (_, id) => {
    return cUIPart({ id: id })
  })

  ipcMain.handle("ui:get-rendered-part_voice-selector", async (_, id) => {
    return cUIPart_VoiceSelector({ 
      id: id, 
      pgm_data: cConfigDgxPgmData, 
      category: state.parts[id].voice_category,
      program: state.parts[id].voice_program
    }) 
  })

  // ---- IPC API ----
  // handle main application functions
  ipcMain.handle("api:set-midi-output", async (_, name) => { 
    connectToMidiOut(name)
  })

  ipcMain.handle("api:set-part-voice-category", async (_, id, cat) => { 
    state.parts[id].voice_category = cat
    state.parts[id].voice_program = 0
  })

  ipcMain.handle("api:send-test-note", async (_) => {
    if (midi.connected) {
      midi.output.ch(0).noteOn('C5').wait(500).noteOff('C5') 
    }
  })

  ipcMain.handle("api:send-program-change", async(_, id, vox) => {
    state.parts[id].voice_program = vox
    if (midi.connected) {
      const cat = state.parts[id].voice_category
      const voice = cConfigDgxPgmData[cat].voices[vox]

      midi.output.ch(id).control(midi.codes.cc.lsb, voice.lsb)
      midi.output.ch(id).control(midi.codes.cc.msb, voice.msb)
      midi.output.ch(id).program(voice.pgm)
    }
  })

  ipcMain.handle("api:send-volume", async(_, ch, vol) => {
    state.parts[ch].volume = vol

    if (midi.connected) {
      midi.output.ch(ch).control(midi.codes.cc.part_volume, vol)
    }
  })

  ipcMain.handle("api:send-pan", async(_, ch, pan) => {
    state.parts[ch].pan = pan

    if (midi.connected) {
      midi.output.ch(ch).control(midi.codes.cc.pan, pan)
    }
  })

  win.loadFile(path.join(__dirname, "views/dgx.html"))
}

app.whenReady().then(() => {
  // start the midi engine
  JZZ().or(() => { midi.ready = false }).and(() => { midi.ready = true })

  if (midi.ready) {
    for (let i = 0; i < JZZ.info().outputs.length; i++) {
      const outputName = JZZ.info().outputs[i].name
      midi.outputs.push(outputName)

      if (outputName == state.midi.output_name) {
        connectToMidiOut(outputName)
      }
    }
  }

  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("before-quit", () => {
  if (midi.connected) {
    midi.output.close()
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

