((window) => {
  const { Router, utils: { _ } } = window
  const ELEMENT_TAG = 'query-router'

  function nowPlayingMiddleware (ctx, next) {
    const { nowPlaying } = ctx.params
    const nowPlayingTitle = nowPlaying ? decodeURIComponent(nowPlaying).replace(/\.\w+$/, '').replace(/^\d\d /, '') : ''
    const navBar = document.querySelector('nav-bar')
    navBar.setAttribute('now-playing', nowPlayingTitle)
    document.title = `VIDEO CAPTAIN ${_(nowPlayingTitle && `| ${nowPlayingTitle}`)}` 
  }

  class QueryRouter extends HTMLElement {
    connectedCallback () {
      this._childList = [...this.children]
      this.routes = Object.fromEntries(this._childList.map(x => [x.getAttribute('page'),x]))
      this.defaultRoute = this._childList.find(x => x.getAttribute('default-route') !== null) || this._childList[0]

      const router = new Router({ registerOn: window })
      router.use(nowPlayingMiddleware)
      router.use('/watch/:nowPlaying', (ctx) => this.render(this.routes.watch, ctx))
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
      
      const { nowPlaying } = ctx.params
      if (nowPlaying) page.setAttribute('now-playing', nowPlaying)
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, QueryRouter);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(QueryRouter.prototype)});
  }

})(window)