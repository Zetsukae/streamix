const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // --- FENÊTRE & SYSTÈME ---
  minimize: () => ipcRenderer.invoke("minimize-window"),
                                close: () => ipcRenderer.invoke("close-window"),
                                restart: () => ipcRenderer.invoke("restart-app"),

                                // --- MENU F1 (C'est cette ligne qui manquait/ne fonctionnait pas) ---
                                triggerF1Menu: () => ipcRenderer.invoke("trigger-f1-menu"),

                                // --- CONFIGURATION ---
                                saveConfig: (config) => ipcRenderer.invoke("save-config", config),
                                getPreferences: () => ipcRenderer.invoke("get-preferences"),
                                resetApp: () => ipcRenderer.invoke("reset-application"),

                                // --- PARAMÈTRES (Fenêtre Settings) ---
                                openSettings: () => ipcRenderer.invoke("open-settings"),
                                closeSettings: () => ipcRenderer.invoke("close-settings"),

                                // --- PLUGINS ---
                                getPlugins: () => ipcRenderer.invoke("get-plugins"),
                                selectPluginFile: () => ipcRenderer.invoke("select-plugin-file"),
                                removePlugin: (path) => ipcRenderer.invoke("remove-plugin", path),

                                // --- DIVERS ---
                                openExternal: (url) => ipcRenderer.invoke("open-external-link", url),

                                // --- BRIDGE SYNC (Données du site) ---
                                syncData: (payload) => ipcRenderer.send("bridge-sync-data", payload)
});

// Écouteur pour le stockage local (Bridge)
ipcRenderer.on("streamix-storage-command", (event, command) => {
  window.postMessage({ type: "streamix-storage-command", ...command }, "*");
});
