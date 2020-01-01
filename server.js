const ip = require("ip");
const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const { port, mountPath, ready = null, log = null } = require('./config')
const { videoFiles, organizedVideoFiles, sortedVideoFiles } = require('./mediaFiles')

const LOG_ITEM = (...logData) => {
  logData = logData.join(' ')
  let time = new Date()
  if (log) {
    log(logData, time.toISOString())
  } else {
    console.log(logData, time.toISOString())
  }
}

app.use('/assets', express.static(path.join(__dirname, 'public')))
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/favicon.ico')))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { videos : sortedVideoFiles });
});

app.get('/watch/:movieName', (req, res) => {
  const { movieName } = req.params
  const alikeVideos = videoFiles.find(x => x.file === movieName).folder
  res.render('watch', { movieName, additionalEpisodes: organizedVideoFiles[alikeVideos] || organizedVideoFiles[''] });
});

// Modified from https://gist.github.com/BetterProgramming/3bf5d66b0285a2690de684d46c4cabb4
// for better security and robstness
app.get('/video/:movieName', function(req, res) {
  const { movieName } = req.params
  const { file, folder, NOT_FOUND } = videoFiles.find(x => x.file === movieName) || { NOT_FOUND: 404 }
  
  if (NOT_FOUND) {
    console.log(`[${NOT_FOUND}] ABORTING VIDEO REQUEST "${movieName}"`)
    return res.sendStatus(NOT_FOUND)
  }

  const path = `${mountPath}${folder}/${file}`

  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    LOG_ITEM(`[206] SERVING VIDEO "${path}" to <${req.connection.remoteAddress}>`)
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    LOG_ITEM(`[200] SERVING VIDEO "${path}" to <${req.connection.remoteAddress}>`)
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});

app.listen(port, () => {
  let localhostURL = port === 80 ? 'http://localhost/' : `http://localhost:${port}/`
  let ipURL = port === 80 ? `http://${ip.address()}/` : `http://${ip.address()}:${port}/`
  LOG_ITEM(`${mountPath} media hosted at\n  ${localhostURL}\n  ${ipURL}`)
  ready && ready(ipURL)
})
