#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit

cd backend

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations for Django auth database
python manage.py migrate --noinput
