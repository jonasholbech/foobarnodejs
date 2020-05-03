//import {Storage} from './storage.js';
const { Storage } = require("./storage.js");
//import {BeerType,BeerTypes} from './beertype.js';
const { BeerType, BeerTypes } = require("./beertype.js");
//import { Tap } from "./tap.js";
const { Tap } = require("./Tap.js");
//import { Bartender } from "./bartender.js";
const { Bartender } = require("./bartender.js");

//import { Logger } from "./logger.js";
const { Logger } = require("./logger.js");
class Bar {
  constructor(name) {
    this.name = name;
    this.taps = [];
    this.bartenders = [];
    this.queue = []; // customers

    this.beingServed = []; // customers currently being served

    // create storage
    this.storage = new Storage(this, true);

    // Initialize customer-count
    this.nextCustomerID = 0;

    // Remember logger for external access
    this.Logger = Logger;

    // configuration
    this.configuration = null;
    this.onConfiguration = null;
  }

  loadConfiguration(data) {
    /*fetch(url)
      .then((response) => response.json())
      .then((data) => this.setConfiguration(data));*/
    this.setConfiguration(data);
  }

  setConfiguration(config) {
    // beertypes
    config.beertypes.forEach((info) => {
      const beerType = new BeerType(info);
    });

    // storage
    this.storage.setConfiguration(config.storage);

    // taps
    if (config.taps.initial.random) {
      // "count": 7,
      const numberOfTaps = config.taps.initial.count || 7;
      // "maxOfEachType": 2
      const maxOfEachType = config.taps.initial.maxOfEachType;

      // TODO: If numberOfTabs < beertypes*2 Give an error!
      // create array of possibilities - each beertype, the number of max times
      let possibilities = BeerTypes.all();
      for (let n = 1; n < maxOfEachType; n++) {
        possibilities = possibilities.concat(BeerTypes.all());
      }
      // Create the required number of taps (and connect them to kegs from the storage)
      for (let i = 0; i < numberOfTaps; i++) {
        let keg = null;
        while (keg === null) {
          // If for some reason the storage is out of this type of beer, find another keg!
          const index = Math.floor(Math.random() * possibilities.length);
          const beerType = possibilities[index];

          // get a keg of this type from storage
          keg = this.storage.getKeg(beerType);

          // remove beerType from possibilities
          possibilities.splice(index, 1);
        }
        // create a tap, and add it to the bar
        const tap = new Tap(keg);
        this.addTap(tap);
      }
    } // TODO: Other tap-configurations, e.g. list

    // bartenders
    config.bartenders.forEach((bartender) => this.addBartender(bartender.name));

    // Store configuration, and callback, if any
    this.configuration = config;
    if (this.onConfiguration) {
      this.onConfiguration();
    }
  }

  addBartender(name) {
    // create a bartender object
    const bartender = new Bartender(this, name);
    this.bartenders.push(bartender);
  }

  addTap(tap) {
    tap.id = this.taps.length;
    tap.bar = this;
    this.taps.push(tap);
  }

  // add this customer to the queue
  addCustomer(customer) {
    customer.id = this.nextCustomerID++;
    customer.addedToQueue(Date.now());
    this.queue.push(customer);
    Logger.log("Added customer " + customer.id + " to queue");
  }

  whenOpen(callback) {
    this._whenOpen = callback;
  }

  open() {
    // if configuration is not loaded yet, make a callback to this function for when it is
    if (this.configuration == null) {
      this.onConfiguration = this.open;
    } else {
      // Log configuration
      Logger.log(
        "Configuration - bartenders: " +
          this.bartenders
            .map((bartender, i) => i + ": " + bartender.name)
            .join(", ")
      );
      Logger.log(
        "Configuration - taps: " +
          this.taps.map((tap) => tap.id + ": " + tap.keg.beerType).join(", ")
      );

      // start ticker
      setInterval(this.tick.bind(this), 1000);

      if (this._whenOpen) {
        this._whenOpen();
      }
    }
  }

  serveNextCustomer(bartender) {
    // move customer out of queue
    const customer = this.queue.shift();
    // - to beingServed-list
    this.beingServed.push(customer);

    // and start serving the customer
    bartender.serveCustomer(customer);

    // then get to work
    if (!bartender.isWorking) {
      bartender.work();
    }
  }

  // The ticker runs every N seconds, looks for waiting customers and available bartenders, and
  // assigns work
  tick() {
    // is there any waiting customers
    if (this.queue.length > 0) {
      // and any available bartenders?
      const bartender = this.getAvailableBartender();
      if (bartender) {
        this.serveNextCustomer(bartender);
      }
    }
  }

  // returns a random available bartender, if any - else null
  getAvailableBartender() {
    const bartenders = this.bartenders.filter(
      (bartender) => !bartender.isWorking
    );

    if (bartenders.length > 0) {
      return bartenders[Math.floor(Math.random() * bartenders.length)];
    } else {
      return null;
    }
  }

  // Returns a list of the beerTypes currently on tap (some might just have been emptied though)
  getAvailableBeerTypes() {
    return this.taps.map((tap) => tap.keg.beerType);
  }

  // searches for an available tap to serve the beertype indicated, and calls callback with the tap found.
  // if the tap is ready now, the callback is called immediately, otherwise it is called by the tap, when it is ready
  waitForAvailableTap(beer, callback) {
    // find taps for this kind of beer
    let taps = this.taps.filter(
      (tap) => !tap.isBlocked && tap.keg.beerType === beer.beerType
    );

    // If there are no available taps for this kind of beer - first check if the blocked ones will get it
    if (taps.length === 0) {
      taps = this.taps.filter(
        (tap) => tap.isBlocked && tap.nextBeerType === beer.beerType
      );

      if (taps.length === 0) {
        // if the requested type is still not available, and wont be, ask the customer to modify their order
        return false;
      }
    }

    // if one is available now, use that directly
    let tap = null;
    for (let i = 0; i < taps.length; i++) {
      if (taps[i].isAvailable) {
        tap = taps[i];
        callback(tap);
        break;
      }
    }

    // if no available tap was found, wait for a random one
    if (tap === null) {
      if (taps.length > 0) {
        // sort the list of taps by shortest waitlist
        taps.sort((a, b) => a.waitList.length - b.waitList.length);
        Logger.log(
          "No tap available for " +
            beer.beerType +
            " - waiting for tap " +
            taps[0].id
        );
        taps[0].addToWaitList(callback);
      } else {
        // Should never happen
        console.error(
          "!!! DISASTER - tap for " + beerType + " can't be found!"
        );
      }
    }

    return true;
  }

  // Returns JSON-data about everything in the bar
  getData(short = false) {
    const data = {};

    data.timestamp = Date.now();
    /*
        bar: name, closingTime
        queue: customer, id, order, status
        bartenders: name, status
        taps: id, keg (incl beertype), 
*/
    // bar
    data.bar = { name: this.name, closingTime: "22:00:00" };

    // queue with customers
    data.queue = this.queue.map((cust) => {
      // TODO: Move to customer-class
      const ncust = {};
      ncust.id = cust.id;
      ncust.startTime = cust.queueStart;

      ncust.order = cust.order.beers.map((beer) => beer.beerType.name);

      return ncust;
    });

    // customers being served
    data.serving = this.beingServed.map((cust) => {
      // TODO: Move to customer-class
      const ncust = {};
      ncust.id = cust.id;
      ncust.startTime = cust.queueStart;

      ncust.order = cust.order.beers.map((beer) => beer.beerType.name);

      return ncust;
    });

    // bartenders

    data.bartenders = this.bartenders.map((bt) => {
      // TODO: Move to bartender class
      const bart = { name: bt.name };

      // Status - Old style: READY or WORKING
      if (bt.currentTask.name === "waiting") {
        bart.status = "READY";
      } else {
        bart.status = "WORKING";
      }

      // Added detailed status = task.name
      bart.statusDetail = bt.currentTask.name;

      // Current tap being used
      bart.usingTap = bt.currentTap ? bt.currentTap.id : null;

      // Current customer
      bart.servingCustomer = bt.currentCustomer ? bt.currentCustomer.id : null;
      return bart;
    });

    // taps
    data.taps = this.taps.map((tap) => {
      // TODO: Move to tap class
      const t = {};
      // id
      t.id = tap.id;
      // level
      t.level = tap.keg.level;
      // capacity
      t.capacity = tap.keg.capacity;
      // (beertype): name
      t.beer = tap.keg.beerType.name;
      // in use
      t.inUse = !tap.isAvailable;

      return t;
    });

    // storage
    data.storage = Array.from(this.storage.storage).map((pair) => {
      return {
        name: pair[0].name,
        amount: pair[1],
      };
    });

    // beerinfo
    if (!short) {
      data.beertypes = BeerTypes.all().map((info) => {
        return {
          name: info.name,
          category: info.category,
          pouringSpeed: info.pouringSpeed,
          popularity: info.popularity,
          alc: info.alc,
          label: info.label,
          description: info.description,
        };
      });
    }

    // return JSON-ified data
    return data; //JSON.stringify(data);
  }
}

//export { Bar };
/* eslint-env node, es6 */
module.exports = {
  Bar: Bar,
};
