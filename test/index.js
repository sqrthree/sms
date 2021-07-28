const SmsService = require('../dist/index').default
const test = require('ava')

const sms = new SmsService('id', 'key', 'sign name', {
  mock: true,
})

test('should send sms with phone', async (t) => {
  const result = await sms.sendSms('code', '12345678910')

  t.is(result, undefined)
})

test('should send sms with phone list', async (t) => {
  const result = await sms.sendSms('code', ['12345678910'])

  t.is(result, undefined)
})

test('should send sms with payload', async (t) => {
  const result = await sms.sendSms('code', '12345678910', {
    a: 1,
  })

  t.is(result, undefined)
})

test('should send sms with extra options', async (t) => {
  const result = await sms.sendSms(
    'code',
    '12345678910',
    {},
    { SignName: 'special sign name' }
  )

  t.is(result, undefined)
})

test('should send batch sms', async (t) => {
  const result = await sms.sendBatchSms('code', ['12345678910'])

  t.is(result, undefined)
})

test('should send batch sms with payload', async (t) => {
  const result = await sms.sendBatchSms('code', ['12345678910'], {
    a: 1,
  })

  t.is(result, undefined)
})

test('should send batch sms with extra options', async (t) => {
  const result = await sms.sendBatchSms(
    'code',
    ['12345678910'],
    {},
    { SignName: 'special sign name' }
  )

  t.is(result, undefined)
})

test('should return the signature', (t) => {
  const signature = sms.sign({ a: 1 })

  t.is(signature, '8AMppRLhjRNZ+RYr+i49hwak8P4=')
})
