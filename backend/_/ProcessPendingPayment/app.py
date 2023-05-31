import json
import boto3
import requests
import os

API_URL = os.environ["API_URL"]


# Process Pending Payment
# Lambda triggered by new item in SQS.
# Responsible for processing pending payment with adquirencies.
def lambda_handler(event, context):
    # Ex 1
    # Read SQS message from event
    # body = json.loads(event['Records'][0]['body'])

    # Ex 2
    # Make an API Call
    # apiResponse = requests.get(API_URL, params={"paymentId": paymentId})

    # TO DO

    response = {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": "Hello Hackathon",
    }

    return response
