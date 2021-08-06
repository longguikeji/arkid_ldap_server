import ldap from 'ldapjs'
import ArkidClient from '../../client'
import logger from '../../logger'

interface BindRequest {
  dn: string
  version?: number
  name?: string
  authentication?: string
  credentials: string
  connection: any
}

const bind = (domain: string) => {

  const client = new ArkidClient(domain)

  const cb = (req: BindRequest, res: any, next: any) => {

    const parsedName = req.dn.toString().match(/uid=(.*), ou=(.*), o=(.*), dc=longguikeji, dc=com/)

    if (!parsedName || parsedName.length != 4) {
      logger.error(`The username '${req.dn.toString()}' does not match 'uid=username,ou=people, o=TENANT_ID, dc=longguikeji, dc=com'`)
        
      return next(
        new ldap.InvalidDnSyntaxError(`The username '${req.dn.toString()}' does not match 'uid=username,ou=people, o=TENANT_ID, dc=longguikeji, dc=com'`)
      )
    }

    client.signIn(parsedName[1], req.credentials)
    .then((response) => {
      logger.info(`Bind success for ${req.dn.toString()}`)
      res.end()
      req.connection.user_data = response.data.data
      return next()
    }).catch(err => {
      logger.error(`Bind failed for ${req.dn.toString()}: "${err}"`)
      return next(new ldap.InvalidCredentialsError())
    })

  }

  return cb

}

export default bind
