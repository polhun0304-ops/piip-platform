const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: '토큰이 필요합니다.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // userId, role 등
    next();
  } catch (err) {
    res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
  }
};
