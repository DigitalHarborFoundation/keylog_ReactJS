## Keystroke_Logging--FastAPI

This example fastAPI handles the post request from the front end and ingests the data into Azure Table Storage.

For authentication purposes, the fastAPI grabs the bearer token from the header part of the posted data, sends a call to the host API to validate the token. If the token is validated, the data will then be ingested to the table storage.

#### Python env

Install all the dependencies listed in the requirements.txt.

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root.

```bash
touch .env
```

Run the fastAPI app by setting the work directory to BackFastAPI and run the command: uvicorn keylogging:app

#### Docker containers and images

If you choose to use docker containers and images, run the following commands.

Create a `.env` file in the project root.

```bash
touch .env
```

```bash
docker-compose up
```

#### Set environment variables in the .env file

Define the env vars inside the `.env` file. In this example, set the following values:

```bash
MY_API="a_value"
CONN_STR="a_value"
TABLE_NAME="a_value"
```

`MY_API` stores the key of an API this FastAPI app calls for authentication. `CONN_STR`stores the connect string of the Azure table storage while `TABLE_NAME`represents the name of the table.
