const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('dgxAPI', {
  maxVoices: () => ipcRenderer.invoke('get-max-voices'),
  renderedVoice: (i) => ipcRenderer.invoke('ui:get-rendered-voice', i)
})
