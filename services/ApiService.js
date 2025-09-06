import axios from 'axios'
import { isEmpty } from 'lodash'
import { HEADERS, METHODS, URLs } from '../constants/Strings'
import { getData_MMKV } from './StorageService'

const apiInstance = axios.create({
  baseURL: URLs.BASE_URL
})

apiInstance.interceptors.request.use(config => {
  try {
    const accessToken = getData_MMKV('user-token')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  } catch (err) {
    console.log('currently no stored token', err)
  }
  return config
})

const ApiService = {
  get: async function (opts) {
    try {
      const response = await apiInstance({
        method: METHODS.GET,
        url: opts.url,
        params: opts.params,
        headers: this.getHeaders(opts)
      })
      return this.getResponse(response)
    } catch (err) {
      throw new Error(err)
    }
  },

  post: async function (opts) {
    try {
      const response = await apiInstance({
        method: METHODS.POST,
        url: opts.url,
        data: opts.data,
        headers: this.getHeaders(opts)
      })
      return this.getResponse(response)
    } catch (err) {
      if (typeof err === 'object') {
        return Promise.reject(err)
      }
      throw new Error(err)
    }
  },

  put: async function (opts) {
    try {
      const response = await apiInstance({
        method: METHODS.PUT,
        url: opts.url,
        data: opts.data,
        headers: this.getHeaders(opts)
      })
      return this.getResponse(response)
    } catch (err) {
      throw new Error(err)
    }
  },

  patch: async function (opts) {
    try {
      const response = await apiInstance({
        method: METHODS.PATCH,
        url: opts.url,
        data: opts.data,
        headers: this.getHeaders(opts),
        params: opts.params
      })
      return this.getResponse(response)
    } catch (err) {
      throw new Error(err)
    }
  },

  delete: async function (opts) {
    try {
      const response = await apiInstance({
        method: METHODS.DELETE,
        url: opts.url,
        data: opts.data,
        headers: this.getHeaders(opts),
        params: opts.params
      })
      return this.getResponse(response)
    } catch (err) {
      throw new Error(err)
    }
  },

  getHeaders: function (opts) {
    return opts.isMultipart
      ? {
          accept: HEADERS.APPLICATION_JSON,
          'Content-type': HEADERS.MULTIPART_FORMDATA
        }
      : opts.headers
  },

  getResponse: function (response) {
    if (!isEmpty(response) || response.status === 200) {
      return Promise.resolve(response.data)
    }
    return Promise.resolve(null)
  }
}

export default ApiService
