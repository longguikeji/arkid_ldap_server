import axios from "axios";
import logger from "./logger";
export default class ArkidClient {
    constructor(domain) {
        this.instance = axios.create({
            baseURL: domain,
            timeout: 1000,
            headers: {
                'X-Custom-Header': 'longgui'
            }
        });
        this.token = null;
    }

    async search(tenant_id, params, token) {
        return await this.instance.get(
            `v1/tenant/${tenant_id}/ldap/search/`,
            {
                params: params,
                headers: {
                    "Authorization": `Token ${token}`
                }
            }

        )
    }

    async signIn(username, password) {
        logger.debug("SIGNIN", username, password)
        return await this.instance.post(
            "v1/login/", {
                "username": username,
                "password": password
            }
        )
    }
}