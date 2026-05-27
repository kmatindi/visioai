const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT tokens and attach user to request.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Check if user is on a specific plan or higher.
 * Plan hierarchy: free < pro < studio < enterprise
 */
const requirePlan = (...allowedPlans) => {
  const planOrder = { free: 0, pro: 1, studio: 2, enterprise: 3 };
  return (req, res, next) => {
    const userPlanLevel = planOrder[req.user?.plan] ?? 0;
    const minRequired = Math.min(...allowedPlans.map(p => planOrder[p] ?? 99));
    if (userPlanLevel >= minRequired) {
      return next();
    }
    return res.status(403).json({
      error: 'Your current plan does not include this feature.',
      requiredPlan: allowedPlans[0],
      currentPlan: req.user?.plan || 'free',
      upgradeUrl: '/pricing',
    });
  };
};

module.exports = { authenticate, requirePlan };
