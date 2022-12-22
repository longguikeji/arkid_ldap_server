#!/bin/bash

# shellcheck disable=SC1091

set -o errexit
set -o nounset
set -o pipefail


exec npm run start --LDAP_PORT 1389 --ARKID_DOMAIN "${BEURL}"