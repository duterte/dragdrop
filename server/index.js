const path = require('path');
const express = require('express');

const { upload, stats } = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.use('/upload', upload);
app.use('/stats', stats);
app.use('/', express.static(path.resolve('public')));

app.listen(PORT, () => console.log('server is started'));
