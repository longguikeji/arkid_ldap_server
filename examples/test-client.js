var ldap = require('ldapjs');
var client = ldap.createClient({
  url: 'ldap://127.0.0.1:1389'
});

client.bind('cn=admin,ou=people, o=4a883ea3e16d49fcbb814b27799343e7, dc=longguikeji, dc=com', 'admin', function (err) {
  if (err) {
    console.log('Bind Error:', JSON.stringify(err, null, 2));
    return client.unbind(function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

  console.log('Bind success.');

  var opts = {
    filter: '(cn=admin)',
    scope: 'sub',
    attributes: ['dn', 'sn', 'cn']
  };

  console.log(`Searching for: ${JSON.stringify(opts, null, 2)}`);

  client.search(``, opts, function (err, res) {
    res.on('searchEntry', function (entry) {
      console.log('Found: ' + JSON.stringify(entry.object));
    });
    res.on('searchReference', function (referral) {
      console.log('Referral: ' + referral.uris.join());
    });
    res.on('error', function (err) {
      console.error('Error: ' + err.message);
    });
    res.on('end', function (result) {
      console.log('Search Done. Status: ' + result.status);
    });
  });
  client.search(`ou=people, o=4a883ea3e16d49fcbb814b27799343e7, dc=longguikeji, dc=com`, opts, function (err, res) {
    res.on('searchEntry', function (entry) {
      console.log('Found: ' + JSON.stringify(entry.object));
    });
    res.on('searchReference', function (referral) {
      console.log('Referral: ' + referral.uris.join());
    });
    res.on('error', function (err) {
      console.error('Error: ' + err.message);
    });
    res.on('end', function (result) {
      console.log('Search Done. Status: ' + result.status);
    });
  });
});