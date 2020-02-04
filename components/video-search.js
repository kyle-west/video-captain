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
      const matches = {
        rank1: [],
        rank2: [],
        rank3: [],
      }
      const fuzzy = fuzzyInput.trim().toLowerCase();
      const fuzzyRE = new RegExp(fuzzy.split('').join('\\w*'))
      window.meh=fuzzyRE
      console.log(fuzzyRE)
      collection.forEach(item => {
        const { file, folder } = item
        const fileL = file.toLowerCase()
        const folderL = folder.toLowerCase()
        
        if (fileL.includes(fuzzy)) {
          matches.rank1.push(item)
        } else if (fuzzyRE.test(fileL)) {
          matches.rank2.push(item)
        } else if (folderL.includes(fuzzy)) {
          matches.rank3.push(item)
        }
      })
      matches.length = matches.rank1.length + matches.rank2.length
      return matches
    }
    
    render () {
      const { collection, fuzzyInput } = this
      if (!collection || !fuzzyInput) return this.renderLoadingState()
      const results = this.search()
      console.log(results)
      this.innerHTML = `
        <pre class="results">${results.length} result${results.length === 1 ? '' : 's'} found for ${fuzzyInput}</pre>
        <div class="browser">

          ${_(results.rank1.length > 0 && `<section class="episodes">
            ${_(results.rank1.map(({file, folder}) => `
              <a class="video-thumbnail elevation-1 interact caption" style="--caption-text:'${_.folder(folder)}';background: var(--bg-interactive-active);" href="/watch/${encodeURIComponent(file)}">
                ${_.file(file)}
              </a>
            `))}
            ${`<span class="hack-episode-alignment"></span>`.repeat(8)}
          </section>`)}
          ${_(results.rank2.length > 0 && `<section class="episodes">
            ${_(results.rank2.map(({file, folder}) => `
              <a class="video-thumbnail elevation-1 interact caption" style="--caption-text:'${_.folder(folder)}';background: var(--bg-interactive-active-secondary);" href="/watch/${encodeURIComponent(file)}">
                ${_.file(file)}
              </a>
            `))}
            ${`<span class="hack-episode-alignment"></span>`.repeat(8)}
          </section>`)}
          ${_(results.rank3.length > 0 && `<section class="episodes">
            ${_(results.rank3.map(({file, folder}) => `
              <a class="video-thumbnail elevation-1 interact caption" style="--caption-text:'${_.folder(folder)}';" href="/watch/${encodeURIComponent(file)}">
                ${_.file(file)}
              </a>
            `))}
            ${`<span class="hack-episode-alignment"></span>`.repeat(8)}
          </section>`)}
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