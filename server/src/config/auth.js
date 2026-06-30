module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'milson-erp-dev-secret-change-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  saltRounds: 12,
};
