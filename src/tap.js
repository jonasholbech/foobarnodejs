//import {Logger} from './logger.js';
const { Logger } = require("./logger.js");
// A tap is connected directly to a keg
class Tap {
  constructor(keg) {
    this.bar = null;
    this.keg = keg;
    this.waitList = [];
    this.id = -1; // is set to the index when reading the list of taps
  }

  addToWaitList(callback) {
    this.waitList.push(callback);
  }

  get isBlocked() {
    return this.keg == null || this.keg.level <= 0;
  }

  get isAvailable() {
    return this.reservedBy == null;
  }

  get isEmpty() {
    return this.keg.level <= 0;
  }

  reserve(bartender) {
    this.reservedBy = bartender;
  }

  release() {
    // only release if not blocked!
    if (!this.isBlocked) {
      this.reservedBy = null;

      // Don't message
      // If someone is waiting for it - call them
      const callback = this.waitList.shift();
      if (callback) {
        Logger.log(
          "Tap " + this.id + " is free, informing next on waitlist: ",
          callback
        );
        callback(this);
      }
    }
  }

  drain(amount) {
    this.keg.drain(amount);
  }
}

//export { Tap };
/* eslint-env node, es6 */
module.exports = {
  Tap: Tap,
};
