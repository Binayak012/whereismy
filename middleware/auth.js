const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization']; //for reading the header

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // splitting the header to get the token

  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //verification
    req.user = decoded; //attaching the decoded info to req obj
    next(); //continue to next
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};