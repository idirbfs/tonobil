module.exports = function (req, res, next) {
  if (!req.session.isAdmin) {
    req.session.destroy();
    return res.status(401).json({ msg: "Authorization denied" });
  }
  next();
};
