import { Handler } from "aws-lambda"

/* const API_URL: string = process.env.API_URL! */

type ProcessLambdaEvent = LambdaEvent & {
  Records: Array<{ body: string }>
}

export const handler: Handler<ProcessLambdaEvent, LambdaResult> = async (event, _) => {
  console.log({ route: "Process Payment", event: event.Records })
  const { Records } = event

  Records.forEach(async record => {
    const body = JSON.parse(record.body)
    console.log({
      route: "Process Payment",
      value: JSON.stringify(body.value.N)
    })
  })

  return { statusCode: 200, body: JSON.stringify(event, null, 2) }
}
