const fs = require('fs')
const path = require('path')
const { mediaRoot } = require('./getConfig')

const isSupportedMediaType = x => ['.m4v', '.mp4'].reduce((a,c) => a || x.endsWith(c), false)

function walkMediaFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      files = walkMediaFiles(path.join(dir, file), files);
    }
    else if (isSupportedMediaType(file)) {
      files.push({file, folder: dir.replace(mediaRoot, '')});
    }
  });
  return files;
};

const videoFiles = walkMediaFiles(mediaRoot)

const organizedVideoFiles = {}
videoFiles.forEach(video => {
  const { file, folder } = video
  organizedVideoFiles[folder] = organizedVideoFiles[folder] || []
  organizedVideoFiles[folder].push(video)
})

const sortedVideoFiles = [
  ...Object.keys(organizedVideoFiles)
    .sort().filter(k => !!k)
    .map(show => [  show, organizedVideoFiles[show] ]), 
    organizedVideoFiles[''] ? [ 'Other Shows', organizedVideoFiles[''] ] : undefined
].filter(Boolean);

module.exports = { videoFiles, organizedVideoFiles, sortedVideoFiles }