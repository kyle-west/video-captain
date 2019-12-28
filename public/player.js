window.__videoPlayer__ = null;
function getPlayer () {
  if (!window.__videoPlayer__) {
    window.__videoPlayer__ = document.getElementById('videoPlayer')
  }
  return window.__videoPlayer__
}

document.addEventListener('keydown', (e) => {
  const { key } = e
  console.log(key)
  const player = getPlayer()
  switch(key) {
    case 'f':
      e.preventDefault()
      player.requestFullscreen()
      player.focus()
      break;
  }
})