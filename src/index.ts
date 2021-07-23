import crypto from 'crypto'
import cryptoRandomString from 'crypto-random-string'
import got from 'got'
import _ from 'lodash'

const specialUrlEncode = function specialUrlEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/%7E/g, '~')
}

interface Config {
  accessKeyID: string
  accessKeySecret: string
  endpoint: string
  apiVersion: string
  signName: string
}

type RequestAction = 'SendSms' | 'SendBatchSms'

interface RequestBaseOptions {
  Signature: string
  Action: RequestAction
  AccessKeyId: string
  Format: 'JSON' | 'XML'
  RegionId: 'cn-hangzhou'
  SignatureMethod: 'HMAC-SHA1'
  SignatureNonce: string
  SignatureVersion: '1.0'
  Timestamp: string
  Version: '2017-05-25'
}

interface RequestOptions extends RequestBaseOptions {
  [key: string]: string
}

interface BaseResponse {
  RequestId: string
  Code: string
  Message: string
}

type SmsParams = Record<string, string | number>

interface SendSmsOptions {
  SignName: string
  SmsUpExtendCode: string
  OutId: string
}

interface SendBatchSmsOptions {
  SmsUpExtendCodeJson: string
}

class SmsService {
  config: Config

  constructor(accessKeyID: string, accessKeySecret: string, signName: string) {
    this.config = {
      accessKeyID,
      accessKeySecret,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25',
      signName,
    }
  }

  async sendSms(
    templateCode: string,
    phoneNumbers: string | string[]
  ): Promise<void>

  async sendSms(
    templateCode: string,
    phoneNumbers: string | string[],
    templateParams: SmsParams
  ): Promise<void>

  async sendSms(
    templateCode: string,
    phoneNumbers: string | string[],
    templateParams: SmsParams,
    options: Record<string, string>
  ): Promise<void>

  async sendSms(
    templateCode: string,
    phoneNumbers: string | string[],
    templateParams?: SmsParams,
    options?: Partial<SendSmsOptions>
  ): Promise<void> {
    const { signName } = this.config
    const phones =
      typeof phoneNumbers === 'string' ? phoneNumbers : phoneNumbers.join(',')
    const params = templateParams ? JSON.stringify(templateParams) : ''

    const payload = _.assign(
      {
        PhoneNumbers: phones,
        SignName: signName,
        TemplateCode: templateCode,
        TemplateParam: params,
      },
      options
    )

    return this.request('SendSms', payload)
  }

  async sendBatchSms(templateCode: string, phoneNumbers: string[])

  async sendBatchSms(
    templateCode: string,
    phoneNumbers: string[],
    templateParams: SmsParams[]
  )

  async sendBatchSms(
    templateCode: string,
    phoneNumbers: string[],
    templateParams?: SmsParams[],
    options?: SendBatchSmsOptions
  ) {
    const { signName } = this.config
    const phones = JSON.stringify(phoneNumbers)
    const signNameList = JSON.stringify(
      _.fill(Array(phoneNumbers.length), signName)
    )
    const params = templateParams ? JSON.stringify(templateParams) : '[]'

    const payload = _.assign(
      {
        PhoneNumberJson: phones,
        SignNameJson: signNameList,
        TemplateCode: templateCode,
        TemplateParamJson: params,
      },
      options
    )

    return this.request('SendBatchSms', payload)
  }

  async request(action: RequestAction, params: SmsParams): Promise<void> {
    const { endpoint, accessKeyID, apiVersion } = this.config
    const nonce = cryptoRandomString({ length: 32 })
    const timestamp = new Date().toISOString()

    const payload: RequestOptions = _.assign<
      Record<string, string>,
      RequestBaseOptions
    >(params, {
      Signature: '',
      Action: action,
      AccessKeyId: accessKeyID,
      Format: 'JSON',
      RegionId: 'cn-hangzhou',
      SignatureVersion: '1.0',
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: nonce,
      Timestamp: timestamp,
      Version: apiVersion,
    })

    payload.Signature = this.sign(payload)

    let response: BaseResponse

    try {
      response = await got.get<BaseResponse>(endpoint, {
        searchParams: payload,
        responseType: 'json',
        resolveBodyOnly: true,
      })
    } catch (err) {
      if (err.response) {
        const { statusCode, body } = err.response
        const error = {
          statusCode,
          requestID: body.RequestId,
          message: body.Message,
          recommend: body.Recommend,
          hostID: body.HostId,
          code: body.Code,
        }

        throw error
      }

      throw err
    }

    if (response.Code !== 'OK') {
      const err = new Error(response.Message)

      err.name = response.Code

      throw err
    }
  }

  sign(data: Record<string, string>) {
    const { accessKeySecret } = this.config
    const keys = _.sortBy(
      _.filter(_.keys(data), (item: string): boolean => item !== 'Signature'),
      (item: string) => item
    )

    let params = ''

    _.forEach(keys, (item: string) => {
      const key = specialUrlEncode(item)
      const value = specialUrlEncode(data[key])

      if (params) {
        params += '&'
      }

      params += `${key}=${value}`
    })

    const str = `GET&${specialUrlEncode('/')}&${specialUrlEncode(params)}`

    const hmac = crypto.createHmac('sha1', `${accessKeySecret}&`)

    hmac.update(str)

    const signature = hmac.digest('base64')

    return signature
  }
}

export default function sms(
  accessKeyID: string,
  accessKeySecret: string,
  signName: string
): SmsService {
  return new SmsService(accessKeyID, accessKeySecret, signName)
}
