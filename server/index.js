const dotev = require('dotenv');
const express = require('express');
const modules = require('./modules');

const app = express();
const PORT = process.env.PORT || 3000;

dotev.config();
app.set('view engine', 'ejs');
app.disable('x-powered-by');
modules.auth(app);
modules.routes(express, app);
app.listen(PORT, () => console.log('server is started'));
