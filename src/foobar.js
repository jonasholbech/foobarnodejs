//====================
const version = "0.06";
//====================

//import {Bar} from './bar.js';
const { Bar } = require("./bar.js");
//import { CustomerGenerator } from "./customergenerator.js";
const { CustomerGenerator } = require("./customergenerator");
const jsonConf = require("./configuration.json");
function createBar(name) {
  const bar = new Bar(name);
  bar.version = version;

  bar.loadConfiguration(jsonConf); // this is async and will return before the configuration is complete!

  // hence we use a callback for when the bar opens
  //bar.whenOpen(function () {
  console.log("Created Bar '" + bar.name + "' - ready for customers ...");
  const customerGenerator = new CustomerGenerator(bar);
  customerGenerator.start();
  // TODO: Set rules for customer generation

  // For "exporting" to normal use outside modules
  //window.FooBar = bar;
  //});

  // calling bar.open, will open it, when the configuration is complete - then the .whenOpen callback will be called
  bar.open();

  // return the bar
  return bar;
}

const bar = createBar("FooBar");
//console.log(bar);
module.exports = {
  FooBar: bar,
};
