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
    const res = await this._instance.post(
      `/api/v1/tenant/${tenant_id}/com_longgui_app_protocol_ldapserver/search/`,
      params,
      {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return res;
  };

  async signIn(tenant_id: string, username: string, password: string, base_dn: string) {
    logger.debug("SIGNIN", username, password);
    const res = await this._instance.post(`/api/v1/tenant/${tenant_id}/com_longgui_app_protocol_ldapserver/login/`, {
      username:username,
      password:password,
      basedn:base_dn
    });
    return res;
  };


  async search_tenant(tenant_id: string, params: any, token: string){
    const res = await this._instance.post(
      `/api/v1/tenant/${tenant_id}/com_longgui_app_protocol_ldapserver/tenant_search/`,
      params,
      {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return res;
  }

  async find_tenant(tenant_id: string, token: string){
    const res = await this._instance.get(
      `/api/v1/tenant/${tenant_id}/com_longgui_app_protocol_ldapserver/find_tenant/`,
      {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return res;
  }

  async find_tenant_users(tenant_id: string, token: string){
    const res = await this._instance.get(
      `/api/v1/tenant/${tenant_id}/com_longgui_app_protocol_ldapserver/find_tenant_users/`,
      {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return res;
  }
};

export default ArkidClient;
