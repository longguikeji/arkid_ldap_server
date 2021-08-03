import ldap from 'ldapjs';
import nconf from 'nconf';
import logger from '../logger';

module.exports = (req, res, next) => {
  if (req.connection.ldap.bindDN == null | req.connection.ldap.bindDN == "")
    return next(new ldap.InsufficientAccessRightsError());
  logger.debug(`middleware '${req.connection.ldap.bindDN}'`)
  return next();
};
