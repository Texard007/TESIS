module.exports = {
  secret: process.env.JWT_SECRET || 'default_dev_secret_change_me',
  expiration: process.env.JWT_EXPIRATION || '24h',
};
