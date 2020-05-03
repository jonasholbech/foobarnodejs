/* Keg holds a large amount of beer of a certain type.
   besides the beer-type, it has the following properties:
   - capacity: the total (start) contents of the keg in cl
   - level: the current level of the contents in the keg in cl
*/
class Keg {
  constructor(beerType, capacity) {
    this.beerType = beerType;
    this.capacity = capacity;
    this.level = this.capacity; // initial the keg is full
  }

  drain(amount) {
    // TODO: Dynamically/gradually drain the keg, using the pouringspeed for the beertype - let calls to level, calculate the current level, as we are draining away ...
    this.level -= amount;

    // TODO: Handle empty keg
    if (this.level < 0) {
      console.error("!!! DRAINING FROM EMPTY KEG!!!", this);
    }
  }
}

//export {Keg};
/* eslint-env node, es6 */
module.exports = {
  Keg: Keg,
};
