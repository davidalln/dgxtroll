const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const pug = require("pug")
const JZZ = require("jzz")

const midi = {
  ready: false,
  output: undefined,
  output_error: undefined,

  isConnectedToOutput: function () {
    return this.output !== undefined
  }
}

const bank = {
  activeChannels: 2,
  activeNotes: 2,

  note: {
    modeChord_MaxNotes: 6 
  }
}

const control_links = {
  midi: {
    input_device:   { type: "midi-connect", port: "input" },
    output_device:  { type: "midi-connect", port: "output" },
  },
  ch: {
    note_on:        { type: "note", action: "on" },
    note_off:       { type: "note", action: "off" },
    volume:         { type: "cc", cc: 7 },
    pan:            { type: "cc", cc: 10 },
    expression:     { type: "cc", cc: 11 },
    attack:         { type: "cc", cc: 73 },
    release:        { type: "cc", cc: 72 },
    harmonics:      { type: "cc", cc: 71 },
    brightness:     { type: "cc", cc: 74 },
    reverb:         { type: "cc", cc: 91 },
    chorus:         { type: "cc", cc: 93 },
    dsp:            { type: "cc", cc: 94 },

    pgm_category: [
      {
        label: "E. Piano",
        pgm_voice: [ 
          { type: "pgm", msb: 0, lsb: 114, pgm: 4, label: "Galaxy EP" },
          { type: "pgm", msb: 0, lsb: 112, pgm: 4, label: "Funky Electric Piano" },
          { type: "pgm", msb: 0, lsb: 112, pgm: 5, label: "DX Modern Elec. Piano" },
          { type: "pgm", msb: 0, lsb: 113, pgm: 5, label: "Hyper Tines" },
          { type: "pgm", msb: 0, lsb: 114, pgm: 5, label: "Venus Electric Piano" },
          { type: "pgm", msb: 0, lsb: 112, pgm: 7, label: "Clavi" }
        ]
      },
      {
        label: "Synth Pads",
        pgm_voice: [
          { type: "pgm", msb: 0, lsb: 0, pgm: 88, label: "New Age Pad" },
          { type: "pgm", msb: 0, lsb: 64, pgm: 88, label: "Fantasy" },
          { type: "pgm", msb: 0, lsb: 0, pgm: 89, label: "Warm Pad" }
        ]
      }
    ]
  },
  note: {
  },
  dsp: {
  },
  bank: {
  }
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })

  // API
  ipcMain.handle("api:get-dgx-bank", async function () { return bank })
  ipcMain.handle("api:get-global-options", async function (_, options) {
    if (options === undefined) {
      options = ["midi", "ch"]
    }

    global = {}

    options.forEach((option) => {
      global[option] = {}

      switch (option) {
        case "midi":
          global.midi.ready = midi.ready

          if (midi.ready) {
            ["input", "output"].forEach((put) => {
              global.midi[`${put}_device`] = []
              JZZ.info()[`${put}s`].forEach((device) => {
                global.midi[`${put}_device`].push({ label: device.id })
              })
            })

            if (midi.isConnectedToOutput()) {
              global.midi["output_status"] = { label: `Connected to ${midi.output.name()}` }
            } else if (midi.output_error !== undefined) {
              global.midi["output_status"] = { label: `ERROR: ${midi.output_error} (Disconnected)` }
            } else {
              global.midi["output_status"] = { label: "Ready (Disconnected)" }
            }
          }
          break

        case "ch":
          global[option].pgm_category = control_links.ch.pgm_category
          break
      }
    })

    return global
  })

  ipcMain.handle("api:send-control-input", async function(_, name, id, control, value) {
    const ctrlDepths = control.split("-")
    const valueDepths = value.split("-")

    let link = control_links[name]
    for (let d = 0; d < Math.min(ctrlDepths.length, valueDepths.length); d++) {
      link = link[ctrlDepths[d]] 
      if (Array.isArray(link)) {
        link = link[valueDepths[d]]
      }
    }

    if (link !== undefined && "type" in link) {
      switch (link.type) {
        case "pgm":
          if (midi.isConnectedToOutput()) {
            midi.output.ch(id).control(32, link.lsb)
            midi.output.ch(id).control(0, link.msb)
            midi.output.ch(id).program(link.pgm)

            console.log(`sending program change [${link.msb},${link.lsb},${link.pgm}]`)
          } else {
            console.log(`WARNING: cannot send program change, midi is not connected to output`)
          }
          break

        case "cc":
          if (midi.isConnectedToOutput()) {
            midi.output.ch(id).control(link.cc, value)
            console.log(`sending ${value} to cc ${link.cc} on ch ${id}`)
          } else {
            console.log(`WARNING: cannot send CC, midi is not connected to output`)
          }
          break

        case "note":
          if (midi.isConnectedToOutput()) {
            midi.output.ch(id).noteOn(value).wait(500).noteOff(value)
          } else {
            console.log(`WARNING: cannot play note, midi is not connected to output`)
          }
          break

        case "midi-connect":
          switch (link.port) {
            case "input":
              console.log(`WARNING: midi-connect input unimplemented`)
              break
            case "output":
              if (midi.ready) {
                if (midi.isConnectedToOutput()) {
                  midi.output.close()
                }

                JZZ().openMidiOut(value).or(() => {
                  midi.output_error = `Cannot connect to ${value}`
                  midi.output = undefined
                }).and(function () {
                  midi.output_error = undefined
                  midi.output = this
                })
              }

              win.webContents.send("ui:flash-control", name, id, "output_status")
              break
          }
          break
      }
    } else {
      console.log(`WARNING: no link found (${name}, ${id}, ${control}, ${value})`)
    }
  })

  // UI
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

  ipcMain.handle("ui:render-component", async function(_, component, id) {
    const fui = fs.readFileSync(
      path.join(__dirname, "views", "components", `${component}.pug`), { 
        encoding: "utf8" 
      }
    )

    return pug.compile(fmix + fui)({
      cid: id,
      bank: bank
    })
  })

  win.loadFile(path.join(__dirname, "views/dgx.html"))
}


app.whenReady().then(() => {
  JZZ().or(() => { midi.ready = false }).and(() => { midi.ready = true })

  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("before-quit", () => {
  if (midi.isConnectedToOutput()) {
    midi.output.close()
  }
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
