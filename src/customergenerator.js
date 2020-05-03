//import {Customer} from './customer.js';
const { Customer } = require("./customer.js");
const { Order } = require("./order.js");
const { Beer } = require("./beer.js");

class CustomerGenerator {
  constructor(bar) {
    this.bar = bar;
    this.running = false;

    this.setConfiguration(bar.configuration.customergenerator);
  }

  start() {
    this.tick();
    this.running = true;
  }

  setConfiguration(config) {
    // Set configuration from config-file/object
    this.config = {
      order: {
        maxSize: config.ordersize.max,
      },
      customers: {
        // TODO: Handle configurations without min and max values! (e.g. fixed numbers)
        min: config.customercount.default.min,
        max: config.customercount.default.max,
        initialMin: config.customercount.initial.min,
        initialMax: config.customercount.initial.max,
      },
      time: {
        default: config.timeToNextCustomer.default,
        queSize: [],
        queValue: [],
      },
    };

    // Build two arrays of queuelengths and waitTime until next customer
    const queueValues = [];
    for (let prop in config.timeToNextCustomer.queueSize) {
      let val = Number(config.timeToNextCustomer.queueSize[prop]);
      if (prop === "empty") {
        prop = 0;
      }
      queueValues.push([prop, val]);
    }
    queueValues.sort((a, b) => a[0] - b[0]);
    queueValues.forEach((val) => {
      this.config.time.queSize.push(val[0]);
      this.config.time.queValue.push(val[1]);
    });
  }

  // create a customer with an order for some random beers
  createCustomer() {
    const customer = new Customer();

    const numberOfBeers = Math.ceil(Math.random() * this.config.order.maxSize); // TODO: Make better random distribution
    const order = new Order(customer);

    for (let i = 0; i < numberOfBeers; i++) {
      const beer = this.createRandomBeer();
      order.addBeer(beer);
    }

    return customer;
  }

  generateCustomers(min, max) {
    if (!min) {
      min = this.config.customers.min || 0;
    }
    if (!max) {
      max = this.config.customers.max || 4;
    }
    // generate between min and max customers
    for (
      let number = Math.floor(Math.random() * (max - min)) + min;
      number > 0;
      number--
    ) {
      // Never more than 25 customers in queue!
      // TODO: This should be configured somewhere in the bar ...
      if (this.bar.queue.length < 25) {
        this.bar.addCustomer(this.createCustomer());
      }
    }
  }

  createRandomBeer() {
    // ask bar for beertypes on tap
    const beerTypes = this.bar.getAvailableBeerTypes();

    // TODO: Implement other random distributions
    const beer = new Beer(
      beerTypes[Math.floor(Math.random() * beerTypes.length)]
    );
    return beer;
  }

  tick() {
    // By default wait 60 seconds before adding to the queue
    // If there are less than 10 people in the queue, wait only 30 seconds
    let nextCustomerIn = this.config.time.default;

    // Loop through the queSize, until we find a matching one
    for (let i = 0; i < this.config.time.queSize.length; i++) {
      if (this.bar.queue.length <= this.config.time.queSize[i]) {
        nextCustomerIn = this.config.time.queValue[i];
        break;
      }
    }

    // Generate customers for this run.
    if (!this.running) {
      // First time, generate a queue between 5 and 15 people
      this.generateCustomers(
        this.config.customers.initialMin,
        this.config.customers.initialMax
      );
      console.log(
        "Initialised CustomerGenerator with " +
          this.bar.queue.length +
          " customers"
      );
    } else {
      this.generateCustomers();
    }

    // Run again in 'nextCustomerIn' minutes
    setTimeout(this.tick.bind(this), nextCustomerIn * 1000);
  }
}

module.exports = { CustomerGenerator };
