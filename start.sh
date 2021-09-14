#!/bin/bash

server/server &
client/client &&

kill $!