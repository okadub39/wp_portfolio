const types = require('./migrate.types');

/**
 * return file str
 */
module.exports = function (type) {

  switch (type) {

    case types.page:
      return `/**
* Migration
*/
module.exports = {  
  type: '${types.page}',
  name: '',
  change: false,
  template: 'page.ejs',
  targets: {
    ejs: true,
    scss: true
  },
  meta: {
    title: '',
    description: ''
  }
};
`;

    case types.component:
      return `/**
* Migration
*/
module.exports = {
  type: '${types.component}',
  name: '',
  change: false,
  template: 'component.ejs',
  targets: {
    ejs: true,
    scss: true
  }
};
`;

    case types.global:
      return `/**
* Migration
*/
module.exports = {
  type: '${types.global}',
  name: '',
  change: false,
  template: 'component.ejs',
  targets: {
    ejs: true,
    scss: true
  }
};
`;

    case types.scss:
      return `/**
* Migration
*/
module.exports = {
  type: '${types.scss}',

  /**
   * name variation
   * --
   * bases/{string}
   * commons/{string}
   * components/{string}
   * cores/{string}
   * globals/{string}
   * libs/{string}
   * pages/{string}
   * parts/{string}
   * settings/{string}
   */
  name: '',
  template: 'default.scss',
  change: false,
  targets: {
    ejs: false,
    scss: true
  }
};
`;
  }

};
