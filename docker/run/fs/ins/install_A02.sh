#!/bin/bash

# cachebuster script, this helps speed up docker builds
rm -rf /git/agent-flux

# run the original install script again
bash /ins/install_A0.sh "$@"

# remove python packages cache
. "/ins/setup_venv.sh" "$@"
pip cache purge