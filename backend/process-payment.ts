import axios from "axios"
import { Handler } from "aws-lambda"
import { SQSEvent } from "./types/sqs-event"
import { SQS } from "aws-sdk"

import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses"

/* const API_URL: string = process.env.API_URL! */
const PENDING_PAYMENT_QUEUE = process.env.PENDING_PAYMENT_QUEUE!

type ProcessLambdaEvent = LambdaEvent & {
  Records: {
    receiptHandle: string
    body: string
  }[]
}

const sqs = new SQS()
const ses = new SESClient({ region: "us-east-1" })
export const handler: Handler<ProcessLambdaEvent, LambdaResult> = async (event, _) => {
  console.log({ route: "Process Payment", event: event.Records[0] })

  const {
    secureProxyUrl,
    totalCartValue: { N: value },
    recipients: { L: recipients },
    miniCart: {
      M: {
        billingAddress: { M: address },
        buyer: { M: buyer }
      }
    },
    card: { M: card }
  } = JSON.parse(event.Records[0].body) as SQSEvent

  console.log({ route: "Process Payment", value })

  const body = JSON.stringify({
    customer: {
      type: buyer.documentType.S === "cpf" ? "individual" : "corporation",
      name: buyer.firstName.S + " " + buyer.lastName.S,
      email: buyer.email.S,
      document: buyer.document.S,
      document_type: buyer.documentType.S.toLocaleUpperCase(),
      phones: {
        mobile_phone: {
          country_code: buyer.phone.S.substring(1, 3),
          area_code: buyer.phone.S.substring(3, 5),
          number: buyer.phone.S.substring(5)
        }
      }
    },
    items: [{ amount: Number(`${value}00`), description: "Valor da transação.", quantity: 1, code: "1" }],
    payments: [
      {
        payment_method: "credit_card",
        credit_card: {
          operation_type: "auth_only",
          installments: 1,
          card: {
            billing_address: {
              line_1: address.neighborhood.S,
              zip_code: address.postalCode.S,
              city: address.city.S,
              state: address.state.S,
              country: address.country.S.substring(0, 2)
            },
            number: card.numberToken.S,
            holder_name: buyer.firstName.S + " " + buyer.lastName.S,
            holder_document: buyer.document.S,
            exp_month: Number(card.expiration.M.month.S),
            exp_year: Number(card.expiration.M.year.S),
            cvv: card.cscToken.S
          }
        },
        split: recipients.map(recipient => ({
          recipient_id: recipient.M.id.S === "vtexdayhackathon3" ? "re_clikcd0b30uid019t3ypqd7bw" : recipient.M.id.S,
          amount: Number(`${recipient.M.amount?.N}00` || "0"),
          type: "flat",
          options: {
            charge_processing_fee: true,
            charge_remainder_fee: recipient.M.id.S === "vtexdayhackathon3" ? true : false,
            liable: true
          }
        }))
      }
    ]
  })

  console.log(JSON.stringify({ route: "Process Payment", body }))

  const response = await axios.post(secureProxyUrl.S, body, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-PROVIDER-Forward-Authorization": "Basic c2tfdGVzdF9rWU05ZTVKZjNhVVJsOThROg==",
      "X-PROVIDER-Forward-To": "https://api.pagar.me/core/v5/orders"
    }
  })

  if (response.status !== 200)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing payment.", data: JSON.stringify(response.data) })
    }

  const queue = await sqs.getQueueUrl({ QueueName: PENDING_PAYMENT_QUEUE }).promise()
  if (!queue.QueueUrl) throw new Error("QueueUrl not found.")

  await sqs
    .deleteMessage({
      QueueUrl: queue.QueueUrl,
      ReceiptHandle: event.Records[0].receiptHandle
    })
    .promise()

  const email = composeEmail(
    buyer.email.S,
    "Seu pagamento foi processado com sucesso!",
    JSON.parse(response.data).charges.data[0].id
  )
  const sendEmailCommand = new SendEmailCommand(email)
  console.log("SES Email", await ses.send(sendEmailCommand))

  console.log({ route: "Process Payment", response, data: JSON.stringify(response.data) })
  return { statusCode: 200, body: JSON.stringify(event, null, 2) }
}

function composeEmail(email: string, message: string, id: string): SendEmailCommandInput {
  const subject = `Conclua sua compra! - Avanti Provider`
  const htmlMsg = `
    <div>
      ${message}
      <a href="https://fjzqmq2b38.execute-api.us-east-1.amazonaws.com/prod/confirm?id=${id}">Concluir compra!</a>
    </div>
  `

  return {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: { Charset: "UTF-8", Data: htmlMsg }
      },
      Subject: { Charset: "UTF-8", Data: subject }
    },
    Source: "rafael.camargo@penseavanti.com.br",
    ReplyToAddresses: ["rafael.camargo@penseavanti.com.br"]
  }
}
