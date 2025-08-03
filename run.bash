#!/bin/bash
set -e
echo "launching server..."
node server.js &
echo "launching client A..."
open http://127.0.0.1:7040/client.html &
echo "launching client B..."
open http://127.0.0.1:7040/client.html &
echo "waiting for all processes to finish..."
wait
echo "Done."