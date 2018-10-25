const Tasks = require('./Tasks');
const utils = require('../utils');
const types = require('../migrate.types');
const fileStore = require('../migrate.filestore');

/**
 * ファイル作成用タスククラス
 */
class FileWriteTasks extends Tasks {
  /**
   * ejsファイルの生成タスク
   * @param tplFilePath
   * @param filePath
   * @param replacements
   * @param name
   * @param type
   * @param meta
   */
  createEjsWriteTask ({tplFilePath, filePath, replacements, name, type, meta}) {
    this.pushTask(() => {
      return new Promise ((resolve, reject) => {
        // テンプレートファイルリード
        utils.readFile(tplFilePath)
          .then((data) => {
            // 内容置換
            let fd = data;
            replacements.forEach((replacement) => {
              fd = utils.replacer(fd, replacement);
            });
            // ファイル出力
            utils.writeFile(filePath, fd)
              .then(() => {
                // ルーター追加
                if (type === types.page) {
                  fileStore.routerPush({
                    name       : name,
                    title      : meta.title,
                    description: meta.description
                  });
                }
                return Promise.resolve();
              })
              .then(() => {
                resolve([tplFilePath, '>> ' + filePath]);
              })
          })
          .catch((err) => {
            reject('generate error');
          });
      })
    })
  }

  /**
   * scssファイルの生成タスク
   * @param tplFilePath
   * @param filePath
   * @param replacements
   * @param type
   * @param name
   */
  createScssWriteTask ({tplFilePath, filePath, replacements, type, name}) {
    this.pushTask(() => {
      return new Promise ((resolve, reject) => {
        // テンプレートファイルリード
        utils.readFile(tplFilePath)
          .then((data) => {
            // 内容置換
            let fd = data;
            replacements.forEach((replacement) => {
              fd = utils.replacer(fd, replacement);
            });
            // ファイル出力
            utils.writeFile(filePath, fd)
              .then(() => {

                let dir = type + 's';
                if (type === types.scss) {
                  let ns = name.split('/');
                  dir = ns.length > 1 ? ns[0] : false;
                }

                if (type === types.scss) {
                  if (dir) {
                    fileStore.addImportWrite(['//{' + dir + '}', '@import "'+ name + '";\n//{' + dir + '}']);
                  } else {
                    fileStore.addImportWrite([null, '\n@import "' + name + '";']);
                  }
                } else {
                  fileStore.addImportWrite(['//{' + dir + '}', '@import "' + dir + '/' + utils.nameToFileDots(name) + '";\n//{' + dir + '}']);
                }

                resolve([tplFilePath, '>> ' + filePath]);
              })
          })
          .catch((err) => {
            reject('generate error');
          });

      })
    })
  }
}

module.exports = new FileWriteTasks();
