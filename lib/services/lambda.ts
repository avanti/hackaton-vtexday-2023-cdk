import { Duration } from "aws-cdk-lib"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs"
import { join } from "path"

export const createFunction = (scope: Construct, name: string, file: string, env?: { [key: string]: string }) =>
  new NodejsFunction(scope, name, {
    entry: join(__dirname, "../../backend/" + file),
    handler: "handler",
    timeout: Duration.seconds(30),
    environment: {
      API_URL: "https://payment.com/api/v1",
      ...env
    }
  })
