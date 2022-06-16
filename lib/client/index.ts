import axios, { AxiosInstance } from "axios";
import logger from "../utils/logger";

class ArkidClient {

  private _instance: AxiosInstance;

  constructor(domain: string) {
    this._instance = axios.create({
      baseURL: domain,
      timeout: 1000,
      headers: {
        'X-Custom-Header': 'longgui'
      }
    });
  };

  async search(tenant_id: string, params: any, token: string) {
    const res = await this._instance.get(`/api/v1/ldap/search/`, {
      params,
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return res;
  };

  async signIn(tenant_id: string, username: string, password: string) {
    logger.debug("SIGNIN", username, password);
    const res = await this._instance.post(`/api/v1/ldap/login/`, {
      username,
      password
    });
    return res;
  };

};

export default ArkidClient;
