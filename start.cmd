@echo off
start /min server\server.exe
client\client.exe
taskkill /IM server.exe
exit