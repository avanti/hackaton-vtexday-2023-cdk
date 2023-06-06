import { Handler } from "aws-lambda"
import { DynamoDB } from "aws-sdk"
import axios from "axios"

const dynamo = new DynamoDB.DocumentClient()

/* const API_URL: string = process.env.API_URL! */
const TABLE_NAME: string = process.env.TABLE_NAME!

/* const API_URL: string = process.env.API_URL! */
export const handler: Handler<any, LambdaResult> = async (event, _) => {
  console.log({ route: "API Manifest", oid: JSON.stringify(event) })

  const response = await axios.get(
    `https://api.pagar.me/core/v5/charges/${event["queryStringParameters"]["id"]}/capture`,
    {
      headers: {
        Authorization: "Basic c2tfdGVzdF9rWU05ZTVKZjNhVVJsOThROg=="
      }
    }
  )

  console.log(response)

  const dynamoResponse = await dynamo
    .get({
      TableName: TABLE_NAME,
      Key: {
        paymentId: event["queryStringParameters"]["id"]
      }
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

  console.log({ route: "API Manifest", dynamoResponse })

  return {
    statusCode: 302,
    headers: {
      Location: "https://vtexdayhackathon3.myvtex.com/"
    }
  }
}
