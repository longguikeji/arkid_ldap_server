import ldap from 'ldapjs';
import ArkidClient from '../arkid_client';
import logger from '../logger';

export default function (domain) {
  const client = new ArkidClient(domain);

  return (req, res, next) => {

    const parsedName = req.dn.toString().match(/uid=(.*), ou=(.*), o=(.*), dc=longguikeji, dc=com/);
    if (!parsedName || parsedName.length != 4) {
      logger.debug(parsedName)
      logger.error(`The username '${req.dn.toString()}' does not match 'uid=username,ou=people, o=TENANT_ID, dc=longguikeji, dc=com'`);
      return next(new ldap.InvalidDnSyntaxError(`The username '${req.dn.toString()}' does not match 'uid=username,ou=people, o=TENANT_ID, dc=longguikeji, dc=com'`));
    }

    client.signIn(parsedName[1], req.credentials)
      .then((response) => {
        logger.info(`Bind success for ${req.dn.toString()}`);
        logger.info(response.data.data);
        res.end();
        req.connection.user_data = response.data.data;
        req.connection.tenant_uuid = parsedName[3];
        return next();
      }).catch(err => {
        logger.error(`Bind failed for ${req.dn.toString()}: "${err}"`);
        return next(new ldap.InvalidCredentialsError());
      });
  };
}