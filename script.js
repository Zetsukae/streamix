// Création des bulles animées
function createBubbles() {
  const container = document.getElementById("bubbles")
  if (!container) return

  const bubbleCount = 15

  for (let i = 0; i < bubbleCount; i++) {
    createBubble(container)
  }

  // Créer de nouvelles bulles périodiquement
  setInterval(() => {
    if (container.children.length < 20) {
      createBubble(container)
    }
  }, 3000)
}

function createBubble(container) {
  const bubble = document.createElement("div")
  bubble.className = "bubble"

  // Taille aléatoire entre 10px et 60px
  const size = Math.random() * 50 + 10
  bubble.style.width = `${size}px`
  bubble.style.height = `${size}px`

  // Position horizontale aléatoire
  bubble.style.left = `${Math.random() * 100}%`

  // Durée d'animation lente (15-30 secondes)
  const duration = Math.random() * 15 + 15
  bubble.style.animationDuration = `${duration}s`

  // Délai aléatoire
  bubble.style.animationDelay = `${Math.random() * 5}s`

  container.appendChild(bubble)

  // Supprimer la bulle après l'animation
  setTimeout(
    () => {
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble)
      }
    },
    (duration + 5) * 1000,
  )
}

// Initialiser les bulles au chargement
document.addEventListener("DOMContentLoaded", createBubbles)

// Smooth scroll pour les liens internes
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})
