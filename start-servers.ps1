# Get the directory where this script lives
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Relative paths from script location
$PythonServerDir = Join-Path $RootDir "TelemetrySite\server"
$ReactAppDir = Join-Path $RootDir "TelemetrySite\client"

# Start Python server
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", "cd '$PythonServerDir'; python ./server.py development"

# Start React server
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", "cd '$ReactAppDir'; npm start"