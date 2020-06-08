#!/bin/bash
set -e;

display=$(yabai -m query --displays --display | jq -r -c '.uuid')

echo "Focusing space $1 on display $display"
yabai -m space --focus "d:${display}:${1}"
