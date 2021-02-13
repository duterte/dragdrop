const SAMPLE_SECRET = [
  '80f8020293eeddc95ab526f0d480b22e19b9061f543930cf76d12b80bff8e067',
  'bluefin_tuna',
];

module.exports = (req, res, next) => {
  const { cookies, body } = req;
  const secret = body.secret ? body.secret : cookies.appSession;
  const found = SAMPLE_SECRET.find(item => item === secret);
  req.isAuth = false;
  if (found) {
    req.isAuth = true;
    res.cookie('appSession', secret, {
      httpOnly: true,
      secure: process.env.MODE === 'production' ? true : false,
      sameSite: 'Lax',
    });
  }
  next();
};
