/**
 * タスク管理用親クラス
 */
class Tasks {

  constructor () {
    this.tasks = [];
    this.messages = [];
  }

  /**
   * タスク追加
   * @param {function} task
   */
  pushTask (task) {
    if (typeof task === 'function')
      this.tasks.push(task);
  }

  /**
   * メッセージ追加
   * @param {string} message
   */
  pushMessage (message) {
    this.messages.push(message)
  }

  /**
   * タスクの実行
   * @returns {Promise}
   */
  execTasks () {
    return this.tasks.reduce((prevTask, next) => {
      return prevTask
        .then(next)
        .then(msg => {
          if (msg) {
            this.pushMessage(msg);
          }
          return Promise.resolve()
        })
        .catch(() => {
          console.log('err')
        })
    }, Promise.resolve());
  }
}

module.exports = Tasks;
