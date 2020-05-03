//import * as Task from './bartender_tasks.js';
const Task = require("./bartender_tasks.js");
// A bartender receives an order, creates the beers in the order, and returns it to the customer.
class Bartender {
  constructor(bar, name) {
    this.bar = bar;
    this.name = name;

    this.tasks = [];

    // TODO: Remove these - just look at the currentTask
    this.state = {
      READY: Symbol("State.READY"),
      SERVING: Symbol("State.SERVING"),
      WAITING: Symbol("State.WAITING"), // Waiting for a tap to become available
      PREPARING: Symbol("State.PREPARING"), // When the bartender changes a keg between customers ...
      BREAK: Symbol("State.BREAK"),
      OFF: Symbol("State.OFF"),
    };

    // The currently reserved tap - if any
    this.currentTap = null;

    this.currentCustomer = null;

    // Add a Waiting task to this bartender, and call it immediately
    this.currentTask = null;
    this.addTask(new Task.Waiting());
    this.work();
  }

  get isWorking() {
    // returns false if this.currentTask is of type waiting
    // TODO: Check for type rather than name
    return !(this.currentTask === null || this.currentTask.name == "waiting");
  }

  // Adds a task to the end of the tasklist
  addTask(task) {
    this.tasks.push(task);
    task.owner = this;
  }

  // Inserts a task in the beginning of the tasklist (i.e. as the next task to run)
  insertTask(task) {
    this.tasks.unshift(task);
    task.owner = this;
  }

  /* work does the next bit of work ...
       That usually means exiting the currentTask (that has probably taken some time)
       And entering the next task.

       However - if no next tasks exists - go into waiting-task until next work
    */
  work(parameter) {
    // if there is a current task ...
    // - call exit on that
    // - find next task - set it to current - call enter with parameter

    if (this.currentTask) {
      this.currentTask.exit(parameter);
    }

    // If there are no more tasks - create a new waiting-task
    if (this.tasks.length === 0) {
      this.addTask(new Task.Waiting());
    }

    // Find next task
    const task = this.tasks.shift();

    // Change to the next task
    this.currentTask = task;

    // bartender enters task - task calls work() again when ready to exit
    task.enter(parameter);

    // TODO: Re-implement breaks for bartenders at a later stage ...
    /*
        if(this.tasks.length > 0) {
            this.isWorking = true;

            const task = this.tasks.shift();
            console.log("Bartender " + this.name + " starts task " + task.name + ", with parameter", parameter);
//            task.perform( parameter );
            task.enter(parameter);
        } else {
            this.isWorking = false;
            console.log("Bartender " + this.name + " has no more work");// ... will go for a break in 5 minutes");
            if( this.bar.queue.length === 0 ) {
                //console.log("will go for a break in 5 minutes");   
                // TODO: start break in 5 minutes, if no work shows up
                this.requestBreak(5);
            }
        }
        */
  }

  // TODO: Re-implement breaks for bartenders at a later stage ...
  requestBreak(inMinutes) {
    console.warn("Bartender breaks are not implemented!");
    setTimeout(
      function () {
        // request the break here!
        //console.log("Request break for", this);
        // TODO: In some way the bar should know about requests for breaks, and if no customers are waiting
        // the next tick, then approve the break to the requester that has waited the longest since last
        // break ...
        // This means storing the time since last break in each bartender.
        // A bartender can only get a break if two other bartenders are behind the bar. No-one can be called back
        // from a break once it has begun.
      }.bind(this),
      inMinutes * 1000
    );
  }

  serveCustomer(customer) {
    // create all the tasks for serving this customer
    // 1. StartServing
    this.addTask(new Task.StartServing(customer));

    let lastBeerType = null;
    // handle each beer:
    for (let beer of customer.order.beers) {
      // normal flow is:
      // a. ReserveTap
      // b. PourBeer
      // c. ReleaseTap

      // - but the bartender can pour several beers with the same reserved tap
      // so only release and reserve when it is a new type
      if (beer.beerType !== lastBeerType) {
        // release tap, if lastBeer wasn't null
        if (lastBeerType !== null) {
          this.addTask(new Task.ReleaseTap()); // remembers the current reserved tap
        }
        lastBeerType = beer.beerType;
        this.addTask(new Task.ReserveTap(beer));
      }
      this.addTask(new Task.PourBeer(beer));
    }
    // Release tap for the final type of beer
    this.addTask(new Task.ReleaseTap());
    this.addTask(new Task.ReceivePayment(customer.order));
    this.addTask(new Task.EndServing(customer));

    // then don't do anything before work() is being called
  }

  reserveTap(tap) {
    this.currentTap = tap;
    tap.reserve(this);
  }

  releaseTap() {
    this.currentTap.release(this);
    this.currentTap = null;
  }
}

//export { Bartender };

/* eslint-env node, es6 */
module.exports = {
  Bartender: Bartender,
};
