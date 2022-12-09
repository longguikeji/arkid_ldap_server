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
      params["dn"] = `${req.connection.base_dn}`;
    };

    params["scope"] = req.scope;
    params["attributes"] = req.attributes;
    logger.debug(req.connection.token);

    await client.search(req.connection.tenant_uuid, params, req.connection.token).then((response: any) => {
      logger.debug(response.data.data);
      (response.data.data || []).forEach(item => {
          logger.debug(item);
          if (req.filter.matches(item.attributes))
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
