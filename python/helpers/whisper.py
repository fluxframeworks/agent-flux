# Import the necessary libraries
import base64
import warnings
import whisper
import tempfile
from python.helpers import runtime, rfc, settings

# suppress FutureWarning from torch.load
warnings.filterwarnings('ignore', category=FutureWarning)

model = None
model_name = ""

def preload():
    global model, model_name
    set = settings.get_settings()
    if not model or model_name != set["stt_model_size"]:
        model = whisper.load_model(set["stt_model_size"])
        model_name = set["stt_model_size"]
    return model

async def transcribe(audio_bytes_b64: str):
    return await runtime.call_development_function(_transcribe, audio_bytes_b64)

def _transcribe(audio_bytes_b64: str):
    global model
    if model is None:
        model = preload()

    # Decode audio bytes if encoded as a base64 string
    audio_bytes = base64.b64decode(audio_bytes_b64)

    #create temp audio file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as audio_file:
        audio_file.write(audio_bytes)

    # Transcribe the audio file
    result = model.transcribe(audio_file.name, fp16=False )
    return result
