const chalk = require('chalk');

module.exports = function () {
  process.on('warning', warning => {
    console.log(chalk.yellow('PROCESS WARNING STACK START'));
    console.log(warning.stack);
    console.log(chalk.yellow('PROCESS WARNING STACK END'));
  });
  process.on('error', error => {
    console.log(chalk.red('PROCESS ERROR STACK START'));
    console.log(error);
    console.log(chalk.red('PROCESS ERROR STACK END'));
  });
};
