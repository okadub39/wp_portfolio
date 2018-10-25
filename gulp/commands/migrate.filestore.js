const utils = require('./utils');
const path = require('path');
const types = require('./migrate.types');

const routerFilePath = path.resolve('./src/router') + '/index.json';
const styleScssPath = path.resolve('./src/scss') + '/style.scss';

let routerData    = [];
let styleScssFile = '';

let addImports = [];

exports.init = function () {
  return Promise.all([
    readFile(routerFilePath),
    readFile(styleScssPath)
  ])
};

exports.addImportWrite = function (replacement) {
  addImports.push(replacement);
};

exports.routerPush = function (obj) {
  let exist = false;
  for (let i = 0; i < routerData.length; i++) {
    if (routerData[i].name == obj.name) {
      exist = true;
    }
  }
  if (!exist) {
    routerData.push(obj)
  }
};

exports.execWrite = function () {
  let newStyleScss = styleScssFile;
  for (let i = 0; i < addImports.length; i++) {
    newStyleScss = utils.replacer(newStyleScss, addImports[i]);
  }
  return Promise.all([
    writeFile(routerFilePath, routerData),
    writeFile(styleScssPath, newStyleScss),
  ]);
};

function readFile (path) {
  return new Promise((resolve, reject) => {
    utils.readFile(path)
      .then((data) => {
        if (path === routerFilePath) {
          routerData = JSON.parse(data);
        } else {
          styleScssFile = data;
        }
        resolve();
      })
      .catch(() => {
        reject();
      })
  })
}

function writeFile (path, data) {
  if (path === routerFilePath) {
    data = JSON.stringify(data, null, '  ');
  }
  return new Promise((resolve, reject) => {
    utils.writeFile(path, data, true)
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      })
  });
}