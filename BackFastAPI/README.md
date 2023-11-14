## Keystroke_Logging_OpenSource--FastAPI

The fastAPI handles the post request from the front end and ingests the data into Azure Table Storage.
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

#### Docker images and containers

Create a `.env` file in the project root.

```bash
touch .env
```

Define the `Eedi_API` env var inside the `.env` file

```bash
docker-compose up
```
