// CDK Types & Enums
import { StartingPosition, FilterCriteria, FilterRule } from "aws-cdk-lib/aws-lambda"
import { RestApi, Cors, LambdaIntegration } from "aws-cdk-lib/aws-apigateway"
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources"
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources"
import { Stack, type StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"

// AWS Services abstraction
import { createPendingPaymentQueue } from "./services/sqs"
import { createPaymentTable } from "./services/dynamo"
import { createFunction } from "./services/lambda"
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam"

export class ConnectorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const PaymentTable = createPaymentTable(this)
    const PendingPaymentQueue = createPendingPaymentQueue(this)

    /**
     * ? Rest API
     */

    // Create Lambda functions
    const Manifest = createFunction(this, "Manifest", "api-manifest.ts")
    const CreatePayment = createFunction(this, "CreatePayment", "create-payment.ts", {
      TABLE_NAME: PaymentTable.tableName
    })
    const ConfirmPayment = createFunction(this, "ConfirmPayment", "confirm-payment.ts", {
      TABLE_NAME: PaymentTable.tableName
    })

    // Create Rest API on API Gateway
    const PaymentApi = new RestApi(this, "PaymentApi", {
      restApiName: "PaymentApi",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS
      }
    })

    // Create Resources
    const ManifestResource = PaymentApi.root.addResource("manifest")
    const PaymentApiResource = PaymentApi.root.addResource("payments")
    const ConfirmPaymentResource = PaymentApi.root.addResource("confirm")

    // Create Lambda Proxy Integration
    const ManifestIntegration = new LambdaIntegration(Manifest, { proxy: true })
    const PaymentApiIntegration = new LambdaIntegration(CreatePayment, { proxy: true })
    const ConfirmPaymentIntegration = new LambdaIntegration(ConfirmPayment, { proxy: true })

    // Add Lambda Proxy Integration to API Resource
    ManifestResource.addMethod("GET", ManifestIntegration)
    PaymentApiResource.addMethod("POST", PaymentApiIntegration)
    ConfirmPaymentResource.addMethod("GET", ConfirmPaymentIntegration)

    /**
     * ? Pending Payment Stream
     */

    // Create PendingPayment Lambda function
    const PendingPayment = createFunction(this, "PendingPayment", "pending-payment.ts", {
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
    const ProcessPayment = createFunction(this, "ProcessPayment", "process-payment.ts", {
      PENDING_PAYMENT_QUEUE: PendingPaymentQueue.queueName
    })

    ProcessPayment.addToRolePolicy(
      new PolicyStatement({
        actions: ["ses:SendEmail", "SES:SendRawEmail"],
        resources: ["*"],
        effect: Effect.ALLOW
      })
    )

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
    PaymentTable.grantReadWriteData(ConfirmPayment)
    PaymentTable.grantReadWriteData(PendingPayment)
    PaymentTable.grantReadWriteData(ProcessPayment)

    // Send on SQS
    PendingPaymentQueue.grantSendMessages(PendingPayment)

    // Consume on SQS
    PendingPaymentQueue.grantConsumeMessages(ProcessPayment)
  }
}
