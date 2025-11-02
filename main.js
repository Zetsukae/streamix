const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")

let mainWindow

function createWindow() {
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
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    autoHideMenuBar: true,
    frame: false,
  })

  const configPath = path.join(app.getPath('userData'), 'first-launch.json')
  let startUrl = 'https://franime.fr/'
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    if (config.serviceUrl) {
      startUrl = config.serviceUrl
    }
  } else {
    // Page temporaire pour le premier setup
    startUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Streamix</title>
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
          .wrapper {
            width: 500px;
            height: 300px;
            position: relative;
            border-radius: 15px;
            background-image: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
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
          h1 {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10;
          }
          p {
            font-size: 1.1em;
            opacity: 0.9;
            z-index: 10;
          }
        </style>
      </head>
      <body>
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
        <div class="wrapper">
          <h1>Bienvenue à Streamix</h1>
          <p>Veuillez compléter le setup sur l'écran pour continuer</p>
        </div>
      </body>
      </html>
    `)
  }
  
  mainWindow.loadURL(startUrl)



  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    
    const configPath = path.join(app.getPath('userData'), 'first-launch.json')
    if (!fs.existsSync(configPath)) {
      setTimeout(() => {
        showServiceSelection()
      }, 1000)
    }
  })

  mainWindow.webContents.on('did-navigate', (event, url) => {
    trackHistory(url)
  })

  mainWindow.webContents.on('dom-ready', () => {
    const stylePath = path.join(__dirname, 'assets', 'style.css')
    if (fs.existsSync(stylePath)) {
      const baseStyle = fs.readFileSync(stylePath, 'utf8')
      mainWindow.webContents.insertCSS(baseStyle)
    }
    
    const currentUrl = mainWindow.webContents.getURL()
    if (currentUrl.startsWith('data:text/html')) return
    
    const showSearchBtn = currentUrl.includes('franime.fr')
    
    mainWindow.webContents.executeJavaScript(`
      // Marquer anime-sama pour le CSS
      if (window.location.href.includes('anime-sama.fr')) {
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
          const currentUrl = window.location.href;
          if (currentUrl.includes('anime-sama.fr')) {
            window.location.href = 'https://anime-sama.fr/';
          } else if (currentUrl.includes('voiranime.com')) {
            window.location.href = 'https://v6.voiranime.com/';
          } else {
            window.location.href = 'https://franime.fr/';
          }
        };
        document.body.appendChild(homeBtn);
        
        // Ajuster position selon header anime-sama
        if (window.location.href.includes('anime-sama.fr')) {
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
          
          // Ajuster au chargement et au scroll
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
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.id = 'minimize-btn';
        minimizeBtn.textContent = '-';
        minimizeBtn.style.cssText = \`width: 32px !important; height: 32px !important; border: none !important; border-radius: 8px !important; cursor: pointer !important; font-size: 16px !important; font-weight: bold !important; transition: all 0.3s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; background: \${bgColor} !important; color: #ffffff !important; backdrop-filter: blur(10px) !important; z-index: 99999 !important;\`;
        minimizeBtn.onclick = () => {
          if(window.electronAPI) window.electronAPI.minimize();
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.id = 'close-btn';
        closeBtn.textContent = 'X';
        closeBtn.style.cssText = \`width: 32px !important; height: 32px !important; border: none !important; border-radius: 8px !important; cursor: pointer !important; font-size: 16px !important; font-weight: bold !important; transition: all 0.3s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; background: \${bgColor} !important; color: #ffffff !important; backdrop-filter: blur(10px) !important; z-index: 99999 !important;\`;
        closeBtn.onclick = () => {
          if(window.electronAPI) window.electronAPI.close();
        };
        
        controls.style.cssText = 'position: fixed !important; top: 10px !important; right: 10px !important; z-index: 99999 !important; display: flex !important; gap: 5px !important;';
        controls.appendChild(minimizeBtn);
        controls.appendChild(closeBtn);
        document.body.appendChild(controls);
      }
      
      if (!document.getElementById('drag-zone')) {
        const dragZone = document.createElement('div');
        dragZone.id = 'drag-zone';
        document.body.appendChild(dragZone);
      }
    `).catch(err => console.error('Erreur DOM injection:', err))
  })

  mainWindow.webContents.on('page-title-updated', (event, title) => {
    mainWindow.setTitle('Streamix')
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const urlObj = new URL(url)
    if (urlObj.hostname === "franime.fr" || urlObj.hostname.endsWith(".franime.fr") ||
        urlObj.hostname === "anime-sama.fr" || urlObj.hostname.endsWith(".anime-sama.fr") ||
        urlObj.hostname === "v6.voiranime.com" || urlObj.hostname.endsWith(".voiranime.com") ||
        urlObj.hostname.includes("discord.com") || urlObj.hostname.includes("discordapp.com") ||
        urlObj.hostname.includes("google.com") || urlObj.hostname.includes("googleapis.com") ||
        urlObj.hostname.includes("accounts.google.com")) {
      return { action: "allow" }
    }
    shell.openExternal(url)
    return { action: "deny" }
  })

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const urlObj = new URL(url)
    
    if (url === 'streamix://minimize') {
      event.preventDefault()
      mainWindow.minimize()
      return
    }
    if (url === 'streamix://close') {
      event.preventDefault()
      mainWindow.close()
      return
    }
    
    if (urlObj.hostname === "franime.fr" || urlObj.hostname.endsWith(".franime.fr") ||
        urlObj.hostname === "anime-sama.fr" || urlObj.hostname.endsWith(".anime-sama.fr") ||
        urlObj.hostname === "v6.voiranime.com" || urlObj.hostname.endsWith(".voiranime.com") ||
        urlObj.hostname.includes("discord.com") || urlObj.hostname.includes("discordapp.com") ||
        urlObj.hostname.includes("google.com") || urlObj.hostname.includes("googleapis.com") ||
        urlObj.hostname.includes("accounts.google.com")) {
      return
    }
    event.preventDefault()
    shell.openExternal(url)
  })
}

app.whenReady().then(() => {
  createWindow()
  createApplicationMenu()
  
  ipcMain.handle('minimize-window', () => {
    mainWindow.minimize()
  })
  
  ipcMain.handle('close-window', () => {
    mainWindow.close()
  })
  
  ipcMain.handle('show-dialog', (event, title, message) => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: title,
      message: title,
      detail: message,
      buttons: ['OK']
    })
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F2' && input.type === 'keyDown') {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'À propos de Streamix',
        message: 'Uniware Streamix v1.0.0',
        detail: 'Application dédiée pour le Streaming\n\nMalheureusement les pubs sont obligatoires sur notre Application, C\'est le seul moyen de soutenir les services gratuitement.\n\nFait avec ❤ par Uniware Team, Nous ne possédons pas les droits du site.\n\nNotre discord pour tout contact : https://discord.gg/u3SwvGVvGD',
        buttons: ['OK']
      })
    } else if (input.key === 'F3' && input.type === 'keyDown') {
      showServiceSelection(true)
    } else if (input.key === 'F1' && input.type === 'keyDown') {
      if (input.control) {
        const configPath = path.join(app.getPath('userData'), 'first-launch.json')
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath)
        }
        mainWindow.webContents.session.clearStorageData()
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Reset effectué',
          message: 'Les données ont été réinitialisées !',
          detail: 'L\'application va se fermer automatiquement.',
          buttons: ['OK']
        }).then(() => {
          app.quit()
        })
      } else {
        mainWindow.webContents.executeJavaScript(`
          try {
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
              if (currentUrl.includes('anime-sama.fr')) {
                homeUrl = 'https://anime-sama.fr/';
              } else if (currentUrl.includes('voiranime.com')) {
                homeUrl = 'https://v6.voiranime.com/';
              }
              
              const items = [
                {text: 'Accueil', action: \`window.location.href="\${homeUrl}"\`},
                {text: 'Actualiser', action: 'window.location.reload()'},
                {text: 'Précédent', action: 'window.history.back()'},
                {text: 'Suivant', action: 'window.history.forward()'},
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
                  menuItem.onclick = () => eval(item.action);
                  menu.appendChild(menuItem);
                }
              });
              
              // Ajouter le texte d'information en bas
              const infoText = document.createElement('div');
              infoText.textContent = 'F2: Plus d\\infos';
              infoText.style.cssText = 'padding:5px 10px;color:#ffffff;font-size:10px;opacity:0.6;text-align:center;border-top:1px solid #444;';
              menu.appendChild(infoText);
              
              document.body.appendChild(menu);
              
              // Fermer le menu si on clique ailleurs
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
        `).catch(err => console.error('Erreur executeJavaScript:', err))
      }
    }
  })

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

function createApplicationMenu() {
  const template = [
    {
      label: "Fichier",
      submenu: [
        {
          label: "Accueil",
          accelerator: "CmdOrCtrl+H",
          click: () => {
            const configPath = path.join(app.getPath('userData'), 'first-launch.json')
            let homeUrl = 'https://franime.fr/'
            
            if (fs.existsSync(configPath)) {
              const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
              if (config.serviceUrl) {
                homeUrl = config.serviceUrl
              }
            }
            
            mainWindow.loadURL(homeUrl)
          },
        },
        {
          label: "Historique",
          accelerator: "CmdOrCtrl+I",
          click: () => {
            showHistory()
          },
        },
        { type: "separator" },
        {
          label: "Quitter",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: "Édition",
      submenu: [
        { label: "Annuler", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Rétablir", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Couper", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copier", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Coller", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Tout sélectionner", accelerator: "CmdOrCtrl+A", role: "selectall" },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        { label: "Recharger", accelerator: "CmdOrCtrl+R", role: "reload" },
        { label: "Forcer le rechargement", accelerator: "CmdOrCtrl+Shift+R", role: "forceReload" },
        { type: "separator" },
        { label: "Zoom avant", accelerator: "CmdOrCtrl+Plus", role: "zoomIn" },
        { label: "Zoom arrière", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
        { label: "Taille réelle", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
        { type: "separator" },
        { label: "Plein écran", accelerator: "F11", role: "togglefullscreen" },
      ],
    },
    {
      label: "Navigation",
      submenu: [
        {
          label: "Précédent",
          accelerator: "Alt+Left",
          click: () => {
            if (mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack()
            }
          },
        },
        {
          label: "Suivant",
          accelerator: "Alt+Right",
          click: () => {
            if (mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward()
            }
          },
        },
        {
          label: "Actualiser",
          accelerator: "F5",
          click: () => {
            mainWindow.webContents.reload()
          },
        },
      ],
    },
    {
      label: "Aide",
      submenu: [
        {
          label: "Touches",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Raccourcis clavier",
              message: "Touches utiles",
              detail: "Commandes disponibles :\n\n• F1 : Afficher/cacher le menu\n• F3 : Changer de service\n• F11 : Mode plein écran\n• Ctrl+R : Actualiser\n• Ctrl+Shift+R : Forcer le rechargement\n• Alt+← / Alt+→ : Navigation\n• Ctrl+F1 : Réinitialiser l'application\n• Ctrl+H : Retour à l'accueil\n• Ctrl++ / Ctrl+- : Zoom\n• Ctrl+0 : Taille réelle",
              buttons: ["OK"],
            })
          },
        },
        {
          label: "À propos de Uniware",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "À propos de Uniware",
              message: "Uniware Streamix v1.0.0",
              detail: "Application dédiée pour le Streaming\n\nMalheureusement les pubs sont obligatoire sur notre Application, C'est le seul moyen de soutenir les services gratuitement.\n\nFait avec ❤ par Uniware Team, Nous ne possédons pas les droits du site.\n\nNotre discord pour tout contact : https://discord.gg/u3SwvGVvGD",
              buttons: ["OK"],
            })
          },
        },
        {
          label: "Site Web",
          click: () => {
            shell.openExternal("https://uniware.site")
          },
        },
      ],
    },
  ]

  if (process.platform === "darwin") {
    template.unshift({
      label: "Uniware",
      submenu: [
        { label: "À propos de Uniware", role: "about" },
        { type: "separator" },
        { label: "Masquer Uniware", accelerator: "Command+H", role: "hide" },
        { label: "Masquer les autres", accelerator: "Command+Shift+H", role: "hideothers" },
        { label: "Tout afficher", role: "unhide" },
        { type: "separator" },
        { label: "Quitter", accelerator: "Command+Q", click: () => app.quit() },
      ],
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function trackHistory(url) {
  if (url.includes('/watch/') || url.includes('/movie/') || url.includes('/serie/')) {
    const historyPath = path.join(app.getPath('userData'), 'history.json')
    let history = []
    
    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'))
    }
    
    const title = mainWindow.webContents.getTitle().replace('Streamix - ', '')
    const item = {
      title,
      url,
      date: new Date().toISOString(),
      type: url.includes('/movie/') ? 'film' : 'série'
    }
    
    history = history.filter(h => h.url !== url)
    history.unshift(item)
    history = history.slice(0, 50)
    
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2))
  }
}

function showHistory() {
  const historyPath = path.join(app.getPath('userData'), 'history.json')
  let history = []
  
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf8'))
  }
  
  if (history.length === 0) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Historique',
      message: 'Aucun historique',
      detail: 'Vous n\'avez pas encore regardé de contenu.',
      buttons: ['OK']
    })
    return
  }
  
  const historyText = history.slice(0, 20).map((item, i) => 
    `${i + 1}. ${item.title} (${item.type}) - ${new Date(item.date).toLocaleDateString()}`
  ).join('\n')
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Historique de visionnage',
    message: 'Derniers contenus regardés:',
    detail: historyText,
    buttons: ['Effacer l\'historique', 'Fermer']
  }).then(result => {
    if (result.response === 0) {
      fs.writeFileSync(historyPath, JSON.stringify([]))
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Historique effacé',
        message: 'L\'historique a été supprimé.',
        buttons: ['OK']
      })
    }
  })
}

function showServiceSelection(isChange = false) {
  const dialogOptions = {
    type: 'question',
    title: 'Bienvenue sur Streamix !',
    message: 'Choisissez votre service de streaming',
    detail: 'Sélectionnez le service que vous souhaitez utiliser :',
    buttons: isChange ? ['Franime (par défaut)', 'Animesama', 'Voiranime', 'Annuler'] : ['Franime (par défaut)', 'Animesama', 'Voiranime'],
    defaultId: 0,
    noLink: !isChange
  }
  
  if (isChange) {
    dialogOptions.cancelId = 3
  }
  
  dialog.showMessageBox(mainWindow, dialogOptions).then(result => {
    if (isChange && result.response === 3) return // Annuler
    let selectedUrl = 'https://franime.fr/'
    let serviceName = 'Franime'
    
    switch(result.response) {
      case 1:
        selectedUrl = 'https://anime-sama.fr/'
        serviceName = 'Animesama'
        break
      case 2:
        selectedUrl = 'https://v6.voiranime.com/'
        serviceName = 'Voiranime'
        break
    }
    
    const configPath = path.join(app.getPath('userData'), 'first-launch.json')
    fs.writeFileSync(configPath, JSON.stringify({ 
      firstLaunch: false, 
      selectedService: serviceName,
      serviceUrl: selectedUrl 
    }))
    
    mainWindow.loadURL(selectedUrl)
    
    setTimeout(() => {
      if (isChange) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Service changé',
          message: 'Service mis à jour !',
          detail: 'L\'application va se fermer pour appliquer les changements.',
          buttons: ['OK']
        }).then(() => {
          app.quit()
        })
      } else {
        showShortcutsDialog()
      }
    }, 1500)
  })
}

function showShortcutsDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Raccourcis utiles',
    message: 'Commandes disponibles',
    detail: 'Voici les raccourcis pour une meilleure expérience :\n\n• F1 : Afficher/cacher le menu\n• F3 : Changer de service\n• F11 : Mode plein écran\n• Ctrl+R : Actualiser\n• Alt+← / Alt+→ : Navigation\n• Ctrl+F1 : Réinitialiser l\'application\n\nProfitez bien de votre expérience !',
    buttons: ['Confirmer']
  })
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}