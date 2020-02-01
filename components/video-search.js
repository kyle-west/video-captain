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
      const fuzzy = fuzzyInput.toLowerCase();
      collection.forEach(item => {
        const { file, folder } = item
        const fileL = file.toLowerCase()
        const folderL = folder.toLowerCase()
        
        if (fileL.includes(fuzzy)) matches.push({ rank: 1, item, matchType: 'file' })
        if (folderL.includes(fuzzy)) matches.push({ rank: 2, item, matchType: 'folder' })
      })
      return matches.sort((a, b) => a.rank - b.rank)
    }
    
    render () {
      const { collection, fuzzyInput } = this
      if (!collection || !fuzzyInput) return this.renderLoadingState()
      const results = this.search()
      this.innerHTML = `
        <pre>${results.length} result${results.length === 1 ? '' : 's'} found for ${fuzzyInput}</pre>
        <pre>${JSON.stringify(results,null,2)}</pre>
      `
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, VideoSearch);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(VideoSearch.prototype)});
  }

})(window)