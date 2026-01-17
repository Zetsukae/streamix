const { app, BrowserWindow, ipcMain, Menu, shell, dialog, session } = require("electron")
const path = require("node:path")
const fs = require("fs")
const { locales } = require("./locales")
const Store = require("electron-store")

// Import du menu clic droit
const setupContextMenu = require("./contextMenu")

const store = new Store({
  defaults: {
    config: {
      language: "fr",
      sourceUrl: "",
      windowStyle: "default",
      homeButtonBehavior: "menu",
      experimentalEnabled: false,
      animationsEnabled: true
    },
    plugins: [],
    siteData: {}
  }
})

let mainWindow
let settingsWindow = null

function createWindow() {
  const config = store.get("config")
  const isWindowsStyle = config.windowStyle === "windows"

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, "assets", "icon.png"),
                                 webPreferences: {
                                   nodeIntegration: false,
                                   contextIsolation: true,
                                   webSecurity: true,
                                   devTools: true,
                                   preload: path.join(__dirname, "preload.js"),
                                 },
                                 show: false,
                                 autoHideMenuBar: true,
                                 frame: isWindowsStyle,
                                 backgroundColor: '#0a0a0a'
  })

  // 1. Activation du menu clic droit
  setupContextMenu(mainWindow);

  // 2. CORRECTION GOOGLE 403 & SIGNATURE APP
  let ua = mainWindow.webContents.getUserAgent();
  // On retire "Electron/x.x.x" pour que Google accepte la connexion
  ua = ua.replace(/Electron\/[0-9\.]+\s?/, "");
  // On nettoie les doublons potentiels
  ua = ua.replace(/StreamixApp\s?/, "").trim();
  // On ajoute la signature pour security.js
  const finalUA = `${ua} StreamixApp`;
  mainWindow.webContents.setUserAgent(finalUA);

  // 3. SÉCURITÉ : Key dans les Headers
  if (config.sourceUrl) {
    const filter = { urls: [config.sourceUrl + "*"] };
    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      details.requestHeaders['X-Streamix-Key'] = 'zetsukaedagoat';
      callback({ requestHeaders: details.requestHeaders });
    });
  }

  // Démarrage
  const url = config.sourceUrl || "";
  if (url && (url.includes(".github.io/") || url.includes("anime-sama"))) {
    mainWindow.loadURL(url)
  } else {
    loadSetupScreen()
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  })

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F1" && input.type === "keyDown" && !input.control && !input.alt && !input.shift && !input.meta) {
      event.preventDefault();
      injectF1MenuScript(mainWindow);
    }
  });

  // --- INJECTIONS (Overlay & CSS) ---
  mainWindow.webContents.on("did-finish-load", () => {
    const currentUrl = mainWindow.webContents.getURL()
    if (currentUrl.startsWith("file:")) return

      const config = store.get("config")

      // A. Animation CSS
      if (config.animationsEnabled !== false) {
        try {
          const cssPath = path.join(__dirname, 'animations.css');
          if (fs.existsSync(cssPath)) {
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            mainWindow.webContents.insertCSS(cssContent);
          }
        } catch (e) { console.error(e); }
      }

      const isWindowsStyle = config.windowStyle === "windows"

      // B. Overlay & Drag Zone
      const overlayScript = `
      (function() {
        if (document.getElementById('streamix-overlay-root')) return;
        const root = document.createElement('div'); root.id = 'streamix-overlay-root'; document.body.appendChild(root);

        const style = document.createElement('style');
        style.textContent = \`
        .streamix-btn {
          width: 32px !important; height: 32px !important; border: none !important; border-radius: 8px !important;
          cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important;
          background: rgba(0, 0, 0, 0.5) !important; color: #ffffff !important; backdrop-filter: blur(10px) !important;
          -webkit-app-region: no-drag !important; pointer-events: auto !important; z-index: 2147483647 !important;
          transition: background 0.3s ease !important;
        }
        .streamix-btn:hover { background: rgba(255, 255, 255, 0.2) !important; }
        .streamix-btn img { pointer-events: none !important; width: 30px !important; height: 30px !important; }

        /* CORRECTION DRAG ZONE : Hauteur 32px exacte */
        #streamix-drag-zone { position: fixed; top: 0; left: 0; width: 100%; height: 32px; z-index: 2147483646; -webkit-app-region: drag; pointer-events: none; }
        \`;
        root.appendChild(style);

        const dragZone = document.createElement('div'); dragZone.id = 'streamix-drag-zone'; root.appendChild(dragZone);

        const homeBtn = document.createElement('button'); homeBtn.className = 'streamix-btn'; homeBtn.id = 'streamix-home-btn';
        homeBtn.style.cssText = 'position: fixed !important; top: 10px !important; left: 10px !important; background: transparent !important; backdrop-filter: none !important;';
        homeBtn.innerHTML = '<img src="https://i.imgur.com/lv3zp1J.png" alt="Home">';
        homeBtn.onclick = () => window.electronAPI.triggerF1Menu();
        root.appendChild(homeBtn);

        if (${!isWindowsStyle}) {
          const c = document.createElement('div');
          c.id = 'window-controls';
          c.style.cssText = 'position: fixed !important; top: 10px !important; right: 10px !important; display: flex !important; gap: 8px !important; z-index: 2147483647 !important;';
          const m = document.createElement('button'); m.className = 'streamix-btn'; m.textContent = '─'; m.onclick = () => window.electronAPI.minimize();
          const x = document.createElement('button'); x.className = 'streamix-btn'; x.textContent = '✕'; x.onclick = () => window.electronAPI.close();
          c.appendChild(m); c.appendChild(x); root.appendChild(c);
        }
      })();
      `;
      mainWindow.webContents.executeJavaScript(overlayScript).catch(() => {});

      // C. Bridge Sync
      const bridgeScript = `
      (function() {
        if (window.StreamixStorage) {
          const initialData = window.StreamixStorage.getAll();
          if(window.electronAPI && window.electronAPI.syncData) {
            window.electronAPI.syncData({ type: 'init', data: initialData });
          }
          window.addEventListener("streamix-storage-change", (event) => {
            if(window.electronAPI && window.electronAPI.syncData) {
              window.electronAPI.syncData({
                type: 'update',
                key: event.detail.key,
                value: event.detail.value,
                allData: event.detail.allData
              });
            }
          });
        }
      })();
      `;
      mainWindow.webContents.executeJavaScript(bridgeScript).catch(() => {});
  })

  // Navigation & Google Auth
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const config = store.get("config");
    try {
      const targetUrl = new URL(url);
      const sourceUrl = config.sourceUrl ? new URL(config.sourceUrl) : null;
      if (
        (sourceUrl && targetUrl.hostname.includes(sourceUrl.hostname)) ||
        url.includes("anime-sama") ||
        url.includes("accounts.google.com") // AUTORISER GOOGLE LOGIN INTERNE
      ) {
        mainWindow.loadURL(url);
        return { action: "deny" };
      }
    } catch (e) { }
    shell.openExternal(url);
    return { action: "deny" };
  })
}

// --- CORRECTION DU BUG DE SCRIPT F1 ---
function injectF1MenuScript(win) {
  if (!win || win.isDestroyed()) return;
  const config = store.get("config");

  // Récupération sécurisée des textes
  const lang = config.language || 'fr';
  const t = (locales[lang] || locales.fr).f1Menu;
  const homeUrl = config.sourceUrl || "about:blank";
  const animsEnabled = config.animationsEnabled !== false;

  // JSON.stringify protège les chaînes contenant des apostrophes (ex: "L'accueil")
  const txtHome = JSON.stringify(t.home);
  const txtRefresh = JSON.stringify(t.refresh);
  const txtPrev = JSON.stringify(t.previous);
  const txtNext = JSON.stringify(t.next);
  const txtSettings = JSON.stringify(t.settings);
  const txtQuit = JSON.stringify(t.quit);
  const safeHomeUrl = JSON.stringify(homeUrl);

  const menuScript = `
  (function() {
    try {
      let menu = document.getElementById('custom-menu');
      if (menu) {
        if (menu.style.display === 'none') {
          menu.style.display = 'block';
          if(${animsEnabled}) { menu.style.animation = 'none'; menu.offsetHeight; menu.style.animation = null; }
        } else {
          menu.style.display = 'none';
        }
        return;
      }
      menu = document.createElement('div'); menu.id = 'custom-menu';
      const animStyle = ${animsEnabled} ? '' : 'animation: none !important; transition: none !important;';
      menu.style.cssText = 'position:fixed;top:50px;left:10px;z-index:2147483647;background:rgba(22, 27, 34, 0.95);backdrop-filter:blur(15px);border:1px solid #30363d;border-radius:6px;padding:6px 0;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,0.5);color:#c9d1d9;font-family:sans-serif; -webkit-app-region: no-drag;' + animStyle;

      const createItem = (text, action, sep) => {
        if (sep) { const s = document.createElement('div'); s.style.cssText = 'height:1px;background:#30363d;margin:4px 0;'; menu.appendChild(s); return; }
        const btn = document.createElement('button');
        btn.textContent = text;
        const itemAnimStyle = ${animsEnabled} ? '' : 'animation: none !important; opacity: 1 !important;';
        btn.style.cssText = 'display:block;width:100%;text-align:left;padding:8px 16px;background:none;border:none;color:#c9d1d9;font-size:13px;cursor:pointer;transition:background 0.2s;' + itemAnimStyle;
        btn.onmouseover = () => btn.style.background = '#1f6feb'; btn.onmouseout = () => btn.style.background = 'none';
        btn.onclick = () => { action(); menu.style.display = 'none'; }; menu.appendChild(btn);
      };

      // Injection des textes sécurisés via JSON.stringify
      createItem(${txtHome}, () => window.location.href = ${safeHomeUrl});
      createItem(${txtRefresh}, () => window.location.reload());
      createItem(${txtPrev}, () => window.history.back());
      createItem(${txtNext}, () => window.history.forward());
      createItem(null, null, true);
      createItem(${txtSettings}, () => window.electronAPI.openSettings());
      createItem(${txtQuit}, () => window.electronAPI.close());

      document.body.appendChild(menu);
      setTimeout(() => { document.addEventListener('click', (e) => { if (!menu.contains(e.target) && e.target.id !== 'streamix-home-btn') { menu.style.display = 'none'; } }); }, 100);

    } catch(e) {
      console.error("Streamix Menu Error:", e);
    }
  })();
  `;
  win.webContents.executeJavaScript(menuScript).catch(console.error);
}

