#!/bin/bash
set -e;

display=$(yabai -m query --displays --display | jq -c '.index')

echo "moving window to space $1 on display $display"
yabai -m window --space "display-${display}_space-${1}"
