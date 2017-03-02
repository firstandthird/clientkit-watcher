const WatcherTask = require('../watcher.js');
const fs = require('fs');
const path = require('path');

const watches = {};
watches[path.join(__dirname, 'watch1')] = 'testTask';
watches[path.join(__dirname, '*.watcher.js')] = 'test.watch.js tasjk';
watches[path.join(process.cwd(), 'package.json')] = 'package testTask';
const task = new WatcherTask('watcher', {
  files: watches,
  debug: true,
  ignore: 'watch1.txt',
  delay: 20,
}, {
  runner: {
    run: (taskName) => {
      console.log('running');
      console.log(taskName);
    }
  }
});
task.execute({}, {});
const update = () => {
  fs.writeFile('watch1/watch1.txt', Math.random(), () => {});
  setTimeout(update, 2000);
};
