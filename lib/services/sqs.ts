import { Queue, QueueEncryption } from "aws-cdk-lib/aws-sqs"
import { Construct } from "constructs"
import { Duration } from "aws-cdk-lib"

export const createPendingPaymentQueue = (scope: Construct) =>
  new Queue(scope, "PendingPaymentQueue", {
    queueName: "PendingPaymentQueue",
    visibilityTimeout: Duration.seconds(30),
    receiveMessageWaitTime: Duration.seconds(10),
    retentionPeriod: Duration.days(1),
    encryption: QueueEncryption.SQS_MANAGED
  })
