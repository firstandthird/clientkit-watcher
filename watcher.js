'use strict';

const TaskKitTask = require('taskkit-task');
const chokidar = require('chokidar');
const debounce = require('lodash.debounce');
const pathLib = require('path');

class WatcherTask extends TaskKitTask {
  constructor(name, options, kit) {
    super(name, options, kit);
    this.watchers = [];
  }
  get description() {
    return 'This task watches the indicated files for changes, and re-runs the other registered TaskKitTasks when an edit is made to them.';
  }

  process(tasks, watch) {
    // add together the top-level watcher 'ignore' expressions with this watch's specific 'ignore' expressions:
    const taskToRun = (typeof tasks === 'object' && tasks.task) ? tasks.task : tasks;
    const localIgnore = (typeof tasks === 'object' && tasks.ignore) ? tasks.ignore : [];
    const ignoreArr = localIgnore.concat(this.options.ignore || []);
    const ignoreString = ignoreArr.join('|');
    const ignored = new RegExp(ignoreString);
    this.log(`Watching: ${pathLib.relative(process.cwd(), watch)}, Ignoring: ${ignored}, Task: ${taskToRun}`);
    const watcher = chokidar.watch(watch, {
      ignored,
      awaitWriteFinish: true
    });

    watcher.on('all', (event, path) => {
      this.log(`Changed: ${pathLib.relative(process.cwd(), path)}`);
    });
    if (this.options.debug) {
      watcher.on('ready', () => {
        this.log(['debug'], `Listing watched paths for task ${taskToRun}:`);
        this.log(['debug'], JSON.stringify(watcher.getWatched(), null, 2));
      });
    }
    watcher.on('error', (error) => {
      this.log(['error'], error);
    });
    watcher.on('all', debounce(() => {
      this.log(`Running: ${taskToRun}`);
      this.runTask(taskToRun);
    }, this.options.delay));
    this.watchers.push(watcher);
  }

  onFinish() {
    //don't call done so the process stays open
  }
}
module.exports = WatcherTask;
