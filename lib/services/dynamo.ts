import { Table, AttributeType, StreamViewType } from "aws-cdk-lib/aws-dynamodb"
import { RemovalPolicy } from "aws-cdk-lib"
import { Construct } from "constructs"

export const createPaymentTable = (scope: Construct) =>
  new Table(scope, "PaymentTable", {
    partitionKey: { name: "paymentId", type: AttributeType.STRING },
    removalPolicy: RemovalPolicy.DESTROY,
    stream: StreamViewType.NEW_IMAGE,
    tableName: "PaymentTable"
  })
