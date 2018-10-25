const path = require('path');
const utils = require('./utils');
const createFile = require('./createMigration');
const minimist = require('minimist');
const semver = require('semver');
require('date-utils');

const engines = require('../package.json').engines;
const nodeVersion = engines.node;
if (!semver.satisfies(process.version, nodeVersion)) {
  utils.messenger(`Required node version ${nodeVersion} not satisfied with current version ${process.version}.`, 'alert');
  process.exit(0);
}

// option.type取得
const options = minimist(process.argv.slice(2));
const type = options.type;

// typeがなかった場合
if (!type) {
  utils.messenger('Argument "type" is required!', 'alert');
  process.exit();
}

// ファイル名生成
const dt = new Date();
const migrationFile =  path.resolve('./migration/migrations') + '/' + dt.toFormat('YYYYMMDDHHMISS') + '_' + type + '.js';

// ファイルデータ
const fileData = createFile(type);

// 上書き確認用プロンプト
const overwritePrompt = utils.createConfirmOverWritePrompt(migrationFile);

// ファイル作成
utils.writeFile(migrationFile, fileData)
  .then(() => {
    utils.messenger(['Complete!']);
    process.exit();
  });