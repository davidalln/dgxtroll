const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("dgxAPI", {
  maxParts: () => ipcRenderer.invoke("config:get-max-parts"),

  renderedMidi: (id) => ipcRenderer.invoke("ui:get-rendered-midi"),
  renderedPart: (id) => ipcRenderer.invoke("ui:get-rendered-part", id),
  renderedPart_VoiceSelector: (id) => ipcRenderer.invoke("ui:get-rendered-part_voice-selector", id),

  getMIDIOutputs: () => ipcRenderer.invoke("midi:get-outputs")
})

