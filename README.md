# Video Captain

_WIP_ serve up a folder of video files for your pleasure of viewing on a locally hosted server.

## `config.js`

You will need to set up your `config.js` in the root of this project. It should be of the form:

```js
module.exports = {
  port: process.env.PORT || 5555, // the port you want the server to host at
  mountPath: '/media/videos/or/whatever', // path to the folder you want to serve items from
}
```