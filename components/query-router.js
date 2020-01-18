((window) => {
  const ELEMENT_TAG = 'query-router'

  class QueryRouter extends HTMLElement {
    connectedCallback () {
      this._childList = [...this.children]
      this.routes = Object.fromEntries(this._childList.map(x => [x.getAttribute('page'),x]))
      this.defaultRoute = this._childList.find(x => x.getAttribute('default-route') !== null) || this._childList[0]
      console.log('ROUTES: ', this.routes)
      console.log('DEFAULT: ', this.defaultRoute)

      this._pageChange = this.pageChange.bind(this)
      
      this.pageChange()
      
      // window.addEventListener('popstate', this._pageChange)
      // window.addEventListener('popstate', this._pageChange)
    }
    
    pageChange () {
      const ctx = Object.fromEntries(window.location.search.slice(1).split('&').map(x => x.split('=')));
      Object.values(this.routes || {}).forEach(child => child.classList.add('hide'));
      const newPage = (this.routes[ctx.page] || this.defaultRoute)
      Object.entries(ctx).forEach(([k,v]) => newPage.setAttribute(k,v))
      newPage.classList.remove('hide');
    }
    
    disconnectedCallback () {
      // window.removeEventListener('pushstate', this._pageChange)
      // window.removeEventListener('popstate', this._pageChange)
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, QueryRouter);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(QueryRouter.prototype)});
  }

})(window)