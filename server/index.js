require('dotenv').config();
const chalk = require('chalk');
const express = require('express');
const cookieParser = require('cookie-parser');
const modules = require('./modules');
const cluster = require('cluster');
const cpus = require('os').cpus().length;
const ip = require('public-ip').v4();
const app = express();
const PORT = process.env.PORT || 3000;
const LAN = modules.network['Local Area Connection'];

if (cluster.isMaster) {
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
  cluster.on('exit', () => {
    console.log('cluster restarting');
    cluster.fork();
  });
} else {
  const server = app.listen(PORT);
  server.once('listening', async () => {
    console.log(chalk.yellow(`server is running`));
    console.log('Local Machine: ', chalk.green(`http://localhost:${PORT}/`));
    console.log('Local Area Network: ', chalk.green(`http://${LAN}:${PORT}/`));
    console.log('Internet: ', chalk.green(`http://${await ip}:${PORT}/`));
  });
  server.headersTimeout = 7200000;
  server.keepAliveTimeout = 60000;

  app.set('view engine', 'ejs');
  app.disable('x-powered-by');
  app.use(cookieParser());
  app.use(express.json());
  app.use(modules.secret);

  modules.routes(express, app);
  modules.logger();
}
