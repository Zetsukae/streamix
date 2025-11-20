# Streamix - Application de Streaming d'Animes

Une application Electron dédiée pour regarder des animes sur plusieurs services avec une interface optimisée et des fonctionnalités avancées.

## 🚀 Fonctionnalités

### Interface Utilisateur
- **Fenêtre sans bordure** avec contrôles personnalisés (réduire/fermer)
- **Boutons de navigation** intégrés (Accueil, Recherche)
- **Menu contextuel F1** avec accès rapide aux fonctions principales
- **Styles CSS personnalisés** pour masquer les éléments indésirables du site

### Navigation et Contrôles
- **Raccourcis clavier** :
  - `F1` : Afficher/cacher le menu de navigation
  - `F2` : Afficher les informations "À propos"
  - `F11` : Mode plein écran
  - `Ctrl+R` : Actualiser la page
  - `Ctrl+Shift+R` : Forcer le rechargement
  - `Alt+←/→` : Navigation précédent/suivant
  - `Ctrl+F1` : Réinitialiser l'application
  - `Ctrl+H` : Retour à l'accueil
  - `Ctrl+I` : Afficher l'historique

### Fonctionnalités Avancées
- **Historique de visionnage** automatique des films et séries
- **Gestion des sessions** avec sauvegarde des préférences
- **Sécurité renforcée** avec navigation limitée aux domaines autorisés
- **Menu contextuel** personnalisé avec clic droit
- **Réinitialisation complète** des données utilisateur

### Compatibilité
- **Multi-plateforme** : Windows, macOS (Prochainement), Linux
- **Intégration système** avec notifications natives
- **Gestion des liens externes** automatique

## 📦 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Lancement en développement
```bash
npm start
# ou
npm run dev
```

### Build de l'application
```bash
# Build pour toutes les plateformes
npm run build

# Build spécifique
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🛠️ Structure du Projet

```
streamix/
├── main.js          # Processus principal Electron
├── preload.js       # Script de préchargement sécurisé
├── package.json     # Configuration et dépendances
├── assets/          # Ressources (icônes, styles)
│   ├── icon.ico     # Icône Windows
│   ├── icon.icns    # Icône macOS
│   ├── icon.png     # Icône Linux
│   └── style.css    # Styles personnalisés
└── dist/           # Builds de production
```

## ⚙️ Configuration

### Domaines Autorisés
L'application limite la navigation aux domaines suivants :
- `franime.fr` et ses sous-domaines
- `discord.com` (pour le support)
- `google.com` (pour l'authentification)

### Données Utilisateur
- **Historique** : `~/.config/streamix/history.json`
- **Configuration** : `~/.config/streamix/first-launch.json`
- **Cache** : Géré automatiquement par Electron

## 🎯 Utilisation

1. **Premier lancement** : Message de bienvenue avec les raccourcis
2. **Navigation** : Utilisez les boutons intégrés ou les raccourcis clavier
3. **Menu F1** : Accès rapide aux fonctions principales
4. **Historique** : Suivi automatique des contenus visionnés
5. **Réinitialisation** : `Ctrl+F1` pour remettre à zéro

## 🔧 Développement

### Technologies Utilisées
- **Electron** : Framework d'application desktop
- **Node.js** : Runtime JavaScript
- **HTML/CSS/JS** : Interface utilisateur

### Scripts Disponibles
- `npm start` : Lancement en mode développement
- `npm run build` : Build pour toutes les plateformes
- `npm run build:win` : Build Windows uniquement
- `npm run build:mac` : Build macOS uniquement
- `npm run build:linux` : Build Linux uniquement

## 📝 Licence

Ce projet est sous licence GPL-2.0. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

Développé avec ❤️ par **Uniware Team**

- Discord : [https://discord.gg/u3SwvGVvGD](https://discord.gg/u3SwvGVvGD)
- Site Web : [https://uniware.site](https://uniware.site)

## ⚠️ Avertissement

Cette application est un client pour plusieurs services. Nous ne possédons pas les droits du contenu diffusé. Les publicités sont obligatoires pour soutenir le site gratuitement.

## 🐛 Signaler un Bug

Pour signaler un problème ou suggérer une amélioration :
1. Ouvrez une issue sur GitHub
2. Rejoignez notre Discord pour un support direct
3. Décrivez le problème avec le maximum de détails

## 🔄 Mises à Jour

L'application vérifie automatiquement les mises à jour au démarrage. Les nouvelles versions incluent :
- Corrections de bugs
- Nouvelles fonctionnalités
- Améliorations de performance
- Mises à jour de sécurité

## ⚠️ Avertissement légal

Streamix est un logiciel open-source fourni à titre éducatif et pour des usages légaux.
Nous **ne sommes pas responsables** de l’utilisation du logiciel pour accéder à des contenus protégés par le droit d’auteur.

L’utilisateur doit s’assurer que tout flux ou contenu qu’il regarde via Streamix respecte la législation locale et les droits des créateurs.