import argparse
from typing import Any, Callable, Coroutine
from python.helpers import rfc, docker

parser = argparse.ArgumentParser()
args = {}
dockerman = None


def initialize():
    global args
    parser.add_argument("--port", type=int, default=None, help="Web UI port")
    parser.add_argument("--host", type=str, default=None, help="Web UI host")
    parser.add_argument(
        "--cloudflare_tunnel",
        type=bool,
        default=False,
        help="Use cloudflare tunnel for public URL",
    )
    parser.add_argument(
        "--development", type=bool, default=False, help="Development mode"
    )

    known, unknown = parser.parse_known_args()
    args = vars(known)
    for arg in unknown:
        if "=" in arg:
            key, value = arg.split("=", 1)
            key = key.lstrip("-")
            args[key] = value


def get_arg(name: str):
    global args
    return args.get(name, None)


def is_development() -> bool:
    return get_arg("development") == True


async def call_development_function(func: Callable, *args, **kwargs):
    if is_development():
        url = _get_rfc_url()
        return await rfc.call_rfc(
            url=url,
            module=func.__module__,
            function_name=func.__name__,
            args=list(args),
            kwargs=kwargs,
        )
    else:
        return await func(*args, **kwargs)


def _get_rfc_url() -> str:
    if get_arg("rfc_url"):
        return str(get_arg("rfc_url"))
    global dockerman
    if dockerman is None:
        dockerman = docker.DockerContainerManager(
            image="agent-flux-run",
            name="agent-flux-development",
            ports={"55080": 80, "55022": 22},
            volumes={},
            logger=None,
        )
    conts = dockerman.get_image_containers()
    return f"http://localhost:{conts[0]['web_port']}/rfc"
