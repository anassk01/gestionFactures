const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "no token was provided " });
  }
  const token = authHeader.split(" ")[1];
  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifyToken;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "token is wrong" });
  }
}

module.exports = authenticate;
