from pydantic import BaseModel

class KeyBase(BaseModel):
    PartitionKey:str
    RowKey:str
    EventID: str
    EventTime: str
    Output: str
    CursorPosition: str
    TextChange: str
    Activity: str
