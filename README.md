# Video Captain

Serve up a folder of video files for your pleasure of viewing on a locally hosted server.

![screen shot](./docs/screenshot.png)

## Setting up

First, clone the repo onto your machine and install.

```sh
git clone https://github.com/kyle-west/video-captain.git
npm install
```

### Create a `config.js` file

Next, you will need to set up your `config.js` in the root of video captain. It should be of the form:

```js
module.exports = {
  mountPath: '/media/videos/',  // [REQUIRED] path to the folder you want to serve videos from
  port: 8080,                   // [OPTIONAL] the port you want the server to host at (default 5555)
  settingsConfig: {             // [OPTIONAL] make some custom preferences for how the system runs
    clientCanShutdownServer: true,  // allow setting on client side to shutdown server
  }
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