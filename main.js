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

  mainWindow.loadURL("https://franime.fr/")

  console.log('Streamix démarré avec succès')

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    
    const configPath = path.join(app.getPath('userData'), 'first-launch.json')
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({ firstLaunch: false }))
      
      setTimeout(() => {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Bienvenue sur Streamix !',
          message: 'Bienvenue sur Streamix',
          detail: 'Cette application vous permet de regarder des animes plus simplement et rapidement.\n\nCommandes utiles :\n• F1 : Afficher/cacher le menu\n• F11 : Mode plein écran\n• Ctrl+R : Actualiser\n• Alt+← / Alt+→ : Navigation\n• Ctrl+F1 : Réinitialiser l\'application\n\nProfitez bien de votre expérience !',
          buttons: ['Compris !']
        })
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
    
    mainWindow.webContents.executeJavaScript(`
      if (!document.getElementById('streamix-search-btn')) {
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
        homeBtn.onclick = () => window.location.href = 'https://franime.fr/';
        document.body.appendChild(homeBtn);
      }
      
      if (!document.getElementById('window-controls')) {
        const controls = document.createElement('div');
        controls.id = 'window-controls';
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.id = 'minimize-btn';
        minimizeBtn.textContent = '-';
        minimizeBtn.onclick = () => {
          if(window.electronAPI) window.electronAPI.minimize();
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.id = 'close-btn';
        closeBtn.textContent = 'X';
        closeBtn.onclick = () => {
          if(window.electronAPI) window.electronAPI.close();
        };
        
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
        detail: 'Application dédiée pour le Streaming\n\nMalheureusement les pubs sont obligatoires sur notre Application, C\'est le seul moyen de soutenir franime.fr gratuitement.\n\nFait avec ❤ par Uniware Team, Nous ne possédons pas les droits du site.\n\nNotre discord pour tout contact : https://discord.gg/u3SwvGVvGD',
        buttons: ['OK']
      })
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
          detail: 'Redémarrez l\'application pour actualiser correctement.',
          buttons: ['OK']
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
              
              const items = [
                {text: 'Accueil', action: 'window.location.href="https://franime.fr/"'},
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
            mainWindow.loadURL("https://franime.fr/")
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
              detail: "Commandes disponibles :\n\n• F1 : Afficher/cacher le menu\n• F11 : Mode plein écran\n• Ctrl+R : Actualiser\n• Ctrl+Shift+R : Forcer le rechargement\n• Alt+← / Alt+→ : Navigation\n• Ctrl+F1 : Réinitialiser l'application\n• Ctrl+H : Retour à l'accueil\n• Ctrl++ / Ctrl+- : Zoom\n• Ctrl+0 : Taille réelle",
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
              detail: "Application dédiée pour le Streaming\n\nMalheureusement les pubs sont obligatoire sur notre Application, C'est le seul moyen de soutenir franime.fr gratuitement.\n\nFait avec ❤ par Uniware Team, Nous ne possédons pas les droits du site.\n\nNotre discord pour tout contact : https://discord.gg/u3SwvGVvGD",
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