#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations for Django auth database (if needed)
python manage.py migrate --noinput
