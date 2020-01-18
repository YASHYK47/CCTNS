var { SHO } = require ( "../models/SHO.js" );

var authenticateSHO = (req, res, next) => {
  var token = req.header( "x-auth" );
  SHO.findByToken( token )
    .then(sho => {
      if (!sho) {
        return Promise.reject();
      }
      req.user = sho;
      req.token = token;
      next();
    })
    .catch(e => {
      res.status(401).send();
    });
};

module.exports = { authenticateSHO };
