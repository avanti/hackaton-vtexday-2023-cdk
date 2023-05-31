import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from "aws-lambda"

declare global {
  type LambdaContext = Context
  type LambdaEvent = APIGatewayProxyEventV2
  type LambdaResult = APIGatewayProxyStructuredResultV2
}
