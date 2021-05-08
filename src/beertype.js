// A beertype has a name and a pouringSpeed (some beers might be slower!)

class BeerType {
  // TODO: Add probability/popularity of this beer
  constructor(info) {
    /* Info object is expected to have:
            -name
            -category
            -pouringSpeed in cl pr second
            -popularity from 0 to 1
            -alc
            -label
            -description:
                - appearance
                - aroma
                - flavor
                - mouthfeel
                - overallImpression
        */

    this.name = info.name;
    this.category = info.category;
    this.pouringSpeed = info.pouringSpeed || 5;
    this.popularity = info.popularity || 1;
    this.alc = info.alc;
    this.label = info.label;
    this.description = info.description || "no description";

    BeerTypes.add(this);
  }

  toString() {
    return this.name;
  }
}

const BeerTypes = {
  add(beerType) {
    if (!this._data) {
      this._data = [];
    }
    this._data.push(beerType);
  },

  get(beerTypeName) {
    return this._data.find((beerType) => beerType.name === beerTypeName);
  },

  all() {
    return this._data;
  },

  random() {
    return this._data[Math.floor(Math.random() * this._data.length)];
  },
};

//export {BeerType, BeerTypes};

/* eslint-env node, es6 */
module.exports = {
  BeerType: BeerType,
  BeerTypes: BeerTypes,
};
