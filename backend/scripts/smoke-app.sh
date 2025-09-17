#!/usr/bin/env bash
# smoke-app.sh - prints a timestamp once per second
while true; do
  echo "hello $(date)"
  sleep 1
done
