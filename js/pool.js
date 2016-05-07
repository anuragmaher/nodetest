// This Pool maintains pool of workers which can take up the work as required. 

function Pool(size) {
    "use strict";
    
    var _this = this;
 
    // set some defaults
    var taskQueue = [];
    var workerQueue = [];
    var poolSize = size;

    _this.addWorkerTask = function(workerTask) {
        if (workerQueue.length > 0) {
            // get the worker from the front of the queue
            var workerThread = workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no free workers add to the Queue, will be processed later.
            taskQueue.push(workerTask);
        }
    };


    _this.getPoolSize = function(){
        return poolSize;
    };
 
    function init(){
        // create 'size' number of worker threads
        for (var i = 0 ; i < poolSize ; i++) {
            workerQueue.push(new WorkerThread(_this));
        }
    }
 
    _this.freeWorkerThread = function(workerThread) {
        if (taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            var workerTask = taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            // putting back the worker in workerQueue
            workerQueue.push(workerThread);
        }
    };
    init();

}
 
// runner work tasks in the pool
function WorkerThread(parentPoolArg) {
 
    var _this = this;
 
    var parentPool = parentPoolArg;
    _this.workerTask = {};
 
    _this.run = function(workerTask) {
        _this.workerTask = workerTask;
        // create a new web worker
        if (_this.workerTask.script !== null) {
            var worker = new Worker(workerTask.script);
            worker.addEventListener('message', workerCallback, false);
            worker.postMessage(workerTask.startMessage);
        }
    };
 
    // for now assume we only get a single callback from a worker
    // which also indicates the end of _this worker.
    function workerCallback(event) {
        // pass to original callback
        _this.workerTask.callback(event);
        // we should use a seperate thread to add the worker
        parentPool.freeWorkerThread(_this);
    }
 
}
 
// task to run
function WorkerTask(script, callback, msg) {
    this.script = script;
    this.callback = callback;
    this.startMessage = msg;
}


