import { Handler } from "aws-lambda"

/* const API_URL: string = process.env.API_URL! */
export const handler: Handler<LambdaEvent, LambdaResult> = async () => {
  const paymentMethods = [{ name: "Visa", allowsSplit: "onAuthorize" }]
  console.log({ route: "API Manifest", paymentMethods })

  return {
    statusCode: 200,
    body: JSON.stringify({
      paymentMethods
    })
  }
}
