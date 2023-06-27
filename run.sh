#!/bin/bash

# Activate the virtual environment
source ./services/venv/bin/activate

# Run the main.py Python script
python ./services/main.py

# Deactivate the virtual environment
deactivate
