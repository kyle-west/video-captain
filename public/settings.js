function bindSettings() {
  document.getElementById('shutdown-server').onclick = () => {
    window.fetch('/shutdown-server', {method: 'POST'})
      .then(r => console.log(r.status))
      .then(() => window.location.href = '/')
  }

  let darkMode = document.getElementById('dark-mode')
  darkMode.onclick = ({ target: { checked } }) => {
    setPref("dark-mode", checked)
    document.body.classList.toggle('dark-mode')
  }
  darkMode.checked = getPref('dark-mode')

}