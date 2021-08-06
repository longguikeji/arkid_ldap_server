import logger from './logger'
import routes from './routes'
import { requireAuthenticated } from './middleware'

const path = require('path')
const ldap = require('ldapjs')
const nconf = require('nconf')

nconf.argv().env().file(path.join(__dirname, 'config.json')).defaults({
  LDAP_PORT: 389
})

logger.info('Starting LDAP endpoint for Auth...')

const server = ldap.createServer();

server.bind('', routes.bind(nconf.get('ARKID_DOMAIN')))

server.search('', requireAuthenticated, routes.search(nconf.get('ARKID_DOMAIN')))

server.listen(nconf.get('LDAP_PORT'), () => {
  logger.info(`LDAP server listening on: ${server.url}`)
})
