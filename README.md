# Video Captain

Serve up a folder of video files for your pleasure of viewing on a locally hosted server.

## `config.js`

You will need to set up your `config.js` in the root of this project. It should be of the form:

```js
module.exports = {
  port: process.env.PORT || 5555, // the port you want the server to host at
  mountPath: '/media/videos/or/whatever', // path to the folder you want to serve items from
}
```

You may also specify a couple callbacks that hook into the life cycle of this app. 
- **`function ready (fullURL)`** receives the following string `http://<ip-address>:<port>` and runs when the server is ready to use
- **`function log (logEntry, timeRecorded)`** receives to strings and can be used to record interesting data for your purposes

```js
const { open } = require('openurl')

module.exports = {
  ready: (fullURL) => {
    open(fullURL) // or whatever is you want
  },
  log: (logEntry, timeRecorded) => {
    console.log(`[${timeRecorded}]: ${logEntry}`) // or write to disk
  },
  ...
}
```