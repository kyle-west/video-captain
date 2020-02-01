((window) => {
  const utils = {}

  // FORMATTING
  utils._ = (statement) => {
    if (statement instanceof Array) {
      return statement.join(' ')
    } else if (statement) {
      return statement
    } else {
      return ''
    }
  }
  utils._.attrToProp = (x) => x.replace(/(\-\w)/g, m => m[1].toUpperCase())
  
  
  // Preferences
  utils.getPref = function getPref(name, def) {
    return JSON.parse(window.localStorage.getItem(name)) || def
  }
  utils.setPref = function setPref(name, value) {
    return window.localStorage.setItem(name, JSON.stringify(value))
  }

  // SHOW CURRENT SETTINGS
  if (utils.getPref('dark-mode')) {
    document.body.classList.add('dark-mode')
  }

  const cachedData = {}
  utils.fetch = (url, options = {}) => {
    const { volatile } = options;
    if (volatile || !cachedData[url]) {
      cachedData[url] = window.fetch(url, options)
    }
    return cachedData[url].then(res => {
      if (res instanceof Response && !res.bodyUsed) {
        return res.clone();
      } else {
        return res;
      }
    }).then(r => r.json())
  }


  window.utils = utils;
})(window)