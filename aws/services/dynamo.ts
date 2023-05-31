import { Table, AttributeType, StreamViewType } from "aws-cdk-lib/aws-dynamodb"
import { App, RemovalPolicy } from "aws-cdk-lib"

export const createPaymentTable = (app: any) =>
  new Table(app, "PaymentTable", {
    partitionKey: {
      name: "paymentId",
      type: AttributeType.STRING
    },
    tableName: "PaymentTable",
    stream: StreamViewType.NEW_IMAGE,
    removalPolicy: RemovalPolicy.DESTROY
  })
