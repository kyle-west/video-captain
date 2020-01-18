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
  window.getPref = function getPref(name, def) {
    return JSON.parse(window.localStorage.getItem(name)) || def
  }
  window.setPref = function setPref(name, value) {
    return window.localStorage.setItem(name, JSON.stringify(value))
  }
  if (window.getPref('dark-mode')) {
    document.body.classList.add('dark-mode')
  }


  window.utils = utils;
})(window)