import ldap from 'ldapjs';
import ArkidClient from '../../client/index';
import logger from '../../utils/logger';

interface IAuthenticateRequest {
  dn: string
  version?: number
  name?: string
  authentication?: string
  credentials: string
  connection: any
};

const authenticate = (domain: string) => {

  const client = new ArkidClient(domain);

  const cb = async (req: IAuthenticateRequest, res: any, next: Function) => {
    const parsedName = req.dn.toString().match(`cn=(.*), ou=people, o=([0-9a-f]{32}), (.*)`);
    if (!parsedName || parsedName.length != 4) {
      logger.debug(parsedName)
      logger.error(`The username '${req.dn.toString()}' does not match 'cn=USERNAME, ou=people, o=TENANT_ID, BASEDN'`);
      return next(new ldap.InvalidDnSyntaxError(`The username '${req.dn.toString()}' does not match 'cn=USERNAME, ou=people, o=TENANT_ID, BASE_DN'`));
    };

    await client.signIn(parsedName[2],parsedName[1], req.credentials,parsedName[3]).then((response: any) => {
      logger.info(`Bind success for ${req.dn.toString()}`);
      logger.debug(`Reponse Content ${response}`);
      logger.debug(response.data?.error);
      if (!response.data?.error) {
        return next(new ldap.InvalidCredentialsError());
      };
      logger.info(response.data);
      res.end();
      req.connection.token = response.data.token;
      req.connection.tenant_uuid = parsedName[2];
      req.connection.base_dn = parsedName[3];
      return next();
    }).catch(error => {
      logger.error(error.message);
      logger.error(`Bind failed for ${req.dn.toString()}: "${error}"`);
      return next(new ldap.InvalidCredentialsError());
    });
  };

  return cb;

};

export default authenticate;
