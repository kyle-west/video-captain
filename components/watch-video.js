((window) => {
  const { utils: { _ } } = window
  const ELEMENT_TAG = 'watch-video'

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

  class WatchEpisode extends HTMLElement {
    static get observedAttributes() { return ['now-playing']; }

    attributeChangedCallback (name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this[_.attrToProp(name)] = newValue;
        if (name === 'now-playing') this.render()
      }
    }
  
    connectedCallback () {
      this.render()
    }

    render () {
      const { nowPlaying } = this

      if (!nowPlaying) {
        return this.innerHTML = 'No video selected' 
      }

      this.innerHTML = `
        <div class="viewer">
          <main>
            <video id="videoPlayer" controls autoplay>
              <source src="/video/${nowPlaying}" type="video/mp4">
            </video>
          </main>
          <aside>
            <span class="hack-episode-alignment"></span>
            <span class="hack-episode-alignment"></span>
            <span class="hack-episode-alignment"></span>
            <span class="hack-episode-alignment"></span>
            <span class="hack-episode-alignment"></span>
            <span class="hack-episode-alignment"></span>
            <span class="hack-episode-alignment"></span>
            <span class="hack-episode-alignment"></span>
          </aside>
        </div>
      `;

      getPlayer().focus()
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, WatchEpisode);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(WatchEpisode.prototype)});
  }

})(window)