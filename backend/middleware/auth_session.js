const auth_session = (request, response, next) => {
    if (request.session.user) {
        return next();
    }
    else {
      return response.send({notlog: true});
    }
  };

module.exports = auth_session;