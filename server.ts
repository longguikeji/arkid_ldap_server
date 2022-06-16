import path from 'path';
import ldap from 'ldapjs';
import nconf from 'nconf';

import logger from './lib/utils/logger';
import { authenticate, search } from './lib/routes/index';
import { requireAdministrator } from './lib/middleware';

nconf
  .argv()
  .env()
  .file(path.join(__dirname, 'config.json'))
  .defaults({
    LDAP_PORT: 389
  });

logger.info('Starting LDAP endpoint for Auth...');

const server = ldap.createServer();
server.bind('', authenticate(nconf.get('ARKID_DOMAIN'),nconf.get('BASE_DN')));
server.search('', requireAdministrator, search(nconf.get('ARKID_DOMAIN')));
server.listen(nconf.get('LDAP_PORT'), () => {
  logger.info(`LDAP server listening on: ${server.url}`);
});
