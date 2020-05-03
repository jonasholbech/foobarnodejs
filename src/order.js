// An order is a list of beers for a customer.
// The customer creates, and gives the order to the bartender, requesting beers,
// The bartender then returns the order, with the beers included
class Order {
  constructor(customer) {
    this.customer = customer;
    this.customer.order = this;
    this.beers = [];
  }

  addBeer(beer) {
    this.beers.push(beer);

    // keep order sorted by beertype!
    this.beers.sort((a, b) => {
      if (a.beerType.name < b.beerType.name) {
        return -1;
      } else if (a.beerType.name > b.beerType.name) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}

module.exports = { Order };
