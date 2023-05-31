#!/usr/bin/env node
import "source-map-support/register"

// CDK Types & Enums
import { StartingPosition, FilterCriteria, FilterRule } from "aws-cdk-lib/aws-lambda"
import { RestApi, Cors, LambdaIntegration } from "aws-cdk-lib/aws-apigateway"
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources"
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources"
import { App } from "aws-cdk-lib"

// AWS Services abstraction
import { createPendingPaymentQueue } from "./services/sqs"
import { createPaymentTable } from "./services/dynamo"
import { createFunction } from "./services/lambda"

// Create the main CDK App
const app = new App()

// Create the Dynamo and SQS services
const PaymentTable = createPaymentTable(app)
const PendingPaymentQueue = createPendingPaymentQueue(app)

/**
 * ? Rest API
 */

// Create Lambda functions
const Manifest = createFunction(app, "Manifest", "api-manifest.ts")
const CreatePayment = createFunction(app, "CreatePayment", "create-payment.ts", {
  TABLE_NAME: PaymentTable.tableName
})

// Create Rest API on API Gateway
const PaymentApi = new RestApi(app, "PaymentApi", {
  restApiName: "PaymentApi",
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS
  }
})

// Create Resources
const ManifestResource = PaymentApi.root.addResource("manifest")
const PaymentApiResource = PaymentApi.root.addResource("payment")

// Create Lambda Proxy Integration
const ManifestIntegration = new LambdaIntegration(Manifest, { proxy: true })
const PaymentApiIntegration = new LambdaIntegration(CreatePayment, { proxy: true })

// Add Lambda Proxy Integration to API Resource
ManifestResource.addMethod("GET", ManifestIntegration)
PaymentApiResource.addMethod("POST", PaymentApiIntegration)

/**
 * ? Pending Payment Stream
 */

// Create PendingPayment Lambda function
const PendingPayment = createFunction(app, "PendingPayment", "pending-payment.ts", {
  PENDING_PAYMENT_QUEUE: PendingPaymentQueue.queueName,
  TABLE_NAME: PaymentTable.tableName
})

// Send events from PaymentTable to PendingPaymentQueue on INSERT or MODIFY
PendingPayment.addEventSource(
  new DynamoEventSource(PaymentTable, {
    startingPosition: StartingPosition.TRIM_HORIZON,
    retryAttempts: 10,
    batchSize: 1,
    filters: [
      FilterCriteria.filter({
        eventName: FilterRule.isEqual("INSERT"),
        dynamodb: {
          NewImage: {
            status: { S: FilterRule.isEqual("undefined") }
          }
        }
      }),
      FilterCriteria.filter({
        eventName: FilterRule.isEqual("MODIFY"),
        dynamodb: {
          NewImage: {
            status: { S: FilterRule.isEqual("undefined") }
          }
        }
      })
    ]
  })
)

/**
 * ? Process Pending Payment
 */

// Create ProcessPayment Lambda function
const ProcessPayment = createFunction(app, "ProcessPayment", "process-payment.ts", {
  PENDING_PAYMENT_QUEUE: PendingPaymentQueue.queueName
})

// Receive messages from PendingPaymentQueue on new messages
ProcessPayment.addEventSource(
  new SqsEventSource(PendingPaymentQueue, {
    reportBatchItemFailures: true,
    batchSize: 1
  })
)

/**
 * ? PERMISSIONS
 */

// Stream on DynamoDB
PaymentTable.grantStreamRead(PendingPayment)

// Read/Write on DynamoDB
PaymentTable.grantReadWriteData(CreatePayment)
PaymentTable.grantReadWriteData(PendingPayment)
PaymentTable.grantReadWriteData(ProcessPayment)

// Send on SQS
PendingPaymentQueue.grantSendMessages(PendingPayment)

// Consume on SQS
PendingPaymentQueue.grantConsumeMessages(ProcessPayment)
