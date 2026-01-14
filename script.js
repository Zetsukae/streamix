let pendingUrl = ""

function showWarningModal(url) {
  pendingUrl = url
  document.getElementById("warning-modal").classList.add("show")
}

function closeWarningModal() {
  document.getElementById("warning-modal").classList.remove("show")
  pendingUrl = ""
}

function confirmCopy() {
  if (pendingUrl) {
    copySource(pendingUrl)
    closeWarningModal()
  }
}

function copySource(url) {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showToast()
    })
    .catch((err) => {
      console.error("Erreur lors de la copie:", err)
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      showToast()
    })
}

function showToast() {
  const toast = document.getElementById("toast")
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      })
    }
  })
})
