const path = require('path');
const utils = require('./utils');
const types = require('./migrate.types');
const _ = require('lodash');
const semver = require('semver');
require('date-utils');

const engines = require('../package.json').engines;
const nodeVersion = engines.node;
if (!semver.satisfies(process.version, nodeVersion)) {
  utils.messenger(`Required node version ${nodeVersion} not satisfied with current version ${process.version}.`, 'alert');
  process.exit(0);
}

const migrateEjs = require('./migrate.ejs');
const migrateScss = require('./migrate.scss');

const fileStore = require('./migrate.filestore');

const historyJsonPath = path.resolve('./migration') + '/migrations.json';
const migrationsPath = path.resolve('./migration/migrations');

const fileWriteTasks = require('./class/FileWriteTasks');

// ファイル存在確認
if (!utils.isExistFile(historyJsonPath)) {
  utils.messenger(['history file is not found.'], 'alert');
  process.exit();
}

let history = '';

/**
 * 履歴ファイル、ルーターファイル、style.scssを取得して処理開始
 */
Promise.all([
  utils.readFile(historyJsonPath),
  fileStore.init()
]).then((data) => {
  try {
    history = JSON.parse(data[0]);
    main();
  } catch (err) {
    throw err;
  }
});

/**
 * マイグレート開始
 */
function main () {
  utils.readDir(migrationsPath).then((files) => {
    let migrations = [];
    files.forEach((v) => {
      if (!isMigrated(v)) {
        migrations.push(v)
      }
    });
    if (migrations.length === 0) {
      utils.messenger('Already migrated', 'notice');
      process.exit();
    }
    execAllMigrations(migrations)
      .then(() => {
        // ファイル生成
        fileWriteTasks.execTasks()
          .then(() => {
            // すべてのファイル処理終了
            return fileStore.execWrite()
          })
          .then(() => {
            endMigrate(_.flattenDeep(fileWriteTasks.messages));
          })
      });
  })
}

/**
 * すべてのマイグレートを走らせる
 * @param migrations
 */
function execAllMigrations (migrations) {
  let promises = [];
  migrations.forEach((v) => {
    const p = new Promise((resolve, reject) => {
      execMigration(migrationsPath + '/' + v)
        .then(() => {
          // マイグレーションファイル単位でのファイル操作完了した
          pushHistory(v);
          resolve();
        });
    });
    promises.push(p)
  });
  // すべてのマイグレーションファイルでファイル操作が終わる通知を返す
  return Promise.all(promises);
}

/**
 * マイグレートファイル単位でマイグレーションの実行
 * @param migrationPath
 */
function execMigration (migrationPath) {
  let promises = [];
  const setting = require(migrationPath);

  const errors = validateMigration(setting, [
    {
      key: 'type',
      required: true,
      types: ['string']
    },
    {
      key: 'name',
      required: true,
      types: ['string']
    }
  ]);

  if (errors.length > 0) {
    errors.forEach((error) => {
      if (error.msg === 'required') {
        utils.messenger('"' + error.key + '" key is required for the migration file. "' + migrationPath + '"', 'alert');
      } else {
        utils.messenger( error.msg + ' "' + migrationPath + '"', 'alert');
      }
    });
    process.exit();
  }

  const args = setting;

  switch (setting.type) {
    case types.page:
      if (setting.targets.scss && setting.targets.ejs) {
        promises.push(migrateScss(args));
      }
      if (setting.targets.ejs) {
        promises.push(migrateEjs(args));
      }
      break;
    case types.component:
    case types.global:
      if (setting.targets.scss) {
        promises.push(migrateScss(args));
      }
      if (setting.targets.ejs) {
        promises.push(migrateEjs(args));
      }
      break;
    case types.scss:
      promises.push(migrateScss(args));
      break;
  }
  // すべてのファイル操作が終わる通知を返す
  return Promise.all(promises);
}

function validateMigration (setting, validate) {
  let errors = [];
  validate.forEach((v) => {
    if (v.required) {
      if (!setting[v.key]) {
        errors.push({
          key: v.key,
          msg: 'required'
        })
      }
    }
  });
  //if (errors.length === 0) {
  //  if (setting.type === types.scss && setting.name.split('/').length <= 1) {
  //    errors.push = {
  //      key: 'name',
  //      msg: 'name value is invalid.'
  //    }
  //  }
  //}
  return errors;
}

/**
 * migrate済みかどうか
 * @param file
 * @returns {boolean}
 */
function isMigrated (file) {
  for (var i = 0; i < history.length; i++) {
    if (history[i].file == file) return true
  }
  return false
}

/**
 * 履歴に追加する
 * @param fileName
 */
function pushHistory (fileName) {
  const dt = new Date();
  const date =  dt.toFormat('YYYYMMDDHHMISS');
  history.push({
    date: date,
    file: fileName
  });
}

/**
 * 最終処理
 */
function endMigrate (msgs) {
  // write history
  utils.writeFile(historyJsonPath, JSON.stringify(history, null, '  '), true)
    .then(() => {
      utils.messenger(msgs);
      utils.messenger('Complete!');
      process.exit();
    })
    .catch(() => {
      utils.messenger('Failure to write to history file', 'alert');
      process.exit();
    })
}