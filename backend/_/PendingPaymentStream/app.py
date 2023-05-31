import json
import boto3
from decimal import Decimal
import os

sqs = boto3.resource("sqs")


# Pending Payment Stream
# Lambda triggered by DynamoDB stream (INSERT and MODIFY).
# Responsible for retrieving new records from DynamoDB streams and writing on SQS
def lambda_handler(event, context):
    print(event)

    # Ex 1
    # Read DynamoDB stream events
    # for record in event['Records']:
    ## Get the DynamoDB stream record
    # dynamodb_record = record['dynamodb']
    ## Get the new image
    # new_image = dynamodb_record['NewImage']

    # Ex 2
    # How to get Queue and Write item to SQS queue
    # queue = sqs.get_queue_by_name(QueueName=os.environ['PENDING_PAYMENT_QUEUE'])
    # response = queue.send_message(MessageBody=json.dumps({}))

    # Ex 3
    # How to get Queue and Delete item in SQS queue
    # queue = sqs.get_queue_by_name(QueueName=os.environ['PENDING_PAYMENT_QUEUE'])
    # response = queue.delete_messages(Entries=[
    #     {
    #         'Id': id,
    #         'ReceiptHandle': receiptHandle
    #     }
    # ])

    # TO DO

    response = {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": "Hello Hackathon",
    }

    return response
