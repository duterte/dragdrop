const dotev = require('dotenv');
const express = require('express');
const { auth } = require('express-openid-connect');
const routeHandler = require('./route_handler');

const app = express();
const PORT = process.env.PORT || 3000;

dotev.config();
app.set('view engine', 'ejs');
app.disable('x-powered-by');

app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET,
  })
);

routeHandler(express, app);
app.listen(PORT, () => console.log('server is started'));
