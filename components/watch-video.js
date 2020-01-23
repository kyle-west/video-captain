((window) => {
  const { utils: { _ } } = window
  const ELEMENT_TAG = 'watch-video'

  class WatchEpisode extends HTMLElement {
    static get observedAttributes() { return ['now-playing', 'related-videos']; }

    attributeChangedCallback (name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this[_.attrToProp(name)] = newValue;
        this.render()
      }
    }
  
    connectedCallback () {
      this.render()
    }

    cleanUpListeners () {
      if (this.listeners) {
        this.listeners.forEach(([element, listener]) => element.removeEventListener(...listener))
      }
      this.listeners = []
    }
    
    disconnectedCallback () {
      this.cleanUpListeners()
    }
    
    render () {
      let { nowPlaying, relatedVideos = '[]' } = this
      relatedVideos = JSON.parse(relatedVideos)

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
            <collection-browser related-to="${decodeURIComponent(nowPlaying)}" bound-endpoint="/data/videos/related/${nowPlaying}"></collection-browser>
          </aside>
        </div>
      `;

      this.setUpPlayer()
    }
    
    setUpPlayer () {
      this.cleanUpListeners()
      const videoPlayer = this.querySelector('video')
      this.listeners.push([
        videoPlayer,
        [
          'ended', () => {
            let nextVideo = document.querySelector('.video-thumbnail.current-video + .video-thumbnail')
            if (nextVideo) {
              console.log('Video Ended, Playing Next')
              nextVideo.click()
            } else {
              console.log('Video Ended')
            }
          }
        ]
      ])

      this.listeners.push([
        videoPlayer,
        [
          'keydown', (e) => {
            const { key } = e
            switch(key) {
              case 'f':
                e.preventDefault()
                videoPlayer.requestFullscreen()
                videoPlayer.focus()
                break;
            }
          }
        ]
      ])

      this.listeners.forEach(([element, listener]) => element.addEventListener(...listener))
      videoPlayer.focus()
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, WatchEpisode);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(WatchEpisode.prototype)});
  }

})(window)