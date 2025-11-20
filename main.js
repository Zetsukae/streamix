const { app, BrowserWindow, Menu, shell, dialog, ipcMain, Notification } = require("electron")
const path = require("path")
const fs = require("fs")

let mainWindow
let settingsWindow = null

async function checkForUpdates() {
  try {
    const currentVersion = "1.1.0" // Version actuelle de l'application

    // Use fetch to get the latest release from GitHub API
    const response = await fetch("https://api.github.com/repos/Zetsukae/streamix/releases/latest")
    const data = await response.json()

    if (!data.tag_name) return

    // Remove "v" prefix if present (e.g., v1.2.0 -> 1.2.0)
    const latestVersion = data.tag_name.replace(/^v/, "")

    // Compare versions
    if (latestVersion !== currentVersion) {
      // Show a native notification
      const notification = new Notification({
        title: "Mise à jour disponible",
        body: `Une nouvelle version de Streamix est disponible (v${latestVersion}). Cliquez pour télécharger.`,
        icon: path.join(__dirname, "assets", "icon.png"),
      })

      notification.on("click", () => {
        shell.openExternal(data.html_url)
      })

      notification.show()
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des mises à jour:", error)
  }
}

function createWindow() {
  const preferencesPath = path.join(app.getPath("userData"), "preferences.json")
  let preferences = { windowStyle: "default", homeButtonBehavior: "menu" }

  if (fs.existsSync(preferencesPath)) {
    preferences = JSON.parse(fs.readFileSync(preferencesPath, "utf8"))
  }

  const isWindowsStyle = preferences.windowStyle === "windows"

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
    frame: isWindowsStyle, // Appliquer la barre native si Windows style
  })

  const configPath = path.join(app.getPath("userData"), "first-launch.json")
  let startUrl = "https://franime.fr/"

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"))
    if (config.serviceUrl) {
      startUrl = config.serviceUrl
    }
  } else {
    startUrl =
      "data:text/html;charset=utf-8," +
      encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Streamix - Setup</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(-45deg, #6c7ce7, #a55eea, #74b9ff, #81ecec);
            background-size: 400% 400%;
            animation: gradient 20s ease infinite;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            overflow: hidden;
          }
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .wave {
            position: absolute;
            border-radius: 40%;
            background: rgba(255, 255, 255, 0.08);
            z-index: -1;
          }
          .wave1 {
            width: 800px;
            height: 825px;
            top: -20%;
            left: 30%;
            margin-left: -400px;
            margin-top: -400px;
            animation: wave1 20s infinite linear;
          }
          .wave2 {
            width: 600px;
            height: 625px;
            top: -15%;
            right: 20%;
            margin-right: -300px;
            margin-top: -300px;
            animation: wave2 25s infinite linear reverse;
          }
          .wave3 {
            width: 400px;
            height: 425px;
            bottom: -10%;
            left: 10%;
            margin-left: -200px;
            margin-bottom: -200px;
            animation: wave3 18s infinite linear;
          }
          @keyframes wave1 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes wave2 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes wave3 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .container {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
            z-index: 10;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 15px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
          }
          p {
            font-size: 14px;
            margin-bottom: 30px;
            opacity: 0.9;
          }
          .service-button {
            width: 100%;
            padding: 15px 25px;
            margin-bottom: 15px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 10px;
            background: rgba(255,255,255,0.15);
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          .service-button:hover {
            background: rgba(255,255,255,0.25);
            border-color: rgba(255,255,255,0.5);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }
          .service-button:active {
            transform: translateY(0);
          }
        </style>
      </head>
      <body>
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
        <div class="container">
          <h1>Bienvenue sur Streamix</h1>
          <p>Choisissez votre service de streaming préféré</p>
          
          <button class="service-button" onclick="selectService('franime')">
            Franime
          </button>
          
          <button class="service-button" onclick="selectService('animesama')">
            Anime Sama
          </button>
          
          <button class="service-button" onclick="selectService('voiranime')">
            Voiranime
          </button>
        </div>
        
        <script>
          function selectService(service) {
            let serviceUrl = 'https://franime.fr/';
            
            if (service === 'animesama') {
              serviceUrl = 'https://anime-sama.org/';
            } else if (service === 'voiranime') {
              serviceUrl = 'https://v6.voiranime.com/';
            }
            
            window.electronAPI.selectService({ serviceUrl });
          }
        </script>
      </body>
      </html>
    `)
  }

  mainWindow.loadURL(startUrl)

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()

    const configPath = path.join(app.getPath("userData"), "first-launch.json")
    if (!fs.existsSync(configPath)) {
      // Removed setTimeout and call to showServiceSelection()
    }
  })

  mainWindow.webContents.on("did-navigate", (event, url) => {
    trackHistory(url)
  })

  mainWindow.webContents.on("dom-ready", () => {
    const stylePath = path.join(__dirname, "assets", "style.css")
    if (fs.existsSync(stylePath)) {
      const baseStyle = fs.readFileSync(stylePath, "utf8")
      mainWindow.webContents.insertCSS(baseStyle)
    }

    const currentUrl = mainWindow.webContents.getURL()
    if (currentUrl.startsWith("data:text/html")) return

    const showSearchBtn = currentUrl.includes("franime.fr")

    const preferencesPath = path.join(app.getPath("userData"), "preferences.json")
    let preferences = { windowStyle: "default" }
    if (fs.existsSync(preferencesPath)) {
      preferences = JSON.parse(fs.readFileSync(preferencesPath, "utf8"))
    }
    const isWindowsStyle = preferences.windowStyle === "windows"

    mainWindow.webContents
      .executeJavaScript(`
      if (window.location.href.includes('anime-sama.fr') || window.location.href.includes('anime-sama.org')) {
        document.body.setAttribute('data-anime-sama', 'true');
      }
      
      if (${showSearchBtn} && !document.getElementById('streamix-search-btn')) {
        const searchBtn = document.createElement('button');
        searchBtn.id = 'streamix-search-btn';
        searchBtn.innerHTML = '<img src="https://i.imgur.com/Jnp4gxM.png" alt="Search" style="width: 25px; height: 25px;">';
        searchBtn.onclick = () => window.location.href = 'https://franime.fr/recherche';
        document.body.appendChild(searchBtn);
      }
      
      if (!document.getElementById('streamix-home-btn')) {
        const homeBtn = document.createElement('button');
        homeBtn.id = 'streamix-home-btn';
        homeBtn.innerHTML = '<img src="https://i.imgur.com/lv3zp1J.png" alt="Home" style="width: 30px; height: 30px;">';
        homeBtn.onclick = () => {
          if(window.electronAPI) window.electronAPI.triggerF1Menu();
        };
        document.body.appendChild(homeBtn);
        
        if (window.location.href.includes('anime-sama.fr') || window.location.href.includes('anime-sama.org')) {
          function adjustButtonPosition() {
            const header = document.querySelector('header, nav, .header, .navbar');
            const homeBtn = document.getElementById('streamix-home-btn');
            const controls = document.getElementById('window-controls');
            
            if (header && homeBtn && controls) {
              const headerRect = header.getBoundingClientRect();
              const isHeaderVisible = headerRect.top >= 0 && headerRect.bottom > 0;
              
              if (isHeaderVisible) {
                homeBtn.style.top = (headerRect.bottom + 10) + 'px';
                controls.style.top = (headerRect.bottom + 10) + 'px';
              } else {
                homeBtn.style.top = '20px';
                controls.style.top = '10px';
              }
            }
          }
          
          setTimeout(adjustButtonPosition, 500);
          window.addEventListener('scroll', adjustButtonPosition);
          window.addEventListener('resize', adjustButtonPosition);
        }
      }
      
      if (!document.getElementById('window-controls')) {
        const controls = document.createElement('div');
        controls.id = 'window-controls';
        
        const isVoiranime = window.location.href.includes('voiranime.com');
        const bgColor = isVoiranime ? 'rgba(0,0,0,0.5)' : 'transparent';
        
        const isWindowsStyle = ${isWindowsStyle};
        const displayStyle = isWindowsStyle ? 'none' : 'flex';
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.id = 'minimize-btn';
        minimizeBtn.textContent = '-';
        minimizeBtn.style.cssText = \`width: 32px !important; height: 32px !important; border: none !important; border-radius: 8px !important; cursor: pointer !important; font-size: 16px !important; font-weight: bold !important; transition: all 0.3s ease !important; display: \${displayStyle} !important; align-items: center !important; justify-content: center !important; background: \${bgColor} !important; color: #ffffff !important; backdrop-filter: blur(10px) !important; z-index: 99999 !important;\`;
        minimizeBtn.onclick = () => {
          if(window.electronAPI) window.electronAPI.minimize();
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.id = 'close-btn';
        closeBtn.textContent = 'X';
        closeBtn.style.cssText = \`width: 32px !important; height: 32px !important; border: none !important; border-radius: 8px !important; cursor: pointer !important; font-size: 16px !important; font-weight: bold !important; transition: all 0.3s ease !important; display: \${displayStyle} !important; align-items: center !important; justify-content: center !important; background: \${bgColor} !important; color: #ffffff !important; backdrop-filter: blur(10px) !important; z-index: 99999 !important;\`;
        closeBtn.onclick = () => {
          if(window.electronAPI) window.electronAPI.close();
        };
        
        controls.style.cssText = 'position: fixed !important; top: 10px !important; right: 10px !important; z-index: 99999 !important; display: \${displayStyle} !important; gap: 5px !important;';
        controls.appendChild(minimizeBtn);
        controls.appendChild(closeBtn);
        document.body.appendChild(controls);
      }
      
      if (!document.getElementById('drag-zone')) {
        const dragZone = document.createElement('div');
        dragZone.id = 'drag-zone';
        document.body.appendChild(dragZone);
      }
    `)
      .catch((err) => console.error("Erreur DOM injection:", err))
  })

  mainWindow.webContents.on("page-title-updated", (event, title) => {
    mainWindow.setTitle("Streamix")
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const urlObj = new URL(url)
    if (
      urlObj.hostname === "franime.fr" ||
      urlObj.hostname.endsWith(".franime.fr") ||
      urlObj.hostname === "anime-sama.org" ||
      urlObj.hostname.endsWith(".anime-sama.org") ||
      urlObj.hostname === "v6.voiranime.com" ||
      urlObj.hostname.endsWith(".voiranime.com") ||
      urlObj.hostname.includes("discord.com") ||
      urlObj.hostname.includes("discordapp.com") ||
      urlObj.hostname.includes("google.com") ||
      urlObj.hostname.includes("googleapis.com") ||
      urlObj.hostname.includes("accounts.google.com")
    ) {
      return { action: "allow" }
    }
    shell.openExternal(url)
    return { action: "deny" }
  })

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const urlObj = new URL(url)

    if (url === "streamix://minimize") {
      event.preventDefault()
      mainWindow.minimize()
      return
    }
    if (url === "streamix://close") {
      event.preventDefault()
      mainWindow.close()
      return
    }

    if (
      urlObj.hostname === "franime.fr" ||
      urlObj.hostname.endsWith(".franime.fr") ||
      urlObj.hostname === "anime-sama.org" ||
      urlObj.hostname.endsWith(".anime-sama.org") ||
      urlObj.hostname === "v6.voiranime.com" ||
      urlObj.hostname.endsWith(".voiranime.com") ||
      urlObj.hostname.includes("discord.com") ||
      urlObj.hostname.includes("discordapp.com") ||
      urlObj.hostname.includes("google.com") ||
      urlObj.hostname.includes("googleapis.com") ||
      urlObj.hostname.includes("accounts.google.com")
    ) {
      return
    }
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control === false && input.shift === false && input.alt === false && input.meta === false) {
      if (input.key.toLowerCase() === "f1") {
        event.preventDefault()

        mainWindow.webContents
          .executeJavaScript(`
            try {
              if (!window.openSettings) {
                window.openSettings = async () => {
                  await window.electronAPI.openSettings();
                };
              }
              
              let menu = document.getElementById('custom-menu');
              if (menu) {
                if (menu.style.display === 'none') {
                  menu.style.display = 'block';
                } else {
                  menu.style.display = 'none';
                }
              } else {
                menu = document.createElement('div');
                menu.id = 'custom-menu';
                menu.style.cssText = 'position:fixed;top:60px;left:20px;z-index:10002;background:rgba(30,30,30,0.95);backdrop-filter:blur(15px);border:1px solid #333;border-radius:8px;padding:8px 0;min-width:150px;box-shadow:0 8px 25px rgba(0,0,0,0.3);';
                
                const currentUrl = window.location.href;
                let homeUrl = 'https://franime.fr/';
                if (currentUrl.includes('anime-sama.org')) {
                  homeUrl = 'https://anime-sama.org/';
                } else if (currentUrl.includes('voiranime.com')) {
                  homeUrl = 'https://v6.voiranime.com/';
                }
                
                const items = [
                  {text: 'Accueil', action: \`window.location.href="\${homeUrl}"\`},
                  {text: 'Actualiser', action: 'window.location.reload()'},
                  {text: 'Précédent', action: 'window.history.back()'},
                  {text: 'Suivant', action: 'window.history.forward()'},
                  {separator: true},
                  {text: 'Paramètres', action: 'openSettings'},
                  {separator: true},
                  {text: 'Quitter', action: 'window.close()'}
                ];
                
                items.forEach(item => {
                  if (item.separator) {
                    const sep = document.createElement('div');
                    sep.style.cssText = 'height:1px;background:#444;margin:5px 10px;';
                    menu.appendChild(sep);
                  } else {
                    const menuItem = document.createElement('div');
                    menuItem.textContent = item.text;
                    menuItem.style.cssText = 'padding:10px 15px;color:#ffffff;cursor:pointer;transition:all 0.2s ease;font-size:14px;';
                    menuItem.onmouseover = () => {
                      menuItem.style.background = 'rgba(255,255,255,0.1)';
                      menuItem.style.color = '#ff6b6b';
                    };
                    menuItem.onmouseout = () => {
                      menuItem.style.background = 'transparent';
                      menuItem.style.color = '#ffffff';
                    };
                    menuItem.onclick = () => {
                      if (item.text === 'Paramètres') {
                        window.openSettings();
                      } else {
                        eval(item.action);
                      }
                    };
                    menu.appendChild(menuItem);
                  }
                });
                
                document.body.appendChild(menu);
                
                setTimeout(() => {
                  document.addEventListener('click', function closeMenu(e) {
                    if (!menu.contains(e.target)) {
                      menu.style.display = 'none';
                      document.removeEventListener('click', closeMenu);
                    }
                  }, {once: false});
                }, 100);
              }
            } catch(e) {
              console.error('Menu error:', e);
            }
          `)
          .catch((err) => console.error("Erreur executeJavaScript:", err))
      }
      if (input.key.toLowerCase() === "f3") {
        event.preventDefault()
        // Removed call to showServiceSelection(true)
      }
    }
  })
}

// Function to create the application menu
function createApplicationMenu() {
  const menuTemplate = [
    {
      label: "Fichier",
      submenu: [
        { label: "Paramètres", click: () => ipcMain.invoke("open-settings") },
        { type: "separator" },
        { label: "Quitter", role: "quit" },
      ],
    },
    {
      label: "Édition",
      submenu: [
        { label: "Annuler", role: "undo" },
        { label: "Rétablir", role: "redo" },
        { type: "separator" },
        { label: "Couper", role: "cut" },
        { label: "Copier", role: "copy" },
        { label: "Coller", role: "paste" },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        { label: "Recharger", role: "reload" },
        { label: "Outils de développement", role: "toggleDevTools" },
      ],
    },
    {
      label: "Fenêtre",
      submenu: [
        { label: "Minimiser", click: () => ipcMain.invoke("minimize-window") },
        { label: "Fermer", click: () => ipcMain.invoke("close-window") },
      ],
    },
    {
      label: "Aide",
      submenu: [
        {
          label: "Documentation",
          click: async () => {
            await shell.openExternal("https://github.com/Zetsukae/streamix")
          },
        },
        {
          label: "Rapporter un bug",
          click: async () => {
            await shell.openExternal("https://github.com/Zetsukae/streamix/issues")
          },
        },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}

// La sélection de service est maintenant directement intégrée dans la page de setup

app.whenReady().then(() => {
  createWindow()
  Menu.setApplicationMenu(null)

  setTimeout(() => {
    checkForUpdates()
  }, 3000) // Attendre 3 secondes après le démarrage

  ipcMain.handle("select-service", async (event, config) => {
    const configPath = path.join(app.getPath("userData"), "first-launch.json")
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    if (mainWindow) {
      mainWindow.loadURL(config.serviceUrl)
    }

    return true
  })

  ipcMain.handle("minimize-window", () => {
    mainWindow.minimize()
  })

  ipcMain.handle("close-window", () => {
    mainWindow.close()
  })

  ipcMain.handle("show-dialog", (event, title, message) => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: title,
      message: title,
      detail: message,
      buttons: ["OK"],
    })
  })

  ipcMain.handle("trigger-f1-menu", async (event) => {
    const preferencesPath = path.join(app.getPath("userData"), "preferences.json")
    let preferences = { homeButtonBehavior: "menu" }

    if (fs.existsSync(preferencesPath)) {
      preferences = JSON.parse(fs.readFileSync(preferencesPath, "utf8"))
    }

    if (preferences.homeButtonBehavior === "home") {
      const configPath = path.join(app.getPath("userData"), "first-launch.json")
      let homeUrl = "https://franime.fr/"

      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"))
        if (config.serviceUrl) {
          homeUrl = config.serviceUrl
        }
      }

      mainWindow.loadURL(homeUrl)
      return
    }

    mainWindow.webContents
      .executeJavaScript(`
        try {
          if (!window.openSettings) {
            window.openSettings = async () => {
              await window.electronAPI.openSettings();
            };
          }
          
          let menu = document.getElementById('custom-menu');
          if (menu) {
            if (menu.style.display === 'none') {
              menu.style.display = 'block';
            } else {
              menu.style.display = 'none';
            }
          } else {
            menu = document.createElement('div');
            menu.id = 'custom-menu';
            menu.style.cssText = 'position:fixed;top:60px;left:20px;z-index:10002;background:rgba(30,30,30,0.95);backdrop-filter:blur(15px);border:1px solid #333;border-radius:8px;padding:8px 0;min-width:150px;box-shadow:0 8px 25px rgba(0,0,0,0.3);';
            
            const currentUrl = window.location.href;
            let homeUrl = 'https://franime.fr/';
            if (currentUrl.includes('anime-sama.org')) {
              homeUrl = 'https://anime-sama.org/';
            } else if (currentUrl.includes('voiranime.com')) {
              homeUrl = 'https://v6.voiranime.com/';
            }
            
            const items = [
              {text: 'Accueil', action: \`window.location.href="\${homeUrl}"\`},
              {text: 'Actualiser', action: 'window.location.reload()'},
              {text: 'Précédent', action: 'window.history.back()'},
              {text: 'Suivant', action: 'window.history.forward()'},
              {separator: true},
              {text: 'Paramètres', action: 'openSettings'},
              {separator: true},
              {text: 'Quitter', action: 'window.close()'}
            ];
            
            items.forEach(item => {
              if (item.separator) {
                const sep = document.createElement('div');
                sep.style.cssText = 'height:1px;background:#444;margin:5px 10px;';
                menu.appendChild(sep);
              } else {
                const menuItem = document.createElement('div');
                menuItem.textContent = item.text;
                menuItem.style.cssText = 'padding:10px 15px;color:#ffffff;cursor:pointer;transition:all 0.2s ease;font-size:14px;';
                menuItem.onmouseover = () => {
                  menuItem.style.background = 'rgba(255,255,255,0.1)';
                  menuItem.style.color = '#ff6b6b';
                };
                menuItem.onmouseout = () => {
                  menuItem.style.background = 'transparent';
                  menuItem.style.color = '#ffffff';
                };
                menuItem.onclick = () => {
                  if (item.text === 'Paramètres') {
                    window.openSettings();
                  } else {
                    eval(item.action);
                  }
                };
                menu.appendChild(menuItem);
              }
            });
            
            document.body.appendChild(menu);
            
            setTimeout(() => {
              document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                  menu.style.display = 'none';
                  document.removeEventListener('click', closeMenu);
                }
              }, {once: false});
            }, 100);
          }
        } catch(e) {
          console.error('Menu error:', e);
        }
      `)
      .catch((err) => console.error("Erreur executeJavaScript:", err))
  })

  ipcMain.handle("triggerF1Menu", () => {
    mainWindow.webContents
      .executeJavaScript(`
      try {
        if (!window.openSettings) {
          window.openSettings = async () => {
            await window.electronAPI.openSettings();
          };
        }
        
        let menu = document.getElementById('custom-menu');
        if (menu) {
          if (menu.style.display === 'none') {
            menu.style.display = 'block';
          } else {
            menu.style.display = 'none';
          }
        } else {
          menu = document.createElement('div');
          menu.id = 'custom-menu';
          menu.style.cssText = 'position:fixed;top:60px;left:20px;z-index:10002;background:rgba(30,30,30,0.95);backdrop-filter:blur(15px);border:1px solid #333;border-radius:8px;padding:8px 0;min-width:150px;box-shadow:0 8px 25px rgba(0,0,0,0.3);';
          
          const currentUrl = window.location.href;
          let homeUrl = 'https://franime.fr/';
          if (currentUrl.includes('anime-sama.org')) {
            homeUrl = 'https://anime-sama.org/';
          } else if (currentUrl.includes('voiranime.com')) {
            homeUrl = 'https://v6.voiranime.com/';
          }
          
          const items = [
            {text: 'Accueil', action: \`window.location.href="\${homeUrl}"\`},
            {text: 'Actualiser', action: 'window.location.reload()'},
            {text: 'Précédent', action: 'window.history.back()'},
            {text: 'Suivant', action: 'window.history.forward()'},
            {separator: true},
            {text: 'Paramètres', action: 'openSettings'},
            {separator: true},
            {text: 'Quitter', action: 'window.close()'}
          ];
          
          items.forEach(item => {
            if (item.separator) {
              const sep = document.createElement('div');
              sep.style.cssText = 'height:1px;background:#444;margin:5px 10px;';
              menu.appendChild(sep);
            } else {
              const menuItem = document.createElement('div');
              menuItem.textContent = item.text;
              menuItem.style.cssText = 'padding:10px 15px;color:#ffffff;cursor:pointer;transition:all 0.2s ease;font-size:14px;';
              menuItem.onmouseover = () => {
                menuItem.style.background = 'rgba(255,255,255,0.1)';
                menuItem.style.color = '#ff6b6b';
              };
              menuItem.onmouseout = () => {
                menuItem.style.background = 'transparent';
                menuItem.style.color = '#ffffff';
              };
              menuItem.onclick = () => {
                if (item.text === 'Paramètres') {
                  window.openSettings();
                } else {
                  eval(item.action);
                }
              };
              menu.appendChild(menuItem);
            }
          });
          
          document.body.appendChild(menu);
          
          setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
              if (!menu.contains(e.target)) {
                menu.style.display = 'none';
                document.removeEventListener('click', closeMenu);
              }
            }, {once: false});
          }, 100);
        }
      } catch(e) {
        console.error('Menu error:', e);
      }
    `)
      .catch((err) => console.error("Erreur executeJavaScript:", err))
  })

  ipcMain.handle("open-settings", async (event) => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.focus()
      return
    }

    const preferencesPath = path.join(app.getPath("userData"), "preferences.json")
    let preferences = { windowStyle: "default", homeButtonBehavior: "menu" }

    if (fs.existsSync(preferencesPath)) {
      preferences = JSON.parse(fs.readFileSync(preferencesPath, "utf8"))
    }

    const configPath = path.join(app.getPath("userData"), "first-launch.json")
    let currentService = "franime"
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"))
      if (config.serviceUrl) {
        if (config.serviceUrl.includes("anime-sama")) {
          currentService = "animesama"
        } else if (config.serviceUrl.includes("voiranime")) {
          currentService = "voiranime"
        }
      }
    }

    settingsWindow = new BrowserWindow({
      width: 600,
      height: 650,
      parent: mainWindow,
      modal: true,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
      icon: path.join(__dirname, "assets", "icon.png"),
    })

    const settingsHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Paramètres Streamix</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            height: 100vh;
            display: flex;
            overflow: hidden;
          }
          
          .sidebar {
            width: 180px;
            background: #0f0f0f;
            border-right: 1px solid #333;
            display: flex;
            flex-direction: column;
            padding: 20px 0;
          }
          
          .sidebar-item {
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
            color: #aaa;
            font-size: 14px;
          }
          
          .sidebar-item:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
          }
          
          .sidebar-item.active {
            background: rgba(255,107,107,0.1);
            color: #ff6b6b;
            border-left-color: #ff6b6b;
          }
          
          .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 30px;
            overflow-y: auto;
          }

          /* Personnaliser la scrollbar */
          .content::-webkit-scrollbar {
            width: 8px;
          }

          .content::-webkit-scrollbar-track {
            background: transparent;
          }

          .content::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }

          .content::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          
          .content-section {
            display: none;
          }
          
          .content-section.active {
            display: block;
          }
          
          h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fff;
          }
          
          .setting-group {
            margin-bottom: 25px;
          }
          
          .setting-label {
            font-size: 14px;
            color: #aaa;
            margin-bottom: 10px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          
          .radio-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .radio-item {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            background: rgba(255,255,255,0.03);
            border: 1px solid #333;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .radio-item:hover {
            background: rgba(255,255,255,0.08);
            border-color: #444;
          }
          
          .radio-item input[type="radio"] {
            margin-right: 10px;
            cursor: pointer;
            accent-color: #ff6b6b;
          }
          
          .radio-item label {
            cursor: pointer;
            flex: 1;
            color: #ccc;
          }
          
          .about-text {
            color: #aaa;
            line-height: 1.6;
            font-size: 14px;
          }
          
          .about-text p {
            margin-bottom: 10px;
          }

          /* Ajouter styles pour les liens d'aide */
          .help-links {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #333;
          }

          .help-link {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            background: rgba(255,255,255,0.03);
            border: 1px solid #333;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 10px;
            color: #ccc;
            text-decoration: none;
          }

          .help-link:hover {
            background: rgba(255,255,255,0.08);
            border-color: #ff6b6b;
            color: #ff6b6b;
          }

          .help-link::before {
            content: '→';
            margin-right: 10px;
            font-weight: bold;
          }
          
          .button-group {
            display: flex;
            gap: 10px;
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid #333;
          }
          
          button {
            flex: 1;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 600;
          }
          
          .btn-save {
            background: #ff6b6b;
            color: #fff;
          }
          
          .btn-save:hover {
            background: #ff5252;
          }
          
          .btn-cancel {
            background: #333;
            color: #fff;
          }
          
          .btn-cancel:hover {
            background: #444;
          }

          .btn-reset {
            background: #e74c3c;
            color: #fff;
            flex: none;
            width: 100%;
            margin-top: 15px;
          }
          
          .btn-reset:hover {
            background: #c0392b;
          }

          .warning-text {
            font-size: 12px;
            color: #e74c3c;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="sidebar">
          <div class="sidebar-item active" data-section="general">Général</div>
          <div class="sidebar-item" data-section="customization">Customisation</div>
          <div class="sidebar-item" data-section="about">À propos</div>
        </div>
        
        <div class="content">
          <!-- Général -->
          <div class="content-section active" id="general">
            <h2>Paramètres généraux</h2>
            
            <div class="setting-group">
              <div class="setting-label">Service de streaming</div>
              <div class="radio-group">
                <div class="radio-item">
                  <input type="radio" id="service-franime" name="service" value="franime" ${currentService === "franime" ? "checked" : ""}>
                  <label for="service-franime">Franime</label>
                </div>
                <div class="radio-item">
                  <input type="radio" id="service-animesama" name="service" value="animesama" ${currentService === "animesama" ? "checked" : ""}>
                  <label for="service-animesama">Anime Sama</label>
                </div>
                <div class="radio-item">
                  <input type="radio" id="service-voiranime" name="service" value="voiranime" ${currentService === "voiranime" ? "checked" : ""}>
                  <label for="service-voiranime">Voiranime</label>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-label">Bouton en haut à gauche</div>
              <div class="radio-group">
                <div class="radio-item">
                  <input type="radio" id="menu-f1" name="homeButton" value="menu" ${preferences.homeButtonBehavior === "menu" ? "checked" : ""}>
                  <label for="menu-f1">Afficher le menu F1</label>
                </div>
                <div class="radio-item">
                  <input type="radio" id="home" name="homeButton" value="home" ${preferences.homeButtonBehavior === "home" ? "checked" : ""}>
                  <label for="home">Aller à l'accueil</label>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-label">Réinitialisation</div>
              <button class="btn-reset" id="resetBtn">Réinitialiser l'application</button>
              <div class="warning-text">⚠️ Cela supprimera toutes vos préférences et redémarrera l'application</div>
            </div>
          </div>
          
          <!-- Customisation -->
          <div class="content-section" id="customization">
            <h2>Customisation</h2>
            
            <div class="setting-group">
              <div class="setting-label">Style de la fenêtre</div>
              <div class="radio-group">
                <div class="radio-item">
                  <input type="radio" id="default-style" name="windowStyle" value="default" ${preferences.windowStyle === "default" ? "checked" : ""}>
                  <label for="default-style">Par défaut (Moderne)</label>
                </div>
                <div class="radio-item">
                  <input type="radio" id="windows-style" name="windowStyle" value="windows" ${preferences.windowStyle === "windows" ? "checked" : ""}>
                  <label for="windows-style">Barre Native de Linux GNU</label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- À propos -->
          <div class="content-section" id="about">
            <h2>À propos de Streamix</h2>
            
            <div class="about-text">
              <!-- Ajout de la version BETA -->
              <p><strong>Streamix v1.1.0 BETA</strong></p>
              <p>Service de streaming disponible :</p>
              <ul style="margin-left: 20px;">
                <li>Franime</li>
                <li>Animesama</li>
                <li>Voiranime</li>
              </ul>
              <p style="margin-top: 15px;">Fait avec ❤ par Uniware Team</p>
              <p style="font-size: 12px; color: #666; margin-top: 10px;">Nous ne possédons pas les droits des contenus affichés.</p>
            </div>

            <!-- Ajouter les liens d'aide dans À propos -->
            <div class="help-links">
              <h3 style="font-size: 16px; margin-bottom: 12px; color: #fff;">Liens utiles</h3>
              <div class="help-link" id="link-doc">Documentation</div>
              <div class="help-link" id="link-bug">Rapporter un bug</div>
            </div>
          </div>
          
          <!-- Boutons -->
          <div class="button-group">
            <button class="btn-save" id="saveBtn">Enregistrer</button>
            <button class="btn-cancel" id="cancelBtn">Annuler</button>
          </div>
        </div>
        
        <script>
          const sidebarItems = document.querySelectorAll('.sidebar-item');
          const contentSections = document.querySelectorAll('.content-section');
          const serviceRadios = document.querySelectorAll('input[name="service"]');
          const homeButtonRadios = document.querySelectorAll('input[name="homeButton"]');
          const windowStyleRadios = document.querySelectorAll('input[name="windowStyle"]');
          const saveBtn = document.getElementById('saveBtn');
          const cancelBtn = document.getElementById('cancelBtn');
          const resetBtn = document.getElementById('resetBtn');
          const linkDoc = document.getElementById('link-doc');
          const linkBug = document.getElementById('link-bug');
          
          // Load current preferences
          window.electronAPI.getPreferences().then(prefs => {
            // Ensure all radio buttons are correctly set based on loaded preferences
            document.querySelector(\`input[name="homeButton"][value="\${prefs.homeButtonBehavior}"]\`).checked = true;
            document.querySelector(\`input[name="windowStyle"][value="\${prefs.windowStyle}"]\`).checked = true;
          });
          
          // Sidebar navigation
          sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
              const section = item.getAttribute('data-section');
              
              sidebarItems.forEach(s => s.classList.remove('active'));
              contentSections.forEach(s => s.classList.remove('active'));
              
              item.classList.add('active');
              document.getElementById(section).classList.add('active');
            });
          });
          
          // Save preferences
          saveBtn.addEventListener('click', () => {
            const homeButtonValue = document.querySelector('input[name="homeButton"]:checked').value;
            const windowStyleValue = document.querySelector('input[name="windowStyle"]:checked').value;
            const serviceValue = document.querySelector('input[name="service"]:checked').value;
            
            window.electronAPI.savePreferences({
              homeButtonBehavior: homeButtonValue,
              windowStyle: windowStyleValue,
              service: serviceValue
            }).then(() => {
              window.close();
            });
          });
          
          // Cancel
          cancelBtn.addEventListener('click', () => {
            window.close();
          });

          // Reset application
          resetBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser l\\'application ? Toutes vos préférences seront supprimées.')) {
              window.electronAPI.resetApplication().then(() => {
                // La fenêtre se fermera automatiquement lors du redémarrage
              });
            }
          });

          linkDoc.addEventListener('click', () => {
            window.electronAPI.openExternalLink('https://github.com/Zetsukae/streamix');
          });

          linkBug.addEventListener('click', () => {
            window.electronAPI.openExternalLink('https://github.com/Zetsukae/streamix/issues');
          });
        </script>
      </body>
      </html>
    `

    settingsWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(settingsHtml))

    settingsWindow.once("ready-to-show", () => {
      settingsWindow.show()
    })

    settingsWindow.on("closed", () => {
      settingsWindow = null
    })
  })

  ipcMain.handle("get-preferences", async (event) => {
    const preferencesPath = path.join(app.getPath("userData"), "preferences.json")
    let preferences = { windowStyle: "default", homeButtonBehavior: "menu" }

    if (fs.existsSync(preferencesPath)) {
      preferences = JSON.parse(fs.readFileSync(preferencesPath, "utf8"))
    }

    return preferences
  })

  ipcMain.handle("save-preferences", async (event, preferences) => {
    const preferencesPath = path.join(app.getPath("userData"), "preferences.json")

    let oldPreferences = { windowStyle: "default", homeButtonBehavior: "menu" }
    if (fs.existsSync(preferencesPath)) {
      oldPreferences = JSON.parse(fs.readFileSync(preferencesPath, "utf8"))
    }

    fs.writeFileSync(preferencesPath, JSON.stringify(preferences, null, 2))

    if (preferences.service) {
      const configPath = path.join(app.getPath("userData"), "first-launch.json")
      let serviceUrl = "https://franime.fr/"

      if (preferences.service === "animesama") {
        serviceUrl = "https://anime-sama.org/"
      } else if (preferences.service === "voiranime") {
        serviceUrl = "https://v6.voiranime.com/"
      }

      fs.writeFileSync(configPath, JSON.stringify({ serviceUrl }, null, 2))
    }

    if (oldPreferences.windowStyle !== preferences.windowStyle || preferences.service) {
      if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.close()
      }
      // Restart app after a short delay
      setTimeout(() => {
        app.relaunch()
        app.exit(0)
      }, 300)
    }

    return true
  })

  ipcMain.handle("reset-application", async (event) => {
    const userDataPath = app.getPath("userData")
    const preferencesPath = path.join(userDataPath, "preferences.json")
    const configPath = path.join(userDataPath, "first-launch.json")

    // Supprimer les fichiers de configuration
    if (fs.existsSync(preferencesPath)) {
      fs.unlinkSync(preferencesPath)
    }
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath)
    }

    // Redémarrer l'application
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close()
    }

    setTimeout(() => {
      app.relaunch()
      app.exit(0)
    }, 500)

    return true
  })

  ipcMain.handle("open-external-link", async (event, url) => {
    await shell.openExternal(url)
    return true
  })
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// Placeholder for trackHistory if it was meant to be kept
function trackHistory(url) {
  // Implementation for tracking history
}
