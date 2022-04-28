module.exports = function (req, res, next) {
  if (!req.session.isGerant) {
    return res.status(401).json({ msg: "Authorization denied" });
  }
  next();
};
