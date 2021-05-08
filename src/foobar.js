//====================
const version = "0.08";
//====================

const { Bar } = require("./bar.js");
const { CustomerGenerator } = require("./customergenerator");
const jsonConf = require("./configuration.json");
function createBar(name) {
  const bar = new Bar(name);
  bar.version = version;

  bar.loadConfiguration(jsonConf);
  console.log("Created Bar '" + bar.name + "' - ready for customers ...");
  const customerGenerator = new CustomerGenerator(bar);
  customerGenerator.start();
  // calling bar.open, will open it, when the configuration is complete - then the .whenOpen callback will be called
  bar.open();

  // return the bar
  return bar;
}

const bar = createBar("FooBar");
module.exports = {
  FooBar: bar,
};
