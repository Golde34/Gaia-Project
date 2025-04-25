#!/bin/bash

# create a lock file
touch /tmp/chat_hub_lock

cd ../chat_hub

make run

# remove the lock file when done
rm -f /tmp/chat_hub_lock
```