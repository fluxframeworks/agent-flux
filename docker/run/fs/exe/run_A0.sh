#!/bin/bash

# Paths
SOURCE_DIR="/git/agent-flux"
TARGET_DIR="/a0"


function setup_venv() {
    # Create virtual environment if it doesn't exist
    if [ ! -d /opt/venv ]; then
        echo "Creating virtual environment..."
        python3 -m venv /opt/venv
        /opt/venv/bin/pip install ipython requests
    fi

    # Activate the virtual environment
    source /opt/venv/bin/activate
}

# preload A0
setup_venv
python /a0/preload.py

# Loop to restart the Python script when it finishes
while true; do

    setup_venv

    # Copy repository files if run_ui.py is missing in /a0 (if the volume is mounted)
    if [ ! -f "$TARGET_DIR/run_ui.py" ]; then
        echo "Copying files from $SOURCE_DIR to $TARGET_DIR..."
        cp -rn --no-preserve=ownership,mode "$SOURCE_DIR/." "$TARGET_DIR"
    fi

    echo "Starting A0..."
    python /a0/run_ui.py \
        --port=80 \
        --host="0.0.0.0" \
        --code_exec_docker_enabled=false \
        --code_exec_ssh_enabled=true \
        --code_exec_ssh_addr="localhost" \
        --code_exec_ssh_port=22 \
        --code_exec_ssh_user="root" \
        --code_exec_ssh_pass="toor"
    
    # Check the exit status
    if [ $? -ne 0 ]; then
        echo "A0 script exited with an error. Restarting..."
    else
        echo "A0 script finished. Restarting..."
    fi

    # Optional: Add a small delay if needed to avoid rapid restarts
    sleep 1
done
