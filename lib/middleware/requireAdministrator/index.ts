import ldap from 'ldapjs';
import logger from '../../utils/logger';

const requireAdministrator = (req, res, next) => {
  if (req.connection.ldap.bindDN == null && req.connection.ldap.bindDN == "" && req.connection.ldap.bindDN != "cn=anonymous")
    return next(new ldap.InsufficientAccessRightsError());
  logger.debug(`middleware '${req.connection.ldap.bindDN}'`)
  return next();
};

export default requireAdministrator;
