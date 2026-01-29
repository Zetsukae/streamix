// URLs de téléchargement directs
const DOWNLOAD_URLS = {
    windows: "https://github.com/Zetsukae/streamix/releases/download/STABLE-Streamix-1.0.0/Streamix.Setup.1.0.0.exe",
    linux: "https://github.com/Zetsukae/streamix/releases/download/STABLE-Streamix-1.0.0/Streamix-1.0.0.AppImage",
    other: "https://github.com/Zetsukae/streamix/releases"
};

// Empreintes SHA256 pour la vérification
const SHA_KEYS = {
    windows: "93825bafba8cc57bd2221a5b1cfb3195d8431d0b1136b6278bb5d5792900848f",
    linux: "613edd42877b7fd0dcefa4bc82b17277226fa111f71ea886e37565b29d36dc3e"
};

/**
 * Détecte le système d'exploitation de l'utilisateur
 */
function getOS() {
    const platform = window.navigator.platform;
    const userAgent = window.navigator.userAgent;
    
    if (['Win32', 'Win64', 'Windows'].includes(platform)) return 'Windows';
    if (/Linux/.test(platform)) return 'Linux';
    if (['Macintosh', 'MacIntel'].includes(platform)) return 'macOS';
    if (/Android/.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
    
    return 'unknown';
}

/**
 * Met à jour les boutons de téléchargement et affiche le SHA correspondant
 */
function updateDownloadLinks() {
    const os = getOS();
    const heroBtn = document.getElementById('heroDownloadBtn');
    const heroText = document.getElementById('heroDownloadText');
    const mainBtn = document.getElementById('mainDownloadBtn');
    const mainText = document.getElementById('mainDownloadText');
    const shaDisplay = document.getElementById('shaDisplay');

    if (!heroBtn || !mainBtn) return;

    let url = DOWNLOAD_URLS.other;
    let message = "Voir les versions";
    let sha = "";
    let available = true;

    // Logique de sélection selon l'OS
    if (os === 'Windows') {
        url = DOWNLOAD_URLS.windows;
        message = "Télécharger pour Windows";
        sha = SHA_KEYS.windows;
    } else if (os === 'Linux') {
        url = DOWNLOAD_URLS.linux;
        message = "Télécharger pour Linux";
        sha = SHA_KEYS.linux;
    } else if (['macOS', 'Android', 'iOS'].includes(os)) {
        message = `Aucune version pour ${os}`;
        available = false;
    }

    // Application des changements aux boutons
    [heroBtn, mainBtn].forEach(btn => {
        btn.href = url;
        if (!available) {
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
            btn.title = "Aucune version disponible pour votre appareil";
            btn.onclick = (e) => e.preventDefault();
        }
    });

    if (heroText) heroText.innerText = message;
    if (mainText) mainText.innerText = message;

    // Affichage du code de vérification SHA256
    if (sha && shaDisplay) {
        shaDisplay.innerHTML = `Vérification SHA256 : <br><code>${sha}</code>`;
        shaDisplay.style.display = "block";
    }
}

/**
 * Gestion des bulles animées en arrière-plan
 */
function createBubbles() {
  const container = document.getElementById("bubbles")
  if (!container) return

  const bubbleCount = 15
  for (let i = 0; i < bubbleCount; i++) {
    createBubble(container)
  }

  setInterval(() => {
    if (container.children.length < 20) {
      createBubble(container)
    }
  }, 3000)
}

function createBubble(container) {
  const bubble = document.createElement("div")
  bubble.className = "bubble"
  const size = Math.random() * 50 + 10
  bubble.style.width = `${size}px`
  bubble.style.height = `${size}px`
  bubble.style.left = `${Math.random() * 100}%`
  const duration = Math.random() * 15 + 15
  bubble.style.animationDuration = `${duration}s`
  bubble.style.animationDelay = `${Math.random() * 5}s`
  container.appendChild(bubble)

  setTimeout(() => {
    if (bubble.parentNode) {
      bubble.parentNode.removeChild(bubble)
    }
  }, (duration + 5) * 1000)
}

/**
 * Initialisation au chargement du DOM
 */
document.addEventListener("DOMContentLoaded", () => {
    createBubbles();
    updateDownloadLinks();
    
    // Smooth scroll pour les liens internes
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;
        
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
});
