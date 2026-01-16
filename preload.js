const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
    startConversion: (files, outputDir, format, quality) => ipcRenderer.send('conversion:start', { files, outputDir, format, quality }),
    onProgress: (callback) => {
        // Clean up previous listeners to avoid duplicates if re-registered (though typically registered once)
        ipcRenderer.removeAllListeners('conversion:progress');
        ipcRenderer.on('conversion:progress', (event, data) => callback(data));
    }
});
