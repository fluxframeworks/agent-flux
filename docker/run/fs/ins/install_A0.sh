#!/bin/bash

# branch from parameter
if [ -z "$1" ]; then
    echo "Error: Branch parameter is empty. Please provide a valid branch name."
    exit 1
fi
BRANCH="$1"

# clone project repo branch
git clone -b "$BRANCH" "https://github.com/fluxframeworks/agent-flux" "/git/agent-flux"

# setup python environment
. "/ins/setup_venv.sh" "$@"

# Preload A0
python /git/agent-flux/preload.py --dockerized=true