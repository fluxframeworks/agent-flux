import os
import re
from .files import get_abs_path
from dotenv import load_dotenv as _load_dotenv

KEY_AUTH_LOGIN = "AUTH_LOGIN"
KEY_AUTH_PASSWORD = "AUTH_PASSWORD"

def load_dotenv():
    _load_dotenv(get_dotenv_file_path(), override=True)


def get_dotenv_file_path():
    return get_abs_path(".env")

def get_dotenv_value(key: str):
    # load_dotenv()
    return os.getenv(key)

def save_dotenv_value(key: str, value: str):
    dotenv_path = get_dotenv_file_path()
    if not os.path.isfile(dotenv_path):
        with open(dotenv_path, "w") as f:
            f.write("")
    with open(dotenv_path, "r+") as f:
        lines = f.readlines()
        found = False
        for i, line in enumerate(lines):
            if re.match(rf"^\s*{key}\s*=", line):
                if value == "":
                    del lines[i]
                else:
                    lines[i] = f"{key}={value}\n"
                found = True
        if not found and value != "":
            lines.append(f"\n{key}={value}")
        f.seek(0)
        f.writelines(lines)
        f.truncate()
    load_dotenv()
