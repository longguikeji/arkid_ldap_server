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

const authenticate = (domain: string, BASE_DN:string) => {

  const client = new ArkidClient(domain);

  const cb = async (req: IAuthenticateRequest, res: any, next: Function) => {
    const parsedName = req.dn.toString().match(`cn=(.*), ou=(.*), (.*)${BASE_DN}`);
    if (!parsedName || parsedName.length != 4) {
      logger.debug(parsedName)
      logger.error(`The username '${req.dn.toString()}' does not match 'cn=username,ou=people, [o=TENANT_ID], ${BASE_DN}'`);
      return next(new ldap.InvalidDnSyntaxError(`The username '${req.dn.toString()}' does not match 'cn=username,ou=people, [o=TENANT_ID], ${BASE_DN}'`));
    };

    await client.signIn(parsedName[3],parsedName[1], req.credentials).then((response: any) => {
      logger.info(`Bind success for ${req.dn.toString()}`);
      logger.debug(`Reponse Content ${response}`);
      logger.debug(response.data?.error);
      if (!response.data?.error) {
        return next(new ldap.InvalidCredentialsError());
      };
      logger.info(response.data);
      res.end();
      req.connection.user_data = response.data.data;
      req.connection.tenant_uuid = parsedName[3];
      return next();
    }).catch(error => {
      logger.error(`Bind failed for ${req.dn.toString()}: "${error}"`);
      return next(new ldap.InvalidCredentialsError());
    });
  };

  return cb;

};

export default authenticate;
