// A beer is a glass of beer of a certain type+size. Default 50cl.

class Beer {
  constructor(beerType, size = 50) {
    this.beerType = beerType;
    this.size = size;
  }

  toString() {
    return this.beerType.toString();
  }
}

module.exports = { Beer };
