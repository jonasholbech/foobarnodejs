class Customer {
  constructor() {
    this.order = null;
    this.queueStart = 0;
    this.queueEnd = 0;
  }

  addedToQueue(timestamp) {
    this.queueStart = timestamp;
  }

  startServing(timestamp) {
    this.queueEnd = timestamp;
  }
}
module.exports = { Customer };
