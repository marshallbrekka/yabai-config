#!/bin/bash
set -e;

display=$(yabai -m query --displays --display | jq -c '.index')

echo "Focusing space $1 on display $display"
yabai -m space --focus "display-${display}_space-${1}"
