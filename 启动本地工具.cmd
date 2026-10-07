@echo off
cd /d "%~dp0"
set "NODE_OPTIONS=--require=%~dp0local-runtime.cjs"
"C:\Users\yi-songjing\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts/run-framework.mjs dev
