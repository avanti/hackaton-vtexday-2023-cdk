import { App, Duration } from "aws-cdk-lib"
import { Queue, QueueEncryption } from "aws-cdk-lib/aws-sqs"

export const createPendingPaymentQueue = (app: any) =>
  new Queue(app, "PendingPaymentQueue", {
    queueName: "PendingPaymentQueue",
    visibilityTimeout: Duration.seconds(30),
    receiveMessageWaitTime: Duration.seconds(10),
    retentionPeriod: Duration.days(1),
    encryption: QueueEncryption.SQS_MANAGED
  })
