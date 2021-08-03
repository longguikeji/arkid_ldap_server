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

    // TODO 获取用户列表
    getUsers(tenant_id, params) {

        return axios.get(
            `tenant/'${tenant_id}'v1/user/`,
            {
                params: params,
                headers: {
                    "Authorization": `Token '${this.get_token()}'`
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

    get_token() {
        if (this.token != null) {
            return this.token;
        } else {
            this.signIn("admin", "admin").then(
                data => {
                    this.token = data["data"]["token"];
                }
            ).catch(
                err => {
                    logger.error("无法获取token");
                }
            )
        };

        // 验证token
        this.verify_token().then(
            data => {
                if (data == true | data == "true") {
                    logger.debug("token可用");
                } else {
                    logger.debug("token可能失效");
                }
            }
        );

        return this.token;
    }
}