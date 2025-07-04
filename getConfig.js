const { resolve } = require('path')
const { existsSync } = require('fs')

let configPath = process.env.VC_CONFIG || resolve(__dirname, './config.js')

if (!existsSync(configPath)) {
  console.warn(`[WARN] No config file found. Expected to find a config file at "${configPath}", but no such file exists. See https://github.com/kyle-west/video-captain#create-a-configjs-file for details on how to set one up.\n`)
  configPath = resolve(__dirname, '.defaults/default.config.js')
}

const { port, mountPath, mediaRoot, ready = null, log = null, settingsConfig = {} } = require(configPath)

const mediaRootPath = mediaRoot || mountPath // mountPath is deprecated, but we keep it for backwards compatibility until V2

if (!existsSync(mediaRootPath)) {
  console.error(new Error(`Expected to find a media root at "${mediaRootPath}", but no such folder exists. See https://github.com/kyle-west/video-captain#create-a-configjs-file for details.`))
  process.exit(30)
}

module.exports = {
  port,
  mediaRoot: mediaRootPath,
  ready,
  log,
  settingsConfig
}
