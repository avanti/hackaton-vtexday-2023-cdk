import { Handler } from "aws-lambda"

import { DynamoDB } from "aws-sdk"
import { AuthorizationRequest } from "./types"
import { ID } from "./utils"
const dynamo = new DynamoDB.DocumentClient()

/* const API_URL: string = process.env.API_URL! */
const TABLE_NAME: string = process.env.TABLE_NAME!

export const handler: Handler<LambdaEvent, LambdaResult> = async (event, _) => {
  console.log({ route: "Create Payment", body: event.body })

  if (!event.body) throw new Error("No body was provided.")
  const body = JSON.parse(event.body) as AuthorizationRequest

  const dynamoResponse = await dynamo
    .put({
      ReturnValues: "NONE",
      TableName: TABLE_NAME,
      ReturnConsumedCapacity: "TOTAL",
      Item: { ...body, status: "undefined" },
      ConditionExpression: "attribute_not_exists(paymentId)"
    })
    .promise()

  if (dynamoResponse.$response.httpResponse.statusCode >= 400)
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Erro ao criar pagamento.",
        status: "denied",
        code: "400"
      })
    }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Pagamento pendente",
      paymentId: body.paymentId,
      code: "200",

      // Arbitrary data
      authorizationId: "AUT-" + ID(),
      nsu: "NSU-" + ID(),
      tid: "TID-" + ID(),

      // Fixed data
      acquirer: "Pagar.me",
      status: "undefined"
    })
  }
}
