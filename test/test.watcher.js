const test = require('tape');
const WatcherTask = require('../watcher.js');
const fs = require('fs');
const path = require('path');

test('will watch a dir and call .process when files are changed', (t) => {
  t.plan(2);
  const watches = {};
  watches[`${path.join(__dirname, 'watch1', '*.txt')}`] = 'testTask';
  const task = new WatcherTask('watcher', {
    files: watches,
    debug: true,
    ignore: 'something',
    delay: 20,
  }, {
    runner: {
      run: (taskName) => {
        t.equal(taskName, 'testTask');
      }
    }
  });
  task.execute({}, {});
  setTimeout(() => {
    fs.writeFile('test/watch1/watch1.txt', Math.random(), () => {});
  }, 1000);
});

test('will watch a dir and ignore specified files', (t) => {
  const watches = {};
  watches[`${path.join(__dirname, 'watch1', '*.txt')}`] = 'testTask';
  const task = new WatcherTask('watcher', {
    files: watches,
    debug: true,
    ignore: 'watch1.txt',
    delay: 20,
  }, {
    runner: {
      run: (taskName) => {
        t.equal(false, 'testTask');
      }
    }
  });
  task.execute({}, {});
  setTimeout(() => {
    fs.writeFile('test/watch1/watch1.txt', Math.random(), () => {});
    setTimeout(() => {
      t.end();
      process.exit();
    }, 2000);
  }, 1000);
});
