import ldap, { SearchOptions } from "ldapjs";
import ArkidClient from "../../client/index";
import logger from "../../utils/logger";

interface IBindRequest extends SearchOptions {
  dn: string;
  filter: any;
  connection: any;
}

function get_subitem_of_tenant(base_dn: string) {
  return [
    {
      dn: `ou=people, ${base_dn}`,
      attributes: {
        objectclass: ["container"],
        hassubordinates: true,
      },
    },
    {
      dn: `ou=group, ${base_dn}`,
      attributes: {
        objectclass: ["container"],
        hassubordinates: true,
      },
    },
  ];
}

function item_of_tenant(tenant: any, base_dn: string) {
  return {
    dn: `o=${tenant.id}, ${base_dn}`,
    attributes: {
      objectclass: ["container"],
      name: tenant.name,
      slug: tenant.slug,
      hassubordinates: true,
    },
  };
}

function item_of_user(user: any, base_dn: string) {
  return {
    dn: `cn=${user.username}, ${base_dn}`,
    attributes: {
      objectclass: ["arkid-user", "person"],
      username: user.username,
      id: user.id,
      hassubordinates: false,
    },
  };
}

function matches_item(req, res, items) {
  logger.debug("matches", items);
  items.forEach((item) => {
    if (req.filter.matches(item.attributes)) {
      res.send(item);
      logger.debug("111, send", item);
    }
  });
}

const search = (domain: string) => {
  const client = new ArkidClient(domain);

  const cb = async (req: IBindRequest, res: any, next: Function) => {
    logger.info(
      `Searching '${req.dn.toString()}' (scope: ${
        req.scope || "N/A"
      }, attributes: ${req.attributes || "N/A"}): ${JSON.stringify(
        req.filter.json,
        null,
        2
      )}`
    );
    const params = req.filter.json;
    logger.debug(
      "========================================================================"
    );
    params["dn"] = req.dn.toString();
    if (!params["dn"]) {
      // logger.debug(req.connection.tenant_uuid);
      params["dn"] = `${req.connection.base_dn}`;
    }

    params["scope"] = req.scope;
    params["attributes"] = req.attributes;
    logger.debug(req.scope, req.connection.base_dn, 111, req.dn.toString());

    const base_dn = req.dn.toString()

    switch (req.scope) {
      
      case "base":

        if (!base_dn) {
          res.send({
            dn: `${base_dn}`,
            attributes: {
              objectclass: ["top", "root", "domain"],
              hassubordinates: true,
              subschemaSubentry: 'dc=longguikeji, dc=com'
            },
          });
          break;
        }
        // 表示把基准DN作为搜索对象。例如：cn=yanzong,ou=Ops,dc=shuyun,dc=com 的基准DN是dc=shuyun,dc=com 此处仅给出第一层
        // 1. 判断基准DN所在层
        const search_key = ldap
          .parseDN(base_dn)
          .toString()
          .replace(" ", "")
          .split(",")[0]
          .split("=");
        logger.debug(search_key);
        if (search_key[0] === "ou") {
          if (search_key[1] === "people") {
          } else if (search_key[1] === "group") {
          }
        } else if (search_key[0] === "o") {
          await client
            .find_tenant(req.connection.tenant_uuid, req.connection.token)
            .then((response) => {
              const item = item_of_tenant(
                response.data.data,
                ldap.parseDN(base_dn).parent()
              );
              if (req.filter.matches(item.attributes)) {
                res.send(item);
              }
            });
        } else if (search_key[0] === "dc") {
          res.send({
            dn: `${base_dn}`,
            attributes: {
              objectclass: ["top", "root", "domain"],
              hassubordinates: true,
              subschemaSubentry: 'cn=schema'
            },
          });
        } else {
        }

        break;

      case "one":
        // 表示把基准DN的第一层作为搜索对象，如上个例子中的ou=Ops为搜索对象。

        const one_search_key = ldap
          .parseDN(base_dn || req.connection.base_dn.toString())
          .toString()
          .replace(" ", "")
          .split(",")[0]
          .split("=");

        switch (one_search_key[0]) {
          case "o":
            matches_item(req, res, get_subitem_of_tenant(base_dn));
            break;
          case "ou":
            if (one_search_key[1] === "people") {
              await client
                .find_tenant_users(
                  req.connection.tenant_uuid,
                  req.connection.token
                )
                .then((response) => {
                  response.data.data.forEach((item) => {
                    logger.debug(item);

                    const ldap_item = item_of_user(item, base_dn || req.connection.base_dn.toString());

                    if (req.filter.matches(ldap_item.attributes))
                      res.send(ldap_item);
                  });
                });
            } else if (one_search_key[1] === "group") {
            }
            break;
          case "dc":
            if(one_search_key[1] === "com"){
              logger.debug("send",`${req.connection.base_dn.toString()}`)

              res.send({
                dn: `${req.connection.base_dn.toString()}`,
                attributes: {
                  objectclass: ["container"],
                  hassubordinates: true,
                },
              });
            }else{
              await client
              .search_tenant(req.connection.tenant_uuid, params, req.connection.token)
              .then((response) => {
                response.data.data.forEach((item) => {
                  const ldap_item = item_of_tenant(item, base_dn);
                  logger.debug(ldap_item)
                  if (req.filter.matches(ldap_item.attributes))
                    logger.debug("send",ldap_item)
                    res.send(ldap_item);
                });
              });
            }
            break
          default:
            logger.debug("one 111", one_search_key[0]);
            break;
        }

        break;

      case "sub":
        // 表示把基准DN及以下的整棵树都作为搜索对象。
        logger.debug("sub", one_search_key[0]);
        break;
    }

    res.end();
    logger.debug(
      "========================================================================"
    );
    return next();
  };

  return cb;
};

export default search;
