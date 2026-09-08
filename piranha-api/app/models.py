from enum import Enum
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class Protocol(str, Enum):
    STOOL="stool"
    ENVIRONMENTAL="environmental"
    ISOLATE="isolate"

class Orientation(str, Enum):
    VERTICAL="vertical"
    HORIZONTAL="horizontal"

class Language(str, Enum):
    ENGLISH="English"
    FRENCH="French"

class PiranhaRunOptions(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, # Accept camel case in incoming payloads
        populate_by_name=True  # Accept population by Python names too, for testing
    )
    run_name: str
    notes: str
    threads: int
    protocol: Protocol
    positive_control: str
    negative_control: str
    orientation: Orientation
    output_prefix: str
    all_metadata_to_header: bool
    user_name: str
    institute: str
    lang: Language



