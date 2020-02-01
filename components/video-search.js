((window) => {
  const { utils: { _, fetch } } = window
  const ELEMENT_TAG = 'video-search'

  class VideoSearch extends HTMLElement {
    static get observedAttributes() { return ['bound-endpoint', 'fuzzy-input']; }

    attributeChangedCallback (name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this[_.attrToProp(name)] = decodeURIComponent(newValue);
        this.fetchData().then(() => this.render())
      }
    }
  
    connectedCallback () {
      this.render()
    }
    
    async fetchData () {
      const {boundEndpoint} = this
      if (!boundEndpoint) return
      this.collection = await fetch(boundEndpoint)
      return this.collection
    }
    
    renderLoadingState () {
      this.innerHTML = `<br/><br/><br/><br/><br/>Loading...</span>`
    }

    search() {
      const { collection, fuzzyInput } = this
      const matches = []
      const fuzzy = fuzzyInput.trim().toLowerCase();
      collection.forEach(item => {
        const { file, folder } = item
        const fileL = file.toLowerCase()
        const folderL = folder.toLowerCase()
        
        if (fileL.includes(fuzzy)) matches.push({ rank: 1, item, matchType: 'file' })
        // if (folderL.includes(fuzzy)) matches.push({ rank: 2, item, matchType: 'folder' })
      })
      return matches.sort((a, b) => a.rank - b.rank)
    }
    
    render () {
      const { collection, fuzzyInput } = this
      if (!collection || !fuzzyInput) return this.renderLoadingState()
      const results = this.search()
      console.log(results)
      this.innerHTML = `
        <pre class="results">${results.length} result${results.length === 1 ? '' : 's'} found for ${fuzzyInput}</pre>
        <div class="browser">
          <section class="episodes">
            ${_(results.map(({ item : {file} }) => `
              <a class="video-thumbnail elevation-1 interact" href="/watch/${encodeURIComponent(file)}">
                ${file.replace(/\.\w+$/, '').replace(/^\d\d /, '')}
              </a>
            `))}
            ${
              // HACK to get the last row to always justify nicely
              `<span class="hack-episode-alignment"></span>`.repeat(8)
            }
          </section>
        </div>
      `
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, VideoSearch);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(VideoSearch.prototype)});
  }

})(window)