/* logger is used for debugging - everything logs to here, and filters control how the log is shown/stored
 */
class _Logger {
  constructor() {
    this.outputToConsole = false;
    this.store = [];
  }

  show(outputToConsole) {
    this.outputToConsole = outputToConsole;
  }

  log(message) {
    message = message.replace("\n", "\n                    ");

    const time = new Date();
    const timestring =
      "" +
      time.getFullYear() +
      "-" +
      String(time.getMonth()).padStart(2, 0) +
      "-" +
      String(time.getDate()).padStart(2, 0) +
      " " +
      String(time.getHours()).padStart(2, 0) +
      ":" +
      String(time.getMinutes()).padStart(2, 0) +
      ":" +
      String(time.getSeconds()).padStart(2, 0);

    const msg = timestring + " " + message;

    // Store messages
    this.store.push(msg);

    // Show log to console, if enabled
    if (this.outputToConsole) {
      console.log(msg);
    }

    // TODO: if store gets too large, start dumping old messages ...
  }
}

const Logger = new _Logger();

//export {Logger};
/* eslint-env node, es6 */
module.exports = {
  Logger: Logger,
};
