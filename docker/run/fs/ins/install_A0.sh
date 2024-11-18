#!/bin/bash

BRANCH="development"

git clone -b "$BRANCH" "https://github.com/fluxframeworks/agent-flux" "/a0"

# Create and activate Python virtual environment
python3 -m venv /opt/venv
source /opt/venv/bin/activate

# Ensure the virtual environment and pip setup
pip install --upgrade pip ipython requests

# Install A0 python packages
pip install -r /a0/requirements.txt

# Preload A0
python /a0/preload.py
