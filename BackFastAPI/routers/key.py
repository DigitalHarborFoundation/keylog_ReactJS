from fastapi import APIRouter, HTTPException, Header
from schemas import KeyBase
from azure.data.tables import TableServiceClient
from azure.core.exceptions import ResourceExistsError
import httpx
import os
import dotenv

# load the .env file
assert dotenv.load_dotenv(".env")

router = APIRouter()

# Get the environment variables. Make sure you set the variables in the .env file according to the instructions in README.md 
my_api_host = os.getenv("MY_API", "")
conn_str = os.getenv("CONN_STR", "")
table_name = os.getenv("TABLE_NAME", "")

URL_root = f'https://{my_api_host}/v3/tokens/access?refreshToken='


async def validate_token(token: str):
    Token_Validation_URL = URL_root + token
    async with httpx.AsyncClient() as client:
        response = await client.get(Token_Validation_URL)
        if response.status_code == 200:
            return True
        else:
            return False


# Handle Post requests: get the data and insert it to database. This example uses Azure Table Storage
@router.post('/')
async def create_key(data: KeyBase, authorization: str = Header(None)):

    # Check whether the header is missing or not
    if not authorization:
        raise HTTPException(
            status_code=401, detail="Authorization header missing")

    # Extract the Bearer token
    authorization = authorization.strip()
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Invalid Authorization header format")
    token = authorization[len("Bearer "):]
    validated = await validate_token(token)

    if validated:
        try:
            # Initialize the TableServiceClient
            service_client = TableServiceClient.from_connection_string(
                conn_str)
            table_client = service_client.get_table_client(table_name)
        # a for loop to insert data entity by entity
            for i in range(len(data.EventID.split(","))):
                entity = {
                    "PartitionKey": data.PartitionKey,
                    "RowKey": data.RowKey.split(",")[i],
                    "EventID": data.EventID.split(",")[i],
                    "EventTime": data.EventTime.split(",")[i],
                    "Output": data.Output.split("<=@=>")[i],
                    "CursorPosition": data.CursorPosition.split(",")[i],
                    "TextChange": data.TextChange.split("<=@=>")[i],
                    "Activity": data.Activity.split("<=@=>")[i]
                }
                table_client.create_entity(entity)

        except ResourceExistsError as rex:
            raise HTTPException(
                status_code=400, detail="Resource already exists")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(
            status_code=401, detail="Authorization failed!")
