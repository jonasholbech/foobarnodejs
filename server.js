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
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); //OPTIONS
  next();
});

const { FooBar } = require("./src/foobar");
//console.log(FooBar);
var todos = [
  {
    task: "go home",
    id: 1,
  },
  {
    task: "watch video",
    id: 2,
  },
];
let counter = todos.length;

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
/*
var postData = JSON.stringify({
  todo: {
    id: 8,
    task: "hej mor"
}});
fetch("/todos/", {
        method: "post",
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: postData
    })
    .then(d => d.json())
    .then(t => {
            console.log(t)
      });
*/
app.post("/", function (req, res) {
  var todo = req.body.todo;
  todo.id = ++counter;
  todos.push(todo);
  // res.send converts to json as well
  // but req.json will convert things like null and undefined to json too although its not valid
  res.send(todo); //seems like it accepts only one param [todos, todo]
});

// get the parameters from the route
/*app.get("/todos/:id", function (req, res) {
  var todo = _.find(todos, { id: parseInt(req.params.id) });

  //res.json(req.params.id)
  res.json(todo);
});*/

// start server on port 3000
app.listen(process.env.PORT || 3000);
