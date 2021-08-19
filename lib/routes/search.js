import ldap from 'ldapjs';
import ArkidClient from '../arkid_client';
import logger from '../logger';


export default function (domain) {
  const client = new ArkidClient(domain);

  return async function (req, res, next) {
    logger.info(`Searching '${req.dn.toString()}' (scope: ${req.scope || 'N/A'}, attributes: ${req.attributes || 'N/A'}): ${JSON.stringify(req.filter.json, null, 2)}`);
    const params = req.filter.json;
    params["dn"] = req.dn.toString();
    if(!params["dn"]){
      logger.debug("params['dn']");
      params["dn"] = `o=${req.connection.tenant_uuid},dc=longguikeji,dc=com`;
    }

    params["scope"] = req.scope;
    params["attributes"] = req.attributes;

    await client.search(req.connection.tenant_uuid, params, req.connection.user_data).then(response => {
      logger.debug(response.data);
      response.data.results.forEach(
        item => {
          logger.debug(item);
          res.send(item);
        }
      );
      logger.debug(response.data)
    }).catch(err => {
      logger.error(err.toString());
      return next(new ldap.OperationsError('Search failed.'));
    });
    res.end();
    return next()
  };
}