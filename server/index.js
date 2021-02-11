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
app.use((req, res, next) => {
  // this must be the users secret
  // const { secret } = req.body;
  // secret sample
  // 80f8020293eeddc95ab526f0d480b22e19b9061f543930cf76d12b80bff8e067
  // req.user = '80f8020293eeddc95ab526f0d480b22e19b9061f543930cf76d12b80bff8e067';
  req.user = undefined;
  next();
});
app.listen(PORT, () => console.log('server is started'));
modules.routes(express, app);
modules.logger();
