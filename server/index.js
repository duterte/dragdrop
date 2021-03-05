const dotenv = require('dotenv');
const chalk = require('chalk');
const express = require('express');
const cookieParser = require('cookie-parser');
const modules = require('./modules');

const app = express();
const PORT = process.env.PORT || 3000;
const LAN = modules.network['Local Area Connection'];

dotenv.config();
app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.use(cookieParser());
app.use(express.json());
app.use(modules.secret);
modules.routes(express, app);
modules.logger();
app.listen(PORT, () => {
  console.log(chalk.yellow(`server is running`));
  console.log('Local Machine: ', chalk.green(`http://localhost:${PORT}/`));
  console.log('Local Area Network: ', chalk.green(`http://${LAN}:${PORT}/`));
});
