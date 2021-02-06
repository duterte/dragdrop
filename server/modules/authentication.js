const { auth } = require('express-openid-connect');

function handler(app) {
  app.use(
    auth({
      authRequired: false,
      auth0Logout: true,
      issuerBaseURL: process.env.ISSUER_BASE_URL,
      baseURL: process.env.BASE_URL,
      clientID: process.env.CLIENT_ID,
      secret: process.env.SECRET,
    })
  );

  app.use((req, res, next) => {
    req.data = undefined;
    if (req.oidc.isAuthenticated()) {
      req.user = req.oidc.user;
      // console.log(req.data);
    }
    next();
  });
}

module.exports = handler;
