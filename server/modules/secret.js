const VALID_SECRET = [
  '80f8020293eeddc95ab526f0d480b22e19b9061f543930cf76d12b80bff8e067',
];

module.exports = (req, res, next) => {
  const secret = req.body.secret ? req.body.secret : req.cookies.secret;
  const found = VALID_SECRET.find(item => item === secret);
  req.user = undefined;
  if (found) {
    req.user = secret;
  }
  next();
};
