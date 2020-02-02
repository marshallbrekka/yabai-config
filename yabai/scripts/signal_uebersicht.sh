#!/bin/bash

# This is a slight performance optimization to get a faster refresh, as the Applescript interface
# is pretty slow.
# If this ever breaks we can always fall back to using applescript script to regain functionality.

# Uncomment to use applescript
# osascript -e 'tell application id "tracesOf.Uebersicht" to refresh widget id "nibar-yabai-jsx"'

if [[ $(type -P websocat) = "" ]]; then
   echo "Falling back to applescript, websocat not installed. https://github.com/vi/websocat"
   osascript -e 'tell application id "tracesOf.Uebersicht" to refresh widget id "nibar-yabai-jsx"'
else
    echo "Signaling through websocket"
    # This is the Uebersicht server address.
    HOST=127.0.0.1:41416

    # The server checks the origin to filter out invalid requests, so make sure
    # we set it.
    echo '{"type":"WIDGET_WANTS_REFRESH","payload":"nibar-yabai-jsx"}' |
        websocat -E --origin http://$HOST ws://$HOST
fi
