//import {Keg} from './keg.js';
const { Keg } = require("./keg.js");
//import {BeerType,BeerTypes} from './beertype.js';
const { BeerType, BeerTypes } = require("./beertype.js");
//import {Logger} from './logger.js';
const { Logger } = require("./logger.js");
// There can be only one storage-object in the system - it contains a number of kegs with various beertypes in them
class Storage {
  constructor(bar, autofill = true) {
    this.bar = bar;
    this.autofill = autofill;
    this.autoFillTo = 10;
    this.storage = new Map(); // key: beerType, value: number of kegs in storage of that type
  }

  setConfiguration(config) {
    this.autofill = config.autofill || true;
    this.autoFillTo = config.autoFillTo || 10;

    // Initial modes are:
    // * random (min, max)
    // * full (count)
    // * list [beertype, count]

    if (config.initial.random) {
      const min = config.initial.min || 2;
      const max = config.initial.max || 10;

      // for all existing beertypes, add between 2 and 10 kegs to the storage
      BeerTypes.all().forEach((beerType) =>
        this.addKegs(beerType, Math.floor(Math.random() * (max - min)) + min)
      );
    } else if (config.initial.full) {
      const count = config.initial.count || 10;
      BeerTypes.all().forEach((beerType) => this.addKegs(beerType, count));
    } else if (config.initial.list) {
      // TODO: Implement list of beertype, count kegs
    }
  }

  addKegs(beerType, numberOfKegs) {
    // find this beerType in the map - default to 0
    let count = this.storage.get(beerType) || 0;
    // increment with more kegs
    count += numberOfKegs;
    // store the new number
    this.storage.set(beerType, count);
  }

  getKeg(beerType) {
    let keg = null;

    Logger.log("Get keg with '" + beerType + "' from storage");

    // find the count for this type
    let count =
      this.storage.get(beerType) || (this.autofill ? this.autoFillTo : 0);

    if (count > 0) {
      // create new keg
      keg = new Keg(beerType, 2500);
      count--;
      if (count === 0 && this.autofill) {
        count = 10;
      }
      this.storage.set(beerType, count);
    }

    return keg;
  }

  // returns a random keg (of a type that still is in storage)
  getRandomKeg() {
    // find random type, by creating a list of all types with count > 0
    const beerTypes = Array.from(this.storage)
      .filter((pair) => pair[1] > 0)
      .map((pair) => pair[0]);
    return this.getKeg(beerTypes[Math.floor(Math.random() * beerTypes.length)]);
  }
}

//export { Storage };
/* eslint-env node, es6 */
module.exports = {
  Storage: Storage,
};
