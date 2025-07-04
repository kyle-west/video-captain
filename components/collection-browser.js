((window) => {
  const { utils: { _, fetch } } = window
  const ELEMENT_TAG = 'collection-browser'

  class CollectionBrowser extends HTMLElement {
    static get observedAttributes() { return ['bound-endpoint', 'related-to']; }

    attributeChangedCallback (name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this[_.attrToProp(name)] = newValue;
        if (name === 'bound-endpoint') {
          this.fetchData().then(() => this.render())
        } 
      }
    }
  
    connectedCallback () {
      this.render()
    }
    
    async fetchData () {
      this.collection = await fetch(this.boundEndpoint)
      return this.collection
    }

    renderLoadingState () {
      this.innerHTML = `<br/><br/><br/><br/><br/><div class="browser">Loading...<span class="hack-episode-alignment"></span></div>`
    }

    renderMediaMissingState () {
      this.innerHTML = `<br/><br/><br/><br/><br/><div class="browser">
        No playable media found. Add some videos to your <code>mediaRoot</code> directory and restart VideoCaptain to see them here.
        See the docs for more details: <a href="https://github.com/kyle-west/video-captain" target="_blank">VideoCaptain Docs</a>.
      </div>`
    }
    
    render () {
      const { collection, relatedTo } = this
      if (!collection) return this.renderLoadingState()
      if (relatedTo) {
        const [[, episodes ]] = collection
        this.innerHTML = `
          ${_(episodes.map(({ file }) => `
            <a class="video-thumbnail elevation-1 interact ${ relatedTo === file ? 'current-video': ''}" href="/watch/${encodeURIComponent(file)}">
              ${_.file(file)}
            </a>
          `))}
          ${
            // HACK to get the last row to always justify nicely
            `<span class="hack-episode-alignment"></span>`.repeat(8)
          }
        `;
      } else {
        if (!collection.length) return this.renderMediaMissingState()
        this.innerHTML = `
          <div class="browser">
            ${_(collection.map(([ show, episodes ]) => `
              <details class="show" ${_(!show.substr(1).includes('/') && 'open')}>
                <summary>
                  <h2>
                    ${_(_.folder(show))}
                  </h2>
                </summary>
                <section class="episodes">
                  ${_(episodes.map(({ file }) => `
                    <a class="video-thumbnail elevation-1 interact" href="/watch/${encodeURIComponent(file)}" style=background-image:url("/thumbnail/${encodeURIComponent(file)}");>
                      ${_.file(file)}
                    </a>
                  `))}
                  ${
                    // HACK to get the last row to always justify nicely
                    `<span class="hack-episode-alignment"></span>`.repeat(8)
                  }
                </section>
              </details>
            `))}
          </div>
        `;
      }
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, CollectionBrowser);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(CollectionBrowser.prototype)});
  }

})(window)