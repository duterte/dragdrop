module.exports = (req, res, next) => {
  if (!req.isAuth) {
    console.log('invalid secret: IP Address:', req.ip);
    res.redirect('/');
  } else {
    next();
  }
};
