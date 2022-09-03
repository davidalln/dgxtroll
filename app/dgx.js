const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const pug = require("pug")

function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })

  ipcMain.handle("api:get-dgx-bank", async function () { return {
    activeChannels: 4,
    activeNotes: 4
  }})

  const components = [
    "channel",
    "note"
  ]

  const mixins = [
    "control_inputs"
  ]

  let fmix = ""
  mixins.forEach((mixin) => {
    fmix += 
      fs.readFileSync(
        path.join(__dirname, "views", "components", "mixins", `${mixin}.pug`), {
          encoding: "utf8"
        }
      ) 
      + '\n'
  })

  components.forEach((component) => {
    ipcMain.handle(`ui:render-ui-${component}`, async function (_, cid) {
      const fui = fs.readFileSync(
        path.join(__dirname, "views", "components", `${component}.pug`), { 
          encoding: "utf8" 
        }
      )

      return pug.compile(fmix + fui)({
        cid: cid
      })
    })
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

/*
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
const fUIPart = fs.readFileSync(path.join(__dirname, "views", "components", "channel.pug"), { encoding: "utf8" })

const cUIMidi = pug.compile(fUIMidi)
const cUIPart = pug.compile(fUIPart)

const state = cConfigDefaultState

const domToMidi = [
    0,   1,   3,   4,   5,   6,   8,   9,  10,  11,
   13,  14,  15,  17,  18,  19,  20,  22,  23,  24,
   25,  27,  28,  29,  30,  32,  33,  34,  36,  37,
   38,  39,  41,  42,  43,  44,  46,  47,  48,  50,
   51,  52,  53,  55,  56,  57,  58,  60,  61,  62,
   64,  65,  66,  67,  69,  70,  71,  72,  74,  75,
   76,  77,  79,  80,  81,  83,  84,  85,  86,  88,
   89,  90,  91,  93,  94,  95,  97,  98,  99, 100,
  102, 103, 104, 105, 107, 108, 109, 110, 112, 113,
  114, 116, 117, 118, 119, 121, 122, 123, 124, 126,
  127,
]

const midiToDom = [
   0,  1,  2,  2,  3,  4,  5,  6,
   6,  7,  8,  9,  9, 10, 11, 12,
  13, 13, 14, 15, 16, 17, 17, 18,
  19, 20, 21, 21, 22, 23, 24, 24,
  25, 26, 27, 28, 28, 29, 30, 31,
  32, 32, 33, 34, 35, 36, 36, 37,
  38, 39, 39, 40, 41, 42, 43, 43,
  44, 45, 46, 47, 47, 48, 49, 50,
  51, 51, 52, 53, 54, 54, 55, 56,
  57, 58, 58, 59, 60, 61, 62, 62,
  63, 64, 65, 65, 66, 67, 68, 69,
  69, 70, 71, 72, 73, 73, 74, 75,
  76, 77, 77, 78, 79, 80, 80, 81,
  82, 83, 84, 84, 85, 86, 87, 88,
  88, 89, 90, 91, 92, 92, 93, 94,
  95, 95, 96, 97, 98, 99, 99,100,
]

const midi = {
  ready: false,
  connected: false,
  output: null,
  outputs: [],

  // from DGX300 MIDI Implementation Chart
  mapControl: {
    part_msb: 0,
    part_lsb: 32,
    part_volume: 7,
    part_pan: 10,
    part_attack: 73,
    part_release: 72,
    part_expression: 11,
    part_harmonics: 71,
    part_brightness: 74,
    part_reverb: 91,
    part_chorus: 93,
    part_dsp: 94
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
  ipcMain.handle("config:get-max-parts", async (_) => { return state.parts.length })

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

  ipcMain.handle("ui:get-rendered-part", async (_, ch) => {
    return cUIPart({
      ch: ch,
      midiToDom: midiToDom,
      part_values: state.parts[ch]
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

  ipcMain.handle("api:set-active-note-recv", async (_, id, recv, val) => {
    switch (recv) {
      case "keys":
        
        break
    }
  })

  ipcMain.handle("api:send-test-note", async (_) => {
    if (midi.connected) {
      midi.output.ch(0).noteOn('C5').wait(500).noteOff('C5') 
    }
  })

  ipcMain.handle("api:send-note-on", async(_, ch, note) => {
    if (midi.connected) {
      midi.output.ch(ch).noteOn(note)
    }
  })

  ipcMain.handle("api:send-note-off", async(_, ch, note) => {
    if (midi.connected) {
      midi.output.ch(ch).noteOff(note)
    }
  })

  ipcMain.handle("api:send-program-change", async(_, id, vox) => {
    state.parts[id].voice_program = vox
    if (midi.connected) {
      const cat = state.parts[id].voice_category
      const voice = cConfigDgxPgmData[cat].voices[vox]

      midi.output.ch(id).control(midi.mapControl.part_lsb, voice.lsb)
      midi.output.ch(id).control(midi.mapControl.part_msb, voice.msb)
      midi.output.ch(id).program(voice.pgm)
    }
  })

  ipcMain.handle("api:send-control", async(_, ch, cc, val) => {
    if (midi.connected) {
      console.log(`ch ${ch} cc ${cc} ${midi.mapControl[cc]} val ${val}`)
      midi.output.ch(ch).control(midi.mapControl[cc], domToMidi[val])
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
*/
