const ip = require("ip");
const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const { port, mountPath } = require('./config')


const isSupportedMediaType = x => ['.m4v', '.mp4'].reduce((a,c) => a || x.endsWith(c), false)

function walkMediaFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      files = walkMediaFiles(path.join(dir, file), files);
    }
    else if (isSupportedMediaType(file)) {
      files.push({file, folder: dir.replace(mountPath, '')});
    }
  });
  return files;
};

const videoFiles = walkMediaFiles(mountPath)

const organizedVideoFiles = {}
videoFiles.forEach(video => {
  const { file, folder } = video
  organizedVideoFiles[folder] = organizedVideoFiles[folder] || []
  organizedVideoFiles[folder].push(video)
})
const sortedVideoFiles = [...Object.keys(organizedVideoFiles).sort().filter(k => !!k).map(show => [ show, organizedVideoFiles[show] ]), [ 'Other Shows', organizedVideoFiles[''] ] ]

app.use('/assets', express.static(path.join(__dirname, 'public')))
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
    console.log(`[206] SERVING VIDEO "${path}"`)
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    console.log(`[200] SERVING VIDEO "${path}"`)
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});

app.listen(port, () => console.log(`${mountPath} media hosted at\n  http://localhost:${port}\n  http://${ip.address()}:${port}`))
