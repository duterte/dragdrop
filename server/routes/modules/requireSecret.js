module.exports = (req, res, next) => {
  if (!req || !req.user) res.redirect('/');
  next();
};
