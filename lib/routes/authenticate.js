import ldap from 'ldapjs';
import ArkidClient from '../arkid_client';
import logger from '../logger';
import path from 'path';

export default function (domain) {
  const client = new ArkidClient(domain);

  return (req, res, next) => {
    // logger.debug(`Bind attempt with ${req.dn.toString()}`);

    const parsedName = req.dn.toString().match(/uid=(.*), ou=(.*), o=(.*), dc=longguikeji, dc=com/);
    if (!parsedName || parsedName.length != 4) {
      logger.debug(parsedName)
      logger.error(`The username '${req.dn.toString()}' does not match 'uid=username,ou=people, o=TENANT_ID, dc=longguikeji, dc=com'`);
      return next(new ldap.InvalidDnSyntaxError(`The username '${req.dn.toString()}' does not match 'uid=username,ou=people, o=TENANT_ID, dc=longguikeji, dc=com'`));
    }
    // logger.debug(parsedName[1],parsedName[2],req.credentials)

    client.signIn(parsedName[1], req.credentials)
      .then((response) => {
        // logger.debug(data)
        logger.info(`Bind success for ${req.dn.toString()}`);
        res.end();
        var cache = require('flat-cache').load("ldap", path.resolve('./'));
        logger.debug(response.data.data);
        cache.setKey(
          req.dn.toString(),
          response.data.data
        );
        cache.save();
        return next();
      }).catch(err => {
        logger.error(`Bind failed for ${req.dn.toString()}: "${err}"`);
        return next(new ldap.InvalidCredentialsError());
      });
  };
}