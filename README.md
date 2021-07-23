# sms

Ali Cloud sms api for Node.js

## Install

```bash
npm install @sqrtthree/sms
```

## Usage

```ts
import smsService from '@sqrtthree/sms'

const sms = smsService('id', 'key', 'sign name')

sms.sendSms(templateCode: string, phoneNumbers: string | string[], templateParams?: Record<string, string | number>, options?: Record<string, string>)

sms.sendBatchSms(templateCode: string, phoneNumbers: string[], templateParams?: Record<string, string | number>[], options?: Record<string, string>)
```

See [help.aliyun.com/document_detail/102715.html](https://help.aliyun.com/document_detail/102715.html) to get more details.

---

> [sqrtthree.com](https://sqrtthree.com/) &nbsp;&middot;&nbsp;
> GitHub [@sqrthree](https://github.com/sqrthree) &nbsp;&middot;&nbsp;
> Twitter [@sqrtthree](https://twitter.com/sqrtthree)
