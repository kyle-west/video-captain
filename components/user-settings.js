((window) => {
  const { utils: { _, getPref, setPref } } = window
  const ELEMENT_TAG = 'user-settings'

  class UserSettings extends HTMLElement { 
    connectedCallback () {
      this.renderLoadingState()
      this.fetchData().then(() => this.render())
    }

    async fetchData () {
      if (this.settings) return this.settings
      this.settings = await window.fetch('/data/settings').then(r => r.json())
      return this.settings
    }

    renderLoadingState () {
      this.innerHTML = `Loading...`
    }

    render () {
      const { settings } = this
      this.innerHTML = `
        <div class="viewer">
          <main class="low-content">
            <h1>Settings</h1>
            
            <input type="checkbox" id="dark-mode"/>
            <label for="dark-mode">Dark Mode</label>

            <br/>
            <br/>
            <br/>

            <button id="shutdown-server" class="elevation-2 interact" ${ 
              settings.clientCanShutdownServer ? '' : 'disabled title="Update \`config.js\` if you wish to allow client to shut down server"' 
            }>Shutdown Video Captain Server</button>
          </main>
        </div>  
      `;

      this.bindListeners()
    }

    bindListeners () {
      this.querySelector('#shutdown-server').onclick = () => {
        window.fetch('/cmd/shutdown-server', {method: 'POST'})
          .then(r => console.log(r.status))
          .then(() => window.location.href = '/')
      }

      let darkMode = this.querySelector('#dark-mode')
      darkMode.checked = getPref('dark-mode')
      darkMode.onclick = ({ target: { checked } }) => {
        setPref("dark-mode", checked)
        document.body.classList.toggle('dark-mode')
      }
    }
  }

  if ('customElements' in window) {
    customElements.define(ELEMENT_TAG, UserSettings);
  } else {
    document.registerElement(ELEMENT_TAG, {prototype: Object.create(UserSettings.prototype)});
  }

})(window)