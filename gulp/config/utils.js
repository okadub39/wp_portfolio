const path = require('path');

/**
 * create entry points object
 * @param entryPoints
 * @param srcPath
 * @returns {{}}
 */
exports.createEntry = function (entryPoints, srcPath) {
  let entryPointsObj = {};
  for (let i = 0; i < entryPoints.length; i++) {
    const entryName = entryPoints[i];
    entryPointsObj[entryName] = srcPath + '/js/' + entryName + '.js';
  }
  return entryPointsObj;
};

/**
 * node modules か返す
 * @param module
 * @param count
 * @returns {*|boolean}
 */
exports.isNodeModules = function (module, count) {
  return (
    module.resource &&
    /\.js$/.test(module.resource) &&
    module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0
  )
};

