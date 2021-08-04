import ldap from 'ldapjs';
import ArkidClient from '../arkid_client';
import logger from '../logger';

export default function (domain) {
  const client = new ArkidClient(domain);

  return function (req, res, next) {
    logger.info(`Searching '${req.dn.toString()}' (scope: ${req.scope || 'N/A'}, attributes: ${req.attributes || 'N/A'}): ${JSON.stringify(req.filter.json, null, 2)}`);
    // logger.debug(res.token)

    const parsedUnit = req.dn.toString().match(/ou=(.*), o=(.*)/);
    if (!parsedUnit || parsedUnit.length != 3) {
      logger.error(`The distinguished name '${req.dn.toString()}' does not match 'OU=search_type,O=tenant_id'`);
      return next(new ldap.InvalidDnSyntaxError(`The distinguished name '${req.dn.toString()}' does not match 'OU=search_type,O=tenant_id'`));
    }

    // if (!req.filter.json || req.filter.json.type != 'EqualityMatch' || req.filter.json.attribute != 'email') {
    //   logger.error(`This server only allows you to search for users by email.`);
    //   return next(new ldap.UnwillingToPerformError(`This server only allows you to search for users by email.`));
    // }
    const params = req.filter.json
    logger.debug(`${req.connection.user_data.token}-1111`);
    logger.debug(parsedUnit[1], parsedUnit[2]);

    const token = req.connection.user_data.token;
    var req_params = {};
    req_params[params.attribute] = params.value;

    if (parsedUnit[1] == "people") {
      // 用户搜索
      client.getUsers(parsedUnit[2], req_params, token).then(response => {
        logger.debug(response.data)
        response.data.results.forEach(
          user => {
            res.send({
              dn: `CN=${user.username}, OU=people`,
              attributes: {
                userPrincipalName: user.username,
                cn: user.username,
                objectClass: ['user'],
                objectCategory: ['user']
              }
            });
          }
        );
      }).catch(err => {
        logger.error(err.toString());
        return next(new ldap.OperationsError('Search failed.'));
      })

    } else if (parsedUnit[1] == "group") {
      // 群组搜索
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

    // const params = {
    //   per_page: 10,
    //   search_engine: 'v2',
    //   connection: parsedUnit[1],
    //   q: `email:"${req.filter.json.value}"`
    // };

    // logger.debug(`Searching for: ${JSON.stringify(params, null, 2)}`);

    // client.getUsers(params, (err, users) => {
    //   if (err) {
    //     logger.error(`Search error: ${JSON.stringify(err, null, 2)}`);
    //     return next(new ldap.OperationsError('Search failed.'));
    //   }

    //   users.forEach(user => {
    //     logger.debug(`Found user: ${JSON.stringify(user, null, 2)}`);

    //     res.send({
    //       dn: `CN=${user.email}, OU=${user.identities[0].connection}`,
    //       attributes: {
    //         userPrincipalName: user.email,
    //         cn: user.email,
    //         objectClass: ['user'],
    //         objectCategory: ['user']
    //       }
    //     });
    //   });

    //   res.end();
    //   return next();
    // });
    res.end();
    return next()
  };
}