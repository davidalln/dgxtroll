const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("dgxAPI", {
  maxParts: () => ipcRenderer.invoke("config:get-max-parts"),

  renderedMidi: (id) => ipcRenderer.invoke("ui:get-rendered-midi"),
  renderedPart: (id) => ipcRenderer.invoke("ui:get-rendered-part", id),
  renderedPart_VoiceSelector: (id) => ipcRenderer.invoke("ui:get-rendered-part_voice-selector", id),

  setMidiOutput: (name) => ipcRenderer.invoke("api:set-midi-output", name),
  setPartVoiceCategory: (id, cat) => ipcRenderer.invoke("api:set-part-voice-category", id, cat),

  sendTestNote: () => ipcRenderer.invoke("api:send-test-note"),
  sendProgramChange: (id, vox) => ipcRenderer.invoke("api:send-program-change", id, vox),
  sendVolume: (ch, vol) => ipcRenderer.invoke("api:send-volume", ch, vol),
  sendPan: (ch, pan) => ipcRenderer.invoke("api:send-pan", ch, pan),
})

