// URLs de téléchargement
const DOWNLOAD_URLS = {
    windows: "https://github.com/Zetsukae/streamix/releases/download/STABLE-Streamix-1.0.0/Streamix.Setup.1.0.0.exe",
    linux: "https://github.com/Zetsukae/streamix/releases/download/STABLE-Streamix-1.0.0/Streamix-1.0.0.AppImage",
    other: "https://github.com/Zetsukae/streamix/releases"
};

// Fonction de détection de l'OS
function getOS() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    if (macosPlatforms.indexOf(platform) !== -1) return 'macOS';
    if (iosPlatforms.indexOf(platform) !== -1) return 'iOS';
    if (windowsPlatforms.indexOf(platform) !== -1) return 'Windows';
    if (/Android/.test(userAgent)) return 'Android';
    if (!/Android/.test(userAgent) && /Linux/.test(platform)) return 'Linux';

    return 'unknown';
}

// Mise à jour de l'interface selon l'OS
function updateDownloadLinks() {
    const os = getOS();
    const heroBtn = document.getElementById('heroDownloadBtn');
    const heroText = document.getElementById('heroDownloadText');
    const mainBtn = document.getElementById('mainDownloadBtn');
    const mainText = document.getElementById('mainDownloadText');

    if (!heroBtn || !mainBtn) return;

    let url = "";
    let message = "";
    let isAvailable = true;

    switch (os) {
        case 'Windows':
            url = DOWNLOAD_URLS.windows;
            message = "Télécharger pour Windows";
            break;
        case 'Linux':
            url = DOWNLOAD_URLS.linux;
            message = "Télécharger pour Linux";
            break;
        case 'macOS':
        case 'Android':
        case 'iOS':
            url = DOWNLOAD_URLS.other;
            message = "Indisponible sur " + os;
            isAvailable = false;
            break;
        default:
            url = DOWNLOAD_URLS.other;
            message = "Voir les versions";
    }

    // Appliquer les changements
    [heroBtn, mainBtn].forEach(btn => {
        btn.href = url;
        if (!isAvailable) {
            btn.style.opacity = "0.7";
            btn.title = "Aucune version n'est disponible pour cet appareil";
        }
    });

    heroText.innerText = message;
    mainText.innerText = message;
}

// --- Garder tes anciennes fonctions ---

function createBubbles() {
    const container = document.getElementById("bubbles")
    if (!container) return
    const bubbleCount = 15
    for (let i = 0; i < bubbleCount; i++) { createBubble(container) }
    setInterval(() => {
        if (container.children.length < 20) { createBubble(container) }
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
    setTimeout(() => { if (bubble.parentNode) { bubble.parentNode.removeChild(bubble) } }, (duration + 5) * 1000)
}

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
    createBubbles();
    updateDownloadLinks();
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href !== "#") {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    });
});
