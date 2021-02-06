const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const modules = require('./modules');

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();
app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.use(cookieParser());
app.use(express.json());
app.listen(PORT, () => console.log('server is started'));
modules.auth(app);
modules.routes(express, app);
modules.logger();
