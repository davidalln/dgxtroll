const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("dgxAPI", {
  maxParts: () => ipcRenderer.invoke("config:get-max-parts"),
  dgxPgmData: () => ipcRenderer.invoke("config:get-dgx-program-data"),

  renderedMidi: (id) => ipcRenderer.invoke("ui:get-rendered-midi"),
  renderedPart: (id) => ipcRenderer.invoke("ui:get-rendered-part", id),

  getMIDIOutputs: () => ipcRenderer.invoke("midi:get-outputs")
})

