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
    const res = await this._instance.get(`v1/tenant/${tenant_id}/ldap/search/`, {
      params,
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return res;
  };

  async signIn(username: string, password: string) {
    logger.debug("SIGNIN", username, password);
    const res = await this._instance.post('v1/login/', {
      username,
      password
    });
    return res;
  };

};

export default ArkidClient;
