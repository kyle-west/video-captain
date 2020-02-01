((window) => {
  const { utils: { _ } } = window
  const ELEMENT_TAG = 'nav-bar'

  class NavBar extends HTMLElement {
    static get observedAttributes() { return ['now-playing', 'search-value']; }

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
      const { nowPlaying, searchValue } = this
      this.innerHTML = `
        <nav class="elevation-3">
          <a href="/"><span class="title">Video Captain</span>
            ${_(nowPlaying && `<span class="now-playing">Now Playing: ${nowPlaying}</span>`)}
          </a>
          <input id="search-bar" ${searchValue ? `value="${searchValue}"` : ''}/>
          <a href="/settings" class="settings-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
            </svg>
          </a>
        </nav>
      `;

      this.attachBindings()
    }

    attachBindings () {
      this.cleanUpListeners()
      const searchBar = this.querySelector('#search-bar')
      
      this.listeners.push([
        searchBar,
        [
          'keyup', ({key, currentTarget: {value}}) => {
            if (key === 'Enter') {
              window.attachedRouter.navigate(value ? `/search/${encodeURIComponent(value)}` : '/')
            }
          }
        ]
      ])
      this.listeners.push([
        searchBar,
        [
          'focus', () => {
            const last = searchBar.value.length
            searchBar.setSelectionRange(last, last);
          }
        ]
      ])

      this.listeners.push([
        window,
        [
          'keyup', ({key, target}) => {
            if (key === '/' && target !== searchBar) {
              searchBar.focus()
            }
          }
        ]
      ])

      this.listeners.forEach(([element, listener]) => element.addEventListener(...listener))
      if (this.searchValue) searchBar.focus()
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, NavBar);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(NavBar.prototype)});
  }

})(window)