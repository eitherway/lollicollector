const middleware = {};

// Error Handling Helper Function
middleware.asyncHelper = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

module.exports = middleware;
