const { Logger } = require("./logger.js");
class Task {
  constructor(name) {
    this.name = name;
    this.owner = null; // the owner should set itself when adding the task
    this.time = 0; // the time for this task to complete - set by extending classes
  }

  // called by work, calls work again after
  enter(parameter) {
    setTimeout(this.owner.work.bind(this.owner), this.time * 1000);
  }

  exit() {
    //        console.log("exit task ", this);
  }

  toString() {
    return this.name;
  }
}

class Waiting extends Task {
  constructor() {
    super("waiting");
  }

  enter() {
    Logger.log(
      "Bartender " + this.owner.name + " is waiting for a new customer"
    );
  }

  exit() {
    Logger.log("Bartender " + this.owner.name + " is done waiting.");
  }
}

class StartServing extends Task {
  constructor(customer) {
    super("startServing");
    this.customer = customer;
    this.time = 2; // Taking the order takes 10 seconds - or only two?
  }

  enter() {
    this.owner.currentCustomer = this.customer;
    // TODO: customer.state should be modified instead of this
    this.customer.beingServed = true;
    // TODO: log the current time in the customer

    const ordertext = this.customer.order.beers
      .map((b) => "'" + b.beerType.name + "'")
      .join(", ");
    Logger.log(
      "Bartender " +
        this.owner.name +
        " starts serving customer " +
        this.customer.id +
        "\nwith order [" +
        ordertext +
        "]"
    );

    super.enter();
  }

  exit() {
    // Log bartenders tasklist
    const tasklist = this.owner.tasks.join(", ");
    Logger.log(
      "Bartender " +
        this.owner.name +
        "' plan for serving customer " +
        this.customer.id +
        " is: [" +
        tasklist +
        "]"
    );

    super.exit();
  }
}

class ReserveTap extends Task {
  constructor(beer) {
    super("reserveTap");
    this.beer = beer;
  }

  enter() {
    Logger.log(
      "Bartender " + this.owner.name + " wants to pour '" + this.beer + "'"
    );
    // Find available tap - then pourbeer (that is expected to be next task in queue)
    if (
      !this.owner.bar.waitForAvailableTap(
        this.beer,
        this.owner.work.bind(this.owner)
      )
    ) {
      // If no tap can be reserved or found - modify the customers order to something else
      console.warn(
        "! can't fulfill customer #" +
          this.owner.currentCustomer.id +
          " order - replacing beertype !"
      );

      const previousType = this.beer.beerType;

      // get another beer-type
      this.beer.beerType = this.owner.bar.taps.filter(
        (tap) => tap.isAvailable
      )[0].keg.beerType;

      // find following pourbeer-tasks
      let t = 0;
      while (this.owner.tasks[t].name == "pourBeer") {
        this.owner.tasks[t].beer.beerType = this.beer.beerType;
        t++;
      }

      Logger.log(
        "'" +
          previousType +
          "' is sold out, so replacing with: '" +
          this.beer.beerType +
          "'"
      );
      this.owner.bar.waitForAvailableTap(
        this.beer,
        this.owner.work.bind(this.owner)
      );
    }

    // don't call super - the tap handles the callback
  }

  exit(tap) {
    // exit should be called by the tap, or whatever calls us when wap is ready
    Logger.log(
      "Bartender " + this.owner.name + " has reserved tap '" + tap.id + "'"
    );
    this.owner.reserveTap(tap);

    super.exit();
  }

  toString() {
    return super.toString() + " (" + this.beer.beerType.name + ")";
  }
}

class ReleaseTap extends Task {
  constructor() {
    super("releaseTap");
    this.time = 1;
  }

  enter() {
    this.tap = this.owner.currentTap;

    // FIX: Don't release a tap, if you have just emptied the keg!
    this.owner.releaseTap();

    super.enter();
  }

  exit() {
    Logger.log(
      "Bartender " + this.owner.name + " has released tap '" + this.tap.id + "'"
    );
    super.exit();
  }
}

class PourBeer extends Task {
  constructor(beer) {
    super("pourBeer");

    // We need the beer for the size, and pouringSpeed
    this.beer = beer;

    this.time = beer.size / beer.beerType.pouringSpeed;
  }

  enter() {
    this.tap = this.owner.currentTap;
    this.tap.drain(this.beer.size);
    Logger.log(
      "Bartender " +
        this.owner.name +
        " pours '" +
        this.beer +
        "' from tap " +
        this.tap.id
    );
    super.enter();
  }

  exit() {
    Logger.log(
      "Bartender " +
        this.owner.name +
        " is done pouring '" +
        this.beer +
        "' from tap " +
        this.tap.id
    );

    // Keg could be empty now - better check
    if (this.tap.keg.level <= 0) {
      Logger.log("Keg is empty.");

      const replaceTask = new ReplaceKeg(this.tap);

      // if my customer requires more beer of this kind - replace the keg now!
      if (
        this.owner.tasks.filter(
          (task) =>
            task.name === "pourBeer" &&
            task.beer.beerType === this.tap.keg.beerType
        ).length > 0
      ) {
        Logger.log("My customer wants more - so better replace it now!");
        this.owner.insertTask(replaceTask);
      } else {
        // otherwise, replace the keg when done serving
        Logger.log("I'll replace it when done with this customer");

        // Move the releaseTap task to after replacing the keg!

        this.owner.addTask(replaceTask);
      }
    }

    super.exit();
  }
}

class ReceivePayment extends Task {
  constructor(order) {
    super("receivePayment");
    this.time = 5;
  }
}

class EndServing extends Task {
  constructor(customer) {
    super("endServing");
    this.customer = customer;
    this.time = 0;
  }

  enter() {
    this.customer.beingServed = false;

    // remove customer from beingServed list
    // TODO: Should be done by the bar!
    const index = this.owner.bar.beingServed.findIndex(
      (cust) => cust.id === this.customer.id
    );
    this.owner.bar.beingServed.splice(index, 1);

    super.enter();
  }

  exit() {
    this.owner.currentCustomer = null;
    super.exit();
  }
}

class ReplaceKeg extends Task {
  constructor(tap) {
    super("replaceKeg");

    this.tap = tap;
    this.newKeg = null;
    this.time = 30; // it takes 30 seconds to replace a keg
  }

  enter() {
    // decide whether to replace the keg with one of same type, or a different type.

    // If anyone is waiting for this tap, check if there is a similar, non-blocked, that they can be moved to.
    // - if not, then we need to replace with same kind.
    // - otherwise, select a random type : however, this might cause customers in queue to have to change their order ...

    // For now, always do the same type ...

    // Fetch keg from storage
    this.newKeg = this.owner.bar.storage.getKeg(this.tap.keg.beerType);

    // Put a sign on the tap, announcing the new kind of beer
    this.tap.nextBeerType = this.newKeg.beerType;

    Logger.log(
      "Bartender " +
        this.owner.name +
        " is replacing keg for tap: " +
        this.tap.id
    );
    super.enter();
  }

  exit() {
    // connect the new keg to this tap
    this.tap.keg = this.newKeg;
    Logger.log(
      "Bartender " +
        this.owner.name +
        " has replaced keg for tap " +
        this.tap.id +
        " with a new keg of '" +
        this.tap.keg.beerType.name +
        "'"
    );

    // If this tap is no longer mine - I have tried to release it before, so release it again
    if (this.owner.currentTap !== this.tap) {
      Logger.log(
        "Tap " + this.tap.id + " has been released before, so re-release it"
      );
      this.tap.release();
    }

    // Remove the sign announcing the next type
    this.tap.nextBeerType = null;

    super.exit();
  }
}
/*
export {
  Waiting,
  StartServing,
  ReserveTap,
  PourBeer,
  ReleaseTap,
  ReceivePayment,
  EndServing,
};*/
/* eslint-env node, es6 */
module.exports = {
  Waiting,
  StartServing,
  ReserveTap,
  PourBeer,
  ReleaseTap,
  ReceivePayment,
  EndServing,
};
