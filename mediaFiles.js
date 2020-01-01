const fs = require('fs')
const path = require('path')
const { mountPath } = require('./config')


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

const sortedVideoFiles = [
  ...Object.keys(organizedVideoFiles)
    .sort().filter(k => !!k)
    .map(show => [  show, organizedVideoFiles[show] ]), 
  [ 'Other Shows', organizedVideoFiles[''] ] 
];

module.exports = { videoFiles, organizedVideoFiles, sortedVideoFiles }