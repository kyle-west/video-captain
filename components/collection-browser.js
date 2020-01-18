((window) => {
  const { utils: { _ } } = window
  const ELEMENT_TAG = 'collection-browser'

  class CollectionBrowser extends HTMLElement {
    static get observedAttributes() { return ['bound-endpoint']; }

    attributeChangedCallback (name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this[_.attrToProp(name)] = newValue;
        if (name === 'bound-endpoint') {
          this.fetchData().then(() => this.render())
        } 
      }
    }
  
    connectedCallback () {
      this.renderLoadingState()
    }
    
    async fetchData () {
      if (this.collection) return this.collection
      this.collection = await window.fetch(this.boundEndpoint).then(r => r.json())
      return this.collection
    }
    
    renderLoadingState () {
      this.innerHTML = `<br/><br/><br/><br/><br/>Loading...`
    }
    
    render () {
      const { collection } = this
      if (!collection) return this.renderLoadingState()
      console.log(collection)

      this.innerHTML = `
        <div class="browser">
          ${_(collection.map(([ show, episodes ]) => `
            <details class="show" ${_(!show.substr(1).includes('/') && 'open')}>
              <summary>
                <h2>
                  ${_(show.replace('/', '').replace(/\//g, ': ').replace(/^\d\d /, ''))}
                </h2>
              </summary>
              <section class="episodes">
                ${_(episodes.map(({ file }) => `
                  <a class="video-thumbnail elevation-1 interact" href="?page=watch&now-playing=${encodeURIComponent(file)}">
                    ${file.replace(/\.\w+$/, '').replace(/^\d\d /, '')}
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

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, CollectionBrowser);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(CollectionBrowser.prototype)});
  }

})(window)