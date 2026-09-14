#!/bin/bash

# This is a bash version of start-servers.ps1, it isnt as nice because theirs no "good" way to 
# universally open up terminal sessions, so logs are mixed and you cannot restart the python
# server at-will on the terminal that ran this. Although you should be able to theoretically
# restart the python terminal in a second terminal via the usage of one of these two commands:
# 1) python ./TelemetrySite/server/server.py development
# 2) python3 ./TelemetrySite/server/server.py development
# - Owen Graffunder

# Get the directory where this script lives
RootDir="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Relative paths from script location
PythonServerDir="$RootDir/TelemetrySite/server"
ReactAppDir="$RootDir/TelemetrySite/client"

# Setting a 'trap' to allow for shutdown via ctrl+c
trap "kill 0" EXIT

# Start Python server
export PYTHONPATH="${PYTHONPATH}:$PythonServerDir"
cd $PythonServerDir

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # "python" is used on windows
    python ./server.py development &
else
    # while "python3" is used on everything else.
    python3 ./server.py development &
fi

# Start React server
cd $ReactAppDir
npm start &

# Dont end the script until both servers are closed
wait