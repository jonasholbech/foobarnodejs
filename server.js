/* eslint-env node, es6 */
const express = require("express");
const bodyParser = require("body-parser");
//var _ = require("lodash");
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
//console.log(FooBar);
/*var todos = [
  {
    task: "go home",
    id: 1,
  },
  {
    task: "watch video",
    id: 2,
  },
];
let counter = todos.length;*/
app.get("/", function (req, res) {
  res.json({
    message:
      "Nothing here, please read the documentation or try something like /beertypes or /data/:key",
  });
});
app.get("/data/:key", function (req, res) {
  // send back a json response
  let data = FooBar.getData();
  delete data.beertypes;
  res.json(data);
});
app.get("/beertypes", function (req, res) {
  let data = FooBar.getData();
  res.json(data.beertypes);
});

app.get("/order/:key", function (req, res) {
  const structure = [
    { name: "Hoppily Ever After", amount: 1 },
    { name: "Hoppily Ever After", amount: 1 },
    { name: "Hoppily Ever After", amount: 1 },
    { name: "Hoppily Ever After", amount: 1 },
  ];
  const customer = new Customer();

  //const numberOfBeers = 2;
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
  res.send({ message: "added" });
});

// get the parameters from the route
/*app.get("/todos/:id", function (req, res) {
  var todo = _.find(todos, { id: parseInt(req.params.id) });

  //res.json(req.params.id)
  res.json(todo);
});*/

// start server on port 3000
app.listen(process.env.PORT || 3000);
