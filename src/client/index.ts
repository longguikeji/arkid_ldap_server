import axios, { AxiosInstance } from 'axios'
import logger from '../logger'

class ArkidClient {

  private instance: AxiosInstance

  constructor(domain: string) {
    this.instance = axios.create({
      baseURL: domain,
      timeout: 3000,
      headers: {
        'X-Custom-Header': 'longgui'
      }
    })
  }

  async getUsers(id: string, params: object, token: string) {
    return await this.instance.get(`v1/tenant/${id}/user/`,
      {
        params: params,
        headers: {
          'Authorization': `Token ${token}`
        }
      }
    )
  }

  async getGroups(id: string, params: object, token: string) {
    return await this.instance.get(`v1/tenant/${id}/group/`,
      {
        params: params,
        headers: {
          'Authorization': `Token ${token}`
        }
      }
    )
  }

  async signIn(username: string, password: string) {
    logger.debug("SIGNIN", username, password)
    return await this.instance.post('v1/login/',
      {
        'username': username,
        'password': password
      }
    )
  }
}

export default ArkidClient
