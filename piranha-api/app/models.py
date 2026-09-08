from pydantic import BaseModel

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
    run_name: str
    model_config = ConfigDict(
        alias_generator=to_camel, # Accept camel case in incoming payloads
        populate_by_name=True  # Accept population by Python names too, for testing
    )
    notes: str
    threads: int
    protocol: Protocol
    positive_control: str
    negative_control: str
    orientation: Orientation
    outputPrefix: str
    all_metadata_to_header: bool
    user_name: str,
    institute: str,
    lang: Language