function loadSetupScreen() { mainWindow.loadFile(path.join(__dirname, "setup.html")); }

app.whenReady().then(() => {
  createWindow();
  Menu.setApplicationMenu(null);

  ipcMain.handle("minimize-window", () => mainWindow.minimize());
  ipcMain.handle("close-window", () => mainWindow.close());
  ipcMain.handle("restart-app", () => { app.relaunch(); app.exit(0); });
  ipcMain.handle("open-external-link", (e, url) => shell.openExternal(url));
  ipcMain.handle("reset-application", () => { store.clear(); app.relaunch(); app.exit(0); });

  ipcMain.on("bridge-sync-data", (event, payload) => {
    if ((payload.type === 'init' || payload.type === 'update') && payload.allData) {
      store.set("siteData", payload.allData);
    }
  });

  // --- SAUVEGARDE CONFIG AVEC REDÉMARRAGE SI BESOIN ---
  ipcMain.handle("save-config", (event, newConfig) => {
    if (newConfig.sourceUrl && !newConfig.sourceUrl.includes(".github.io/")) {
      dialog.showErrorBox("Source non autorisée", "Seules les sources hébergées sur GitHub Pages (.github.io/) sont acceptées.");
      return;
    }

    const currentConfig = store.get("config");
    // Redémarrage si changement de Style OU Langue
    const restartNeeded =
    (newConfig.windowStyle !== currentConfig.windowStyle) ||
    (newConfig.language !== currentConfig.language);

    store.set("config", { ...currentConfig, ...newConfig });

    if (settingsWindow && !settingsWindow.isDestroyed()) settingsWindow.close();

    if (restartNeeded) {
      app.relaunch();
      app.exit(0);
      return;
    }

    if (newConfig.sourceUrl) { mainWindow.loadURL(newConfig.sourceUrl); } else { app.relaunch(); app.exit(0); }
  });

  ipcMain.handle("get-preferences", () => store.get("config"));
  ipcMain.handle("get-plugins", () => store.get("plugins"));

  ipcMain.handle("select-plugin-file", async () => {
    const result = await dialog.showOpenDialog(settingsWindow || mainWindow, { filters: [{ name: "JavaScript", extensions: ["js"] }], properties: ["openFile"] });
    if (result.canceled) return { success: false };
    const pPath = result.filePaths[0];
    const plugins = store.get("plugins", []);
    if (plugins.find(p => p.path === pPath)) return { success: false, error: "Déjà installé" };
    const newPlugin = { name: path.basename(pPath, '.js'), path: pPath, enabled: true };
    plugins.push(newPlugin);
    store.set("plugins", plugins);
    return { success: true, plugin: newPlugin };
  });

  ipcMain.handle("remove-plugin", (e, pPath) => {
    let plugins = store.get("plugins", []);
    plugins = plugins.filter(p => p.path !== pPath);
    store.set("plugins", plugins);
    return { success: true };
  });

  ipcMain.handle("trigger-f1-menu", async () => { injectF1MenuScript(mainWindow); });

  ipcMain.handle("open-settings", () => {
    if (settingsWindow) { settingsWindow.show(); settingsWindow.focus(); return; }
    settingsWindow = new BrowserWindow({
      width: 800, height: 600, resizable: false, parent: mainWindow, modal: false,
      frame: false, show: false, backgroundColor: "#0d1117",
      webPreferences: { nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, "preload.js") }
    });
    settingsWindow.loadFile(path.join(__dirname, "settings.html"));
    settingsWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape' && input.type === 'keyDown') settingsWindow.close();
    });
      settingsWindow.once("ready-to-show", () => { settingsWindow.show(); settingsWindow.focus(); });
      settingsWindow.on("closed", () => { settingsWindow = null; });
  });

  ipcMain.handle("close-settings", () => { if (settingsWindow) settingsWindow.close(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
