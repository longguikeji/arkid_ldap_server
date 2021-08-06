import ldap from 'ldapjs'
import ArkidClient from '../../client'
import logger from '../../logger'

interface SearchRequest {
  dn: string
  scope: 'base' | 'one' | 'sub'
  filter: any
  connection: any
  attributes?: any
}

const search = (domain: string) => {

  const client = new ArkidClient(domain)

  const cb = (req: SearchRequest, res: any, next: any) => {

    logger.info(
      `Searching '${req.dn.toString()}' (scope: ${req.scope || 'N/A'}, attributes: ${req.attributes || 'N/A'}): ${JSON.stringify(req.filter.json, null, 2)}`
    )
    
    const parsedUnit = req.dn.toString().match(/ou=(.*), o=(.*)/)
    if (!parsedUnit || parsedUnit.length != 3) {
      logger.error(`The distinguished name '${req.dn.toString()}' does not match 'OU=search_type,O=tenant_id'`)
      return next(
        new ldap.InvalidDnSyntaxError(`The distinguished name '${req.dn.toString()}' does not match 'OU=search_type,O=tenant_id'`)
      )
    }

    const params = req.filter.json

    logger.debug(`${req.connection.user_data.token}-1111`)
    logger.debug(parsedUnit[1], parsedUnit[2])

    const token = req.connection.user_data.token
    const reqParams = {
      [params.attribute]: params.value
    }

    if (parsedUnit[1] === 'people') { // User
      client.getUsers(parsedUnit[2], reqParams, token).then(response => {
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
            })
          }
        )
      }).catch(err => {
        logger.error(err.toString())
        return next(new ldap.OperationsError('Search failed.'))
      })
    } else if (parsedUnit[1] === 'group') { // Group
      client.getGroups(parsedUnit[2], reqParams, token).then(response => {
        logger.debug(response.data)
        response.data.results.forEach(
          group => {
            res.send({
              dn: `CN=${group.name}, OU=people`,
              attributes: {
                userPrincipalName: group.name,
                cn: group.name,
                objectClass: ['group'],
                objectCategory: ['group']
              }
            })
          }
        )
      }).catch(err => {
        logger.error(err.toString())
        return next(new ldap.OperationsError('Search failed.'))
      })
    } else {
      logger.error(`Unsupport type of search: '${parsedUnit[1]}' ,correct it and try again`)
      return next(new ldap.InvalidDnSyntaxError(`Unsupport type of search: '${parsedUnit[1]}' ,correct it and try again`))
    }
  }

  return cb
}

export default search
