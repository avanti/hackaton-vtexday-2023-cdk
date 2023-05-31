import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda"
import { App } from "aws-cdk-lib"
import { join } from "path"

export const createFunction = (app: any, name: string, file: string, env?: { [key: string]: string }) =>
  new Function(app, name, {
    handler: "index.handler",
    runtime: Runtime.NODEJS_18_X,
    code: Code.fromAsset(join(__dirname, "../../backend/" + file)),
    environment: {
      API_URL: "https://payment.com/api/v1",
      ...env
    }
  })
