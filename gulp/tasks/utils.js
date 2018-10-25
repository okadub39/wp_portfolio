
const config = require('./config')

exports.resolveSrc = function (path) {
  return config.settings.srcPath + path
}
