import { Kafka, logLevel } from 'kafkajs'

import env from '../../config/enviroment_config'
import logger from '../../config/logger'

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  clientId: env.app.name,
  brokers: [`${env.broker.host}:${env.broker.port}`],
})
const consumer = kafka.consumer({ groupId: env.app.name })
const topicList = ['health']

const run = async () => {
  await consumer.connect()
  const promiseList = topicList.map((tpc) => {
    return consumer.subscribe({ topic: tpc, fromBeginning: true })
  })
  await Promise.all(promiseList)
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
      logger.info(`- ${prefix} ${message.key}#${message.value}`)
    },
  })
}

run().catch((e) => logger.error(`[${env.app.name}/consumer] ${e.message}`, e))
