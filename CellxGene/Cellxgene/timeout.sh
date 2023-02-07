# A timeout script for exiting the container after the specified timeout. 
#!/bin/bash
echo "Starting timeout script with TIMEOUT=$TIMEOUT seconds"
sleep $TIMEOUT
echo "Timeout reached, killing all processes and exiting the container..."
kill -9 -1