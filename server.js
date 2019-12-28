const ip = require("ip");
const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const { port, mountPath } = require('./config')

app.use('/assets', express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', {foo: 'FOO'});
});

app.get('/watch/:movieName', (req, res) => {
  res.render('watch', { movieName: req.params.movieName });
});

// Modified from https://gist.github.com/BetterProgramming/3bf5d66b0285a2690de684d46c4cabb4
// for better security and robstness
app.get('/video/:movieName', function(req, res) {
  const { movieName } = req.params
  const path = `${mountPath}/${movieName}.m4v`
  const fileOK = /^[A-z ]+$/.test(movieName) && fs.existsSync(path)
  
  if (!fileOK) {
    let status = /^[A-z ]+$/.test(movieName) ? 404 : 403
    console.log(`[${status}] ABORTING VIDEO "${path}"`)
    return res.sendStatus(status)
  }

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
    console.log(`[200] SERVING VIDEO "${path}"`)
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