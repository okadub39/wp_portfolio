const utils = require('./utils');
const path = require('path');
const types = require('./migrate.types');

const tplPath =  path.resolve('./migration/tpl');
const distPath = path.resolve('./src/ejs');

const fileWriteTasks = require('./class/FileWriteTasks');

module.exports = function (setting) {
  if (setting.change) {
    return change(setting.type, setting.name, setting.change);
  } else {
    if (Array.isArray(setting.name)) {
      let promises = [];
      for (let i = 0; i < setting.name.length; i++) {
        promises.push(generate(setting.type, setting.name[i], setting.template, setting.meta))
      }
      return Promise.all(promises);
    } else {
      return generate(setting.type, setting.name, setting.template, setting.meta);
    }
  }
};

function generate (type, name, template, meta) {
  return new Promise((resolve, reject) => {
    // 出力ファイルパスの生成
    const filePath = type === types.page
      ? distPath + '/' + name + '.ejs'
      : distPath + '/' + type + 's' + utils.nameToFile(name) + '.ejs';

    // テンプレートファイルパスの生成
    const tplFilePath = tplPath + '/' + template + '.tpl';

    // nameから_headへの相対パスを計算
    const dirDepth = name.split('/').length;
    let toHeadRelative = './';
    if (dirDepth > 1) {
      toHeadRelative = '';
      for (let i = 1; i < dirDepth; i++) {
        toHeadRelative += '../'
      }
    }
    fileWriteTasks.createEjsWriteTask({
      tplFilePath: tplFilePath,
      filePath: filePath,
      replacements: [
        ['{head}', "<%- include('" + toHeadRelative + "_head', {page: '" + name + "'}); %>"],
        ['{className}', utils.nameToFileKebab(name, type)]
      ],
      name: name,
      type: type,
      meta: meta
    });
    resolve();
  });
}

function change (type, name, change) {
  return Promise.resolve();
}
