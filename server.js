// ----------------------------------------------------------------------------------------
// General Libraries 
// ----------------------------------------------------------------------------------------
const express = require('express')
const fs = require('fs')
const path = require('path')
const ip = require("ip");


// ----------------------------------------------------------------------------------------
// App Specific Configs and Utils
// ----------------------------------------------------------------------------------------
const { port, mountPath, ready = null, log = null, settingsConfig = {} } = require('./config')
const { videoFiles, organizedVideoFiles, sortedVideoFiles } = require('./mediaFiles')

// Logging helper
const LOG_ITEM = (...logData) => {
  logData = logData.join(' ')
  let time = new Date()
  if (log) {
    log(logData, time.toISOString())
  } else {
    console.log(logData, time.toISOString())
  }
}


// ----------------------------------------------------------------------------------------
// App Setup and Common Middleware
// ----------------------------------------------------------------------------------------
const app = express()


// ----------------------------------------------------------------------------------------
// Data Services
// ----------------------------------------------------------------------------------------
app.get('/data/videos', (req, res) => res.json(sortedVideoFiles));
app.get('/data/videos/flat', (req, res) => res.json(videoFiles));
app.get('/data/videos/related/:movieName', (req, res) => {
  const { movieName } = req.params
  const alikeVideos = videoFiles.find(x => x.file === movieName).folder
  // match format of `sortedVideoFiles`
  res.json([[alikeVideos , organizedVideoFiles[alikeVideos] || organizedVideoFiles['']]])
});

app.get('/data/settings', (req, res) => res.json(settingsConfig));


// ----------------------------------------------------------------------------------------
// Video Serving
// ----------------------------------------------------------------------------------------
app.get('/video/:movieName', (req, res) => {
  const { movieName } = req.params
  const { file, folder, NOT_FOUND } = videoFiles.find(x => x.file === movieName) || { NOT_FOUND: 404 }
  
  if (NOT_FOUND) {
    console.log(`[${NOT_FOUND}] ABORTING VIDEO REQUEST "${movieName}"`)
    return res.sendStatus(NOT_FOUND)
  }

  const itemPath = `${mountPath}${folder}/${file}`

  const { range } = req.headers
  const { size } = fs.statSync(itemPath)
  let streamConfig;

  if (range) {
    LOG_ITEM(`[206] SERVING VIDEO "${itemPath}" to <${req.connection.remoteAddress}>`)

    let [ start, end ] = range.replace(/bytes=/, "").split("-");
    start = parseInt(start, 10);
    end = end ? parseInt(end, 10) : size-1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': (end - start) + 1,
      'Content-Type': 'video/mp4',
    });

    streamConfig = { start, end }
  } else {
    LOG_ITEM(`[200] SERVING VIDEO "${itemPath}" to <${req.connection.remoteAddress}>`)

    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': 'video/mp4',
    });
  }

  fs.createReadStream(itemPath, streamConfig).pipe(res);
});


// ----------------------------------------------------------------------------------------
// Command Services
// ----------------------------------------------------------------------------------------
app.post('/cmd/shutdown-server', (req, res) => {
  if (settingsConfig.clientCanShutdownServer) {
    LOG_ITEM("Received command to shutdown. Method allowed, shutting server down now.")
    res.sendStatus(200)
    process.exit(200);
  } else {
    LOG_ITEM("Received command to shutdown. Method NOT allowed, ignoring.")
    res.sendStatus(403)
  }
});


// ----------------------------------------------------------------------------------------
// Static Assets
// ----------------------------------------------------------------------------------------
app.use('/assets', express.static(path.join(__dirname, 'assets')))
app.use('/components', express.static(path.join(__dirname, 'components')))
app.use('/favicon.ico', express.static(path.join(__dirname, 'assets/favicon.ico')))
app.use('/packages/dragon-router', express.static(path.join(__dirname, 'node_modules/dragon-router/dist/dragon-router.min.js')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets/index.html'))
});


// ----------------------------------------------------------------------------------------
// Boot Up the Server
// ----------------------------------------------------------------------------------------
app.listen(port, () => {
  let localhostURL = port === 80 ? 'http://localhost/' : `http://localhost:${port}/`
  let ipURL = port === 80 ? `http://${ip.address()}/` : `http://${ip.address()}:${port}/`
  LOG_ITEM(`${mountPath} media hosted at\n  ${localhostURL}\n  ${ipURL}`)
  ready && ready(ipURL)
})