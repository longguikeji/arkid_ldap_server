import axios from "axios";
import logger from '.logger';
export default class ArkidClient {
    constructor(domain) {
        this.instance = axios.create({
            baseURL: domain + '/api/',
            timeout: 1000,
            headers: {'X-Custom-Header': 'longgui'}
        });
    }

    // TODO 获取用户列表
    getUsers(params) {
        return axios.post(
            {
                url: "v1/user/",
                data: params
            }
        )
    }

    // TODO 登陆接口
    signIn(username,password,connection){
        logger.debug(username,password)
        return axios.post(
            {
                url: "v1/login/",
                data: {
                    "username": username,
                    "password": password
                }
            }
        )
    }
}