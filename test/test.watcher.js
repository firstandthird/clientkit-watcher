'use strict';
const test = require('tape');
const WatcherTask = require('../watcher.js');
const fs = require('fs');
const path = require('path');

test('will watch a dir and call .process when files are changed', (t) => {
  t.plan(3);
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
    }, 2000);
  }, 1000);
});

test('still prints all files when multiple watchers', (t) => {
  const watches = {};
  watches[path.join(__dirname, 'watch1', '*.js')] = 'testTask';
  watches[path.join(__dirname, 'watch1', '*.txt')] = 'testTask';
  watches[path.join(process.cwd(), 'package.json')] = 'testTask';
  const task = new WatcherTask('watcher', {
    files: watches,
    debug: true,
    ignore: 'something',
    delay: 20,
  }, {
    runner: {
      run: (taskName) => {
      }
    }
  });
  const allLogs = [];
  task.log = (tags, data) => {
    if (data) {
      allLogs.push(data);
    }
  };
  task.execute({}, {});
  setTimeout(() => {
    t.equal(allLogs[0], 'Listing watched paths...', 'lists first watcher');
    t.equal(allLogs[2], 'Listing watched paths...', 'lists second watcher');
    t.equal(allLogs[4], 'Listing watched paths...', 'lists third watcher');
    t.end();
    process.exit();
  }, 2000);
});
