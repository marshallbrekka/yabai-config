#!/bin/bash

event=$1
display=$(yabai -m query --displays --display | jq -c '.index')
space=$(yabai -m query --spaces --space | jq -c '.label')
syslog -s -k Facility com.apple.console \
       -k Level notice \
       -k Message "yabai event ${event} d=${display} s=${space}"
