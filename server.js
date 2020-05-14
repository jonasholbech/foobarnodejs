/* eslint-env node, es6 */
const express = require("express");
const bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST"); //OPTIONS
  next();
});

const { FooBar } = require("./src/foobar");
const { Customer } = require("./src/customer");
const { Order } = require("./src/order");
const { Beer } = require("./src/beer");
const beers = [
  "El Hefe",
  "Fairy Tale Ale",
  "GitHop",
  "Hollaback Lager",
  "Hoppily Ever After",
  "Mowintime",
  "Row 26",
  "Ruined Childhood",
  "Sleighride",
  "Steampunk",
]; //TODO: should be taken from conf
/*
app.get("/", function (req, res) {
  res.json({
    message:
      "Nothing here, please read the documentation or try something like GET /beertypes, GET /data/:key or POST /order/:key",
  });
});*/
app.get("/", function (req, res) {
  // send back a json response
  let data = FooBar.getData();
  delete data.beertypes;
  res.json(data);
});
app.get("/beertypes", function (req, res) {
  let data = FooBar.getData();
  res.json(data.beertypes);
});

app.post("/order", function (req, res) {
  //const key = req.params.key;
  const structure = req.body;
  if (!Array.isArray(structure)) {
    res.send({ message: "Wrong data format supplied", status: 500 });
  }
  console.log(structure);
  /*const structure = [
    { name: "Hoppily Ever After", amount: 1 },
    { name: "Hoppily Ever After", amount: 1 },
    { name: "Hoppily Ever After", amount: 1 },
    { name: "Hoppily Ever After", amount: 1 },
  ];*/

  //Validate data structure
  const hasProps = (currentItem) => {
    return currentItem.name && currentItem.amount;
  };

  if (!structure.every(hasProps)) {
    res.send({
      message: "Wrong data format supplied, missing name or amount",
      status: 500,
    });
  }

  structure.forEach((item) => {
    if (!beers.includes(item.name)) {
      res.send({
        message: "Unknown beer: " + item.name,
        status: 500,
      });
    }
  });
  const data = FooBar.getData();
  structure.forEach((item) => {
    const found = data.taps.find((tap) => tap.beer === item.name);
    if (!found) {
      res.send({
        message: "We are not serving: " + item.name + " right now!",
        status: 500,
      });
    }
  });

  // expected output: true
  const customer = new Customer();
  const order = new Order(customer);

  const beerTypes = FooBar.getAvailableBeerTypes();
  for (let i = 0; i < structure.length; i++) {
    const beerData = beerTypes.find((b) => b.name === structure[i].name);
    for (let amount = 0; amount < structure[i].amount; amount++) {
      const beer = new Beer(beerData);
      order.addBeer(beer);
    }
  }
  FooBar.addCustomer(customer);

  // res.send converts to json as well
  // but req.json will convert things like null and undefined to json too although its not valid
  res.send({ message: "added", status: 200 });
});

app.listen(process.env.PORT || 3000);
