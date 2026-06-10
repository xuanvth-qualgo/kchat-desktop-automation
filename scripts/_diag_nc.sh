#!/bin/bash
echo "=== Library notif-related ==="
find "$HOME/Library" -maxdepth 3 -iname "*notif*" 2>/dev/null | head -20

echo "=== Trigger osascript notif and check db immediately ==="
osascript -e 'display notification "Diag test" with title "kChat" subtitle "test123"'
sleep 1
SRC="$HOME/Library/Group Containers/group.com.apple.usernoted/db2"
for t in record delivered displayed requests app; do
   c=$(sqlite3 -readonly "$SRC/db" "SELECT count(*) FROM $t;" 2>&1)
   echo "$t = $c"
done
echo "--- app rows ---"
sqlite3 -readonly "$SRC/db" "SELECT app_id, identifier FROM app;" 2>&1

echo "=== Wait 4s and re-check ==="
sleep 4
for t in record delivered displayed requests app; do
   c=$(sqlite3 -readonly "$SRC/db" "SELECT count(*) FROM $t;" 2>&1)
   echo "$t = $c"
done
echo "--- app rows ---"
sqlite3 -readonly "$SRC/db" "SELECT app_id, identifier FROM app;" 2>&1
