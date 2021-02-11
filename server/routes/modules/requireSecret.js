module.exports = (req, res, next) => {
  if (!req.isAuth) {
    console.log('invalid secret');
    res.redirect('/');
  } else {
    next();
  }
};
