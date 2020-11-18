# Front End Design Elective

## Autumn 2020

### What is this?

In order to solve the exam assignment, you have to hook up to a server we've built.

You only need one server per group, so choose one to do it.

1. Go to <a href="https://heroku.com">Heroku.com</a> and sign up for a free account.
2. Once signed up, click this link <br><a href="https://heroku.com/deploy?template=https://github.com/jonasholbech/foobarnodejs/tree/master"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy"></a>
3. That will start the deployment of a new server.
4. Pick a unique name for it
5. and choose Europe as the location
6. Click "Deploy App"
7. Once it's complete you can click "open" or was it "view app"?
8. That should give you a lot of JSON
9. You're almost done. But in order for the kegs not to run out, you should restart the server every morning. You do that by going to Heroku.com, logging in and clicking "Restart all dynos" <br><img src="restart.png">

### Endpoints

The server will give you three endpoints

#### GET `/`

The default endpoint. Hit this often to get new data

#### GET `/beertypes`

Static endpoint. Contains descriptions of all beers. You can hit this once. The beers won't change

#### POST `/order`

Send a post request with the following payload/footprint

```js
[
  { name: "Hoppily Ever After", amount: 1 },
  { name: "Row 26", amount: 2 },
];
```
