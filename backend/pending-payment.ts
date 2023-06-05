import { Handler } from "aws-lambda"
import { SQS } from "aws-sdk"

/* const API_URL: string = process.env.API_URL! */
const PENDING_PAYMENT_QUEUE = process.env.PENDING_PAYMENT_QUEUE!

type PendingLambdaEvent = LambdaEvent & {
  Records: Array<{ dynamodb: { NewImage: unknown } }>
}

const sqs = new SQS()

export const handler: Handler<PendingLambdaEvent, unknown> = async (event, _) => {
  const { Records } = event

  for (const record of Records) {
    const dynamodb = record.dynamodb
    if (!dynamodb) continue

    console.log({
      route: "Pending Payment",
      PENDING_PAYMENT_QUEUE,
      body: dynamodb.NewImage
    })

    const queue = await sqs.getQueueUrl({ QueueName: PENDING_PAYMENT_QUEUE }).promise()
    if (!queue.QueueUrl) throw new Error("QueueUrl not found.")

    const response = await sqs
      .sendMessage({
        QueueUrl: queue.QueueUrl,
        MessageBody: JSON.stringify(dynamodb.NewImage)
      })
      .promise()

    console.log({ message: "Message sent to SQS queue", response })
  }
}
