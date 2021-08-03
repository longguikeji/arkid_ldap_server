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

    getUsers(tenant_id, params, token) {
        return this.instance.get(
            `v1/tenant/${tenant_id}/user/`,
            {
                params: params,
                headers: {
                    "Authorization": `Token ${token}`
                }
            }

        )
    }

    getGroups(tenant_id, params, token) {
        return this.instance.get(
            `v1/tenant/${tenant_id}/group/`,
            {
                params: params,
                headers: {
                    "Authorization": `Token ${token}`
                }
            }

        )
    }

    signIn(username, password) {
        logger.debug("SIGNIN", username, password)
        return this.instance.post(
            "v1/login/", {
                "username": username,
                "password": password
            }
        )
    }

    verify_token() {
        return this.instance.post(
            "v1/user/token/", {
                "token": this.token
            }
        );
    }
}