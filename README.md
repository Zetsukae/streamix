# Streamix 📺

> **L'expérience de streaming centralisée, sécurisée et immersive.**

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey?style=flat-square)
![Status](https://img.shields.io/badge/status-Stable-success?style=flat-square)

**Streamix** est une application de bureau open-source basée sur **Electron**. Elle permet de centraliser vos sources de streaming favorites (animes, séries) dans une interface unifiée, sécurisée et débarrassée des distractions habituelles des navigateurs web.

---

## 📥 Téléchargement

Streamix est disponible pour **Windows** et **Linux**.

| Système | Type | Lien |
| :--- | :--- | :--- |
| **Windows** | Installeur `.exe` | [Bientôt disponible] |
| **Linux** | Portable `.AppImage` | Disponible |

> *Les liens de téléchargement de Windows peuvent être ajoutés quelques jours après Linux, regardez souvent l'onglet [Releases].*

---

## ✨ Fonctionnalités

### 🔒 Sécurité Avancée
* **Protection des Sources** : Utilisation d'un header unique (`X-Streamix-Key`) et d'une signature User-Agent (`StreamixApp`) pour restreindre l'accès aux sources.
* **Navigation Sécurisée** : Restriction stricte aux domaines **GitHub Pages** (`.github.io`) pour éviter le chargement de scripts malveillants.
* **Isolation** : Chaque source tourne dans un environnement sandboxé.

### 🌍 Interface & Internationalisation
* **Multilingue** : Interface entièrement traduite en **Français 🇫🇷, Anglais 🇺🇸, Espagnol 🇪🇸, Allemand 🇩🇪 et Japonais 🇯🇵**.
* **Styles de Fenêtre** :
  * **Immersif** : Fenêtre sans bordure, aux couleurs de l'application.
  * **Natif** : Fenêtre standard de votre système d'exploitation.
* **Animations** : Interface fluide avec animations CSS (désactivables).

### 🎮 Expérience Utilisateur
* **Menu Overlay (F1)** : Accès rapide aux fonctions (Accueil, Actualiser, Paramètres) via la touche `F1` ou le bouton flottant.
* **Menu Contextuel** : Clic droit complet (Copier, Coller, Précédent, Suivant, Ouvrir dans le navigateur).
* **Mode Cinéma** : Suppression automatique des distractions visuelles sur les sites supportés.

---

## 🛠️ Installation (Développement)

Si vous souhaitez contribuer au projet ou compiler votre propre version.

### Prérequis
* **Node.js** (v16 ou supérieur)
* **npm** ou **yarn**

 1. Cloner le projet
```
git clone [https://github.com/zetsukae/streamix](https://github.com/zetsukae/streamix)
cd streamix
```
Ou via :
```
Code > Download ZIP
```
### 2. Installer les dépendances
```
npm install
```

### 3. Lancer en mode dev
```
npm start
```

### 4. Compiler l'application (Build)
```
# Pour Windows
npm run build:win

# Pour Linux
npm run build:linux
```

---

## ⚙️ Structure Technique

```
streamix/
├── main.js          # Processus Principal (Sécurité, Fenêtres, IPC)
├── preload.js       # Pont sécurisé (ContextBridge)
├── contextMenu.js   # Gestion du menu clic droit
├── locales.js       # Fichier de traductions (FR, EN, ES, DE, JA)
├── settings.html    # Interface des paramètres
├── setup.html       # Interface de premier lancement
├── assets/          # Icônes et images
└── dist/            # Dossier de sortie des builds
```

### Mécanisme de Sécurité
L'application injecte automatiquement les éléments suivants dans les requêtes vers les sources :
* **Header** : `X-Streamix-Key: zetsukaedagoat`
* **User-Agent** : Ajout du suffixe `StreamixApp`

Cela permet aux développeurs de sources web de vérifier que la requête provient bien de l'application officielle tout en bloquant l'accès via un navigateur standard.

---

## ⚖️ Avertissement Légal

**Streamix** est un logiciel open source agissant comme un **navigateur web spécialisé**.

* Streamix ne détient, n’héberge, ne distribue ni ne contrôle aucun contenu audiovisuel.
* Les sources accessibles via l’application sont des services tiers indépendants.
* L’utilisateur est seul responsable de l’utilisation qu’il fait du logiciel et doit s’assurer de respecter la législation en vigueur dans son pays concernant le droit d'auteur.

---

## ❤️ Crédits

Projet imaginé et développé par **Zetsukae**.

* **Licence** : MIT
* **Discord** : [Rejoindre la communauté](https://discord.gg/u3SwvGVvGD)
* **Site Web** : [uniware.site](https://uniware.site)
