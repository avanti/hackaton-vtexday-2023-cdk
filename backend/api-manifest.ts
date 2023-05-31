export async function handler(event: LambdaEvent, context: LambdaContext): Promise<LambdaResult> {
  console.log(`${context.functionName} - ${event.requestContext.http.method} ${event.rawPath}`)
  return { statusCode: 200, body: JSON.stringify(event, null, 2) }
}
