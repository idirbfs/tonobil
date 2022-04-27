module.exports = function (req, res, next) {
  if (!req.session.isClient) {
    req.session.destroy();
    return res.status(401).json({ msg: "Authorization denied" });
  }
  next();
};
