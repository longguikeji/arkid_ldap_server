import ldap, { SearchOptions } from 'ldapjs';
import ArkidClient from '../../client/index';
import logger from '../../utils/logger';

interface IBindRequest extends SearchOptions {
  dn: string
  filter: any
  connection: any
};

const search = (domain: string) => {

  const client = new ArkidClient(domain);

  const cb = async (req: IBindRequest, res: any, next: Function) => {
    logger.info(`Searching '${req.dn.toString()}' (scope: ${req.scope || 'N/A'}, attributes: ${req.attributes || 'N/A'}): ${JSON.stringify(req.filter.json, null, 2)}`);
    const params = req.filter.json;
    logger.debug(params);
    params["dn"] = req.dn.toString();
    if(!params["dn"]){
      logger.debug(req.connection.tenant_uuid);
      params["dn"] = `o=${req.connection.tenant_uuid},dc=longguikeji,dc=com`;
    };

    params["scope"] = req.scope;
    params["attributes"] = req.attributes;

    await client.search(req.connection.tenant_uuid, params, req.connection.user_data).then((response: any) => {
      logger.debug(response.data);
      response.data.results.forEach(item => {
          logger.debug(item);
          res.send(item);
        }
      );
      logger.debug(response.data);
    }).catch(error => {
      logger.error(error.toString());
      return next(new ldap.OperationsError('Search failed.'));
    });

    res.end();

    return next();
  };

  return cb;
};

export default search;
