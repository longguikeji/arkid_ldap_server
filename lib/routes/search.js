import ldap from 'ldapjs';
import ArkidClient from '../arkid_client';
import logger from '../logger';


export default function (domain) {
  const client = new ArkidClient(domain);

  return async function (req, res, next) {
    logger.info(`Searching '${req.dn.toString()}' (scope: ${req.scope || 'N/A'}, attributes: ${req.attributes || 'N/A'}): ${JSON.stringify(req.filter.json, null, 2)}`);
    // logger.debug(res.token)

    const parsedUnit = req.dn.toString().match(/ou=(.*)/);
    if (!parsedUnit || parsedUnit.length != 2) {
      logger.error(`The distinguished name '${req.dn.toString()}' does not match 'OU='`);
      return next(new ldap.InvalidDnSyntaxError(`The distinguished name '${req.dn.toString()}' does not match 'OU=search_type,O=tenant_id'`));
    }

    // if (!req.filter.json || req.filter.json.type != 'EqualityMatch') {
    //   logger.debug(req.filter.json);
    // }
    const params = req.filter.json
    logger.debug(`${req.connection.user_data.token}-1111`);
    logger.debug(parsedUnit[1], parsedUnit[2]);

    const token = req.connection.user_data.token;
    var req_params = {};
    if (parsedUnit[1] == "people") {
      // 用户搜索
      const attribute_mapping = {
        "uid": "uuid",
        "cn": "username",
        "givenName": "last_name",
        "mail": "email",
        "telephoneNumber": "mobile"
      }
      if (attribute_mapping[params.attribute] != null) {
        req_params[attribute_mapping[params.attribute]] = params.value;
      } else {
        req_params[params.attribute] = params.value;
      }
      await client.getUsers(req.connection.tenant_uuid, req_params, token).then(response => {
        response.data.results.forEach(
          user => {
            logger.debug(user);
            res.send({
              dn: `CN=${user.username}, OU=people, o=${req.connection.tenant_uuid}`,
              attributes: {
                userPrincipalName: user.username,
                cn: user.username,
                objectClass: ['user'],
                objectCategory: ['user']
              }
            });
          }
        );
        logger.debug(response.data)
      }).catch(err => {
        logger.error(err.toString());
        return next(new ldap.OperationsError('Search failed.'));
      })
      logger.debug(11111);
      res.send({
        dn: `CN=guancy, OU=people`,
        attributes: {
          userPrincipalName: "guancy",
          cn: "guancy",
          objectClass: ['user'],
          objectCategory: ['user']
        }
      });
    } else if (parsedUnit[1] == "group") {
      // 群组搜索
      req_params[params.attribute] = params.value;
      client.getGroups(parsedUnit[2], req_params, token).then(response => {
        logger.debug(response.data)
        response.data.results.forEach(
          group => {
            res.send({
              dn: `CN=${group.name}, OU=people`,
              attributes: {
                userPrincipalName: user.name,
                cn: user.name,
                objectClass: ['group'],
                objectCategory: ['group']
              }
            });
          }
        );
      }).catch(err => {
        logger.error(err.toString());
        return next(new ldap.OperationsError('Search failed.'));
      })

    } else if (parsedUnit[1] == "dept") {
      // 部门搜索

    } else {
      logger.error(`Unsupport type of search: '${parsedUnit[1]}' ,correct it and try again`);
      return next(new ldap.InvalidDnSyntaxError(`Unsupport type of search: '${parsedUnit[1]}' ,correct it and try again`));
    }
    res.end();
    return next()
  };
}