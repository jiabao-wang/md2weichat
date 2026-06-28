import axios, { AxiosInstance } from 'axios';
import { WeChatConfig } from '../types';

const BASE_URL = 'https://api.weixin.qq.com/cgi-bin';

export class WeChatClient {
  private config: WeChatConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private http: AxiosInstance;

  constructor(config: WeChatConfig) {
    this.config = config;
    this.http = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
    });
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    const response = await this.http.get('/token', {
      params: {
        grant_type: 'client_credential',
        appid: this.config.appId,
        secret: this.config.appSecret,
      },
    });

    if (response.data.errcode) {
      throw new Error(`Failed to get access token: ${response.data.errmsg} (${response.data.errcode})`);
    }

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
    return this.accessToken!;
  }

  async request<T = any>(method: string, url: string, data?: any, params?: any): Promise<T> {
    const token = await this.getAccessToken();
    const response = await this.http.request({
      method,
      url,
      data,
      params: { ...params, access_token: token },
    });

    if (response.data.errcode && response.data.errcode !== 0) {
      if (response.data.errcode === 40001 || response.data.errcode === 42001) {
        this.accessToken = null;
        return this.request(method, url, data, params);
      }
      throw new Error(`WeChat API error: ${response.data.errmsg} (${response.data.errcode})`);
    }

    return response.data;
  }
}
