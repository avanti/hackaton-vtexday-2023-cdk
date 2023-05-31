import json
import boto3
from decimal import Decimal
import os
import requests

TABLE_NAME = os.environ["TABLE_NAME"]

ddbResource = boto3.resource("dynamodb")
ddbResourceTable = ddbResource.Table(TABLE_NAME)

# PaymentPOST
# Lambda called by API Gateway.
# Responsible for receiving new transactions from VTEX Gateway


def lambda_handler(event, context):
    # Ex 1
    # Example of how to get body from POST
    # event = json.loads(event['body'])

    # itemDict={
    #    'paymentId': event['paymentId'],
    #    'paymentMethod': event['paymentMethod'],
    #    'value': str(event['value']),
    #    'currency': event['currency'],
    #    'returnUrl': event['returnUrl'],
    #    'status': 'processing'
    # }

    # Ex 2
    # How to write data in Dynamodb

    # DynamoResponse = ddbResourceTable.put_item(
    #        Item=itemDict,
    #        ReturnValues='NONE',
    #        ReturnConsumedCapacity = 'TOTAL',
    #        ConditionExpression = 'attribute_not_exists(paymentId)',
    #    )

    # print(DynamoResponse)

    # Ex 3
    # How to read data in Dynamodb
    # getResponse = ddbResourceTable.get_item(
    #        Key={
    #            'paymentId': itemDict['paymentId']
    #        }

    # Ex 4
    # How to update data in Dynamodb
    # response = ddbResourceTable.update_item(
    #        Key={
    #            'paymentId': paymentId
    #        },
    #        UpdateExpression='SET #status = :status',
    #        ExpressionAttributeValues={
    #            ':status': status
    #        },
    #        ExpressionAttributeNames={
    #            '#status': 'status'
    #        }
    #    )

    # TO DO

    response = {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": "Hello Hackathon",
        "headers": {"content-type": "application/json"},
    }

    return response
