const path = require('path');
const projects = require(path.resolve('projects'));

module.exports = (req, res, next) => {
  const { cookies, body } = req;
  const secret = body.secret ? body.secret : cookies.appSession;
  const filter = projects.filter(item => item.secret === secret);
  req.isAuth = false;

  if (filter.length) {
    req.isAuth = true;
    req.projects = filter;
    res.cookie('appSession', secret, {
      httpOnly: true,
      secure: process.env.MODE === 'production' ? true : false,
      sameSite: 'Lax',
    });
  }
  next();
};
