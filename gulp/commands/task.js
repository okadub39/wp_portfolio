const tasks = [];

function pushTask (task) {
  if (typeof task === 'function')
  tasks.push(task);
}

function createTestTask (number) {
  return () => {
    return new Promise ((resolve, reject) => {
      console.log('Start: task ' + number);
      setTimeout(() => {
        console.log('Finish: task ' + number);
        resolve(number)
      }, 1000)
    })
  }
}

function execTasks () {
  return tasks.reduce((prevTask, next) => {
    return prevTask
      .then(next)
      .catch(() => {
        console.log('err')
      })
  }, Promise.resolve());
}

// タスクの追加
pushTask(createTestTask(1));
pushTask(createTestTask(2));
pushTask(createTestTask(3));

execTasks()
  .then(() => {
    console.log('All Task Finish!!')
  });
