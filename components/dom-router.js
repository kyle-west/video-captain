((window) => {
  const { Router, utils: { _ } } = window
  const ELEMENT_TAG = 'dom-router'

  function nowPlayingMiddleware (ctx, next) {
    const { nowPlaying, fuzzyInput = '' } = ctx.params
    const nowPlayingTitle = nowPlaying ? decodeURIComponent(nowPlaying).replace(/\.\w+$/, '').replace(/^\d\d /, '') : ''
    const navBar = document.querySelector('nav-bar')
    navBar.setAttribute('now-playing', nowPlayingTitle)
    navBar.setAttribute('search-value', decodeURIComponent(fuzzyInput))
    document.title = `VIDEO CAPTAIN ${_(nowPlayingTitle && `| ${nowPlayingTitle}`)}`
    next()
  }

  class DOMRouter extends HTMLElement {
    connectedCallback () {
      this._childList = [...this.children]
      this.routes = Object.fromEntries(this._childList.map(x => [x.getAttribute('page'),x]))
      this.defaultRoute = this._childList.find(x => x.getAttribute('default-route') !== null) || this._childList[0]

      const router = new Router({ registerOn: window, routerId: 'video-captain' })
      router.use(nowPlayingMiddleware)
      router.use('/watch/:nowPlaying', (ctx) => this.render(this.routes.watch, ctx))
      router.use('/search/:fuzzyInput?', (ctx) => this.render(this.routes.search, ctx))
      router.use('/:page/:item?', (ctx) => this.render(this.routes[ctx.params.page] || this.defaultRoute, ctx))
      router.use(['/', '*'], (ctx) => this.render(this.defaultRoute, ctx))
      router.start()
      this.router = router
    }
   
    disconnectedCallback () {
      this.router.unregister()
    }

    render (page, ctx) {
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
      this.appendChild(page)
      
      const { nowPlaying, fuzzyInput } = ctx.params
      if (nowPlaying) page.setAttribute('now-playing', nowPlaying)
      if (fuzzyInput) page.setAttribute('fuzzy-input', fuzzyInput)
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, DOMRouter);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(DOMRouter.prototype)});
  }

})(window)