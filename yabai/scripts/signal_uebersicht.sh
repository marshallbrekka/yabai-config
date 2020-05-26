#!/bin/bash
# NOTE: If uebersicht details change and the websocket approach breaks, just uncomment
# the following line to fall back to applescript.
# compatibility_mode="true"

# If event is provided will we try an optimized path communicating directly via
# the websocket.
event=$1


# This is a slight performance optimization to get a faster refresh, as the Applescript interface
# is pretty slow.
# If this ever breaks we can always fall back to using applescript script to regain functionality.
if [[ $(type -P websocat) = "" || "$compatibility_mode" = "true" ]]; then
   echo "Falling back to applescript, websocat not installed. https://github.com/vi/websocat"
   osascript -e 'tell application id "tracesOf.Uebersicht" to refresh widget id "nibar-yabai-jsx"'
   return
fi


echo "Signaling through websocket: event=${event} $(env | grep YB)"
# This is the Uebersicht server address.
HOST=127.0.0.1:41416

payload="\"nibar-yabai-jsx\""
ws_event="WIDGET_WANTS_REFRESH"
# if [[ "$event" = "" ]]; then
#     echo "Event not specified, using defaults."
# elif [[ "$event" = "space_changed" ]]; then
#     payload=$YABAI_SPACE_ID
#     ws_event="yb/$event"
# elif [[ "$event" = "display_changed" ]]; then
#     payload=$YABAI_DISPLAY_ID
#     ws_event="yb/$event"
# else
#     echo "event not handled, returning"
#     return
# fi

echo "Posting event ${ws_event} with payload ${payload}"
# The server checks the origin to filter out invalid requests, so make sure we set it.
echo "{\"type\":\"${ws_event}\",\"payload\":${payload}}" |
    websocat -E --origin http://$HOST ws://$HOST
