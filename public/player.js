window.__videoPlayer__ = null;
function getPlayer () {
  if (!window.__videoPlayer__) {
    window.__videoPlayer__ = document.getElementById('videoPlayer')
    window.__videoPlayer__.addEventListener('ended', () => {
      let nextVideo = document.querySelector('.video-thumbnail.current-video + .video-thumbnail')
      if (nextVideo) {
        console.log('Video Ended, Playing Next')
        nextVideo.click()
      } else {
        console.log('Video Ended')
      }
    })
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