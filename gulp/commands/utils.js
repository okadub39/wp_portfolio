const fs = require('fs');
const fse = require('fs-extra');
const printMessage = require('print-message');
const Confirm = require('prompt-confirm');
const types = require('./migrate.types');

/**
 * ファイル確認用prompt生成
 * @param file
 */
exports.createConfirmOverWritePrompt = function(file) {
  return new Confirm({
    name: 'allowOverwrite',
    message: 'Can you overwrite file?: "' + file + '"' + ' :'
  });
};

/**
 * ファイルの存在確認
 * @param file
 * @returns {boolean}
 */
exports.isExistFile = function (file) {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
};

/**
 * ファイル読み取り
 * @param path
 * @returns {Promise}
 */
exports.readFile = function (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        exports.messenger([err], 'alert');
        reject(err);
        process.exit();
      } else {
        resolve(data);
      }
    });
  })
};

/**
 * ディレクトリのファイル一覧取得
 * @param path
 * @returns {Promise}
 */
exports.readDir = function (path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, function(err, files){
      if (err) {
        exports.messenger([err], 'alert');
        reject(err);
        process.exit();
      } else {
        resolve(files);
      }
    });
  })
};

/**
 * ファイル生成
 * @param file
 * @param data
 * @param forceWrite
 * @returns {Promise}
 */
exports.writeFile = function (file, data, forceWrite = false) {
  if (exports.isExistFile(file) && !forceWrite) {
    const overwritePrompt = exports.createConfirmOverWritePrompt(file);
    return overwritePrompt.run().then((res) => {
      if (res) {
        return execWriteFile(file, data);
      } else {
        exports.messenger(['Command was interrupted.'], 'notice');
        process.exit();
      }
    });
  } else {
    return execWriteFile(file, data)
  }
};
function execWriteFile (file, data) {
  return new Promise ((resolve, reject) => {
    fse.outputFile(file, data, (err) => {
      if (err) {
        exports.messenger([err], 'alert');
        process.exit();
      } else {
        resolve();
      }
    });
  })
}

/**
 * Messenger
 * @param messages
 * @param type
 */
exports.messenger = function (messages, type = 'success') {
  let m = [];
  if (Array.isArray(messages)) {
    m = messages;
  } else {
    m.push(messages);
  }

  let design = {
    border: true, // Enable border
    color: 'default', // Default text color from console
    borderColor: 'green', // Border color is yellow
    borderSymbol: '─', // Symbol that uses for border
    sideSymbol: '│', // Symbol that uses for side separators
    leftTopSymbol: '┌', // Symbol that uses for left top corner
    leftBottomSymbol: '└', // Symbol that uses for left bottom corner
    rightTopSymbol: '┐', // Symbol that uses for right top corner
    rightBottomSymbol: '┘', // Symbol that uses for right bottom corner
    marginTop: 0, // Margin before border is begins
    marginBottom: 0, // Margin after border is ends
    paddingTop: 0, // Padding after border begins
    paddingBottom: 0, // Padding before border ends
    printFn: process.stdout.write.bind(process.stdout) // Custom function for print generated message
  };

  if (type == 'alert') {
    design.borderColor = 'red'
  }

  if (type == 'notice') {
    design.borderColor = 'yellow'
  }

  printMessage(m, design);
};

/**
 * 置換
 * @param origin
 * @param replacement
 */
exports.replacer = function (origin, replacement) {
  if (replacement[0] === null) {
    return origin + replacement;
  } else {
    const r = new RegExp(replacement[0], 'g');
    return origin.replace(r, replacement[1]);
  }
};

/**
 * name をファイルようパスに変更
 * @param str
 * @returns {string}
 */
exports.nameToFile = function (str) {
  const strDirSplit = str.split('/');
  let n = '';
  for (let i = 0; i < strDirSplit.length; i++) {
    if (i === strDirSplit.length - 1) {
      n += '/_' + strDirSplit[i];
    } else {
      n += '/' + strDirSplit[i]
    }
  }
  return n
};

/**
 * nameをアンダースコアつきのファイルパスに変更
 * @param str
 * @returns {string}
 */
exports.nameToFileUnder = function (str) {
  const strDirSplit = str.split('/');
  let n = '';
  for (let i = 0; i < strDirSplit.length; i++) {
    n += '_' +strDirSplit[i]
  }
  return n
};

/**
 * nameをアンダースコアつきのドットつなぎのファイルパスに変更
 * @param str
 * @returns {string}
 */
exports.nameToFileFirstUnderDots = function (str) {
  const strDirSplit = str.split('/');
  let n = '';
  for (let i = 0; i < strDirSplit.length; i++) {
    if (i === 0) {
      n += '_' +strDirSplit[i]
    } else {
      n += '.' +strDirSplit[i]
    }
  }
  return n
};

/**
 * nameをアドットつなぎのファイルパスに変更
 * @param str
 * @returns {string}
 */
exports.nameToFileDots = function (str) {
  const strDirSplit = str.split('/');
  let n = '';
  for (let i = 0; i < strDirSplit.length; i++) {
    if (i === 0) {
      n += strDirSplit[i]
    } else {
      n += '.' +strDirSplit[i]
    }
  }
  return n
};

/**
 * nameをケバブケースに（クラス名）に変更
 * @param str
 * @param type
 * @returns {string}
 */
exports.nameToFileKebab = function (str, type) {
  const strDirSplit = str.split('/');
  let n = '';
  let startIndex = 0;
  if (type === types.scss) {
    startIndex = 1
  }
  for (let i = startIndex; i < strDirSplit.length; i++) {
    if (i === strDirSplit.length - 1) {
      n += strDirSplit[i];
    } else {
      n += strDirSplit[i] + '-'
    }
  }
  return n
};
