const utils = require('./utils');
const path = require('path');
const types = require('./migrate.types');

const tplPath =  path.resolve('./migration/tpl');
const distPath = path.resolve('./src/scss');

const fileWriteTasks = require('./class/FileWriteTasks');

module.exports = function (setting) {
  if (setting.change) {
    return change(setting.type, setting.name, setting.change);
  } else {
    if (Array.isArray(setting.name)) {
      let promises = [];
      for (let i = 0; i < setting.name.length; i++) {
        promises.push(generate(setting.type, setting.name[i], setting.template))
      }
      return Promise.all(promises);
    } else {
      return generate(setting.type, setting.name, setting.template);
    }
  }
};

function generate (type, name, template) {
  return new Promise((resolve, reject) => {
    // 出力ファイルパスの生成
    const filePath = type === types.scss
      ? distPath + utils.nameToFile(name) + '.scss'
      : distPath + '/' + type + 's/' + utils.nameToFileFirstUnderDots(name)  + '.scss';

    // テンプレートファイルパスの生成
    let tplFilePath = tplPath + '/' + template + '.tpl';
    if (type !== types.scss) {
      tplFilePath = tplPath + '/default.scss.tpl';
    }

    fileWriteTasks.createScssWriteTask({
      tplFilePath: tplFilePath,
      filePath: filePath,
      replacements: [
        ['{className}', utils.nameToFileKebab(name, type)]
      ],
      type: type,
      name: name
    });

    resolve();
  });
}

function change (type, name, change) {
  return Promise.resolve();
}
