yarn start config_moonbeam_antoine.json &
# cmd="yarn start config_moonbeam_antoine.json"
# nohup $cmd &
# & sleep 20 &&yarn run test-only

# Storing the background process' PID.
bg_pid=$!
echo "bg_pid"
echo $bg_pid
# Trapping SIGINTs so we can send them back to $bg_pid.
trap "echo zero0" 0
trap "echo deux" 2
trap "echo EXIT" EXIT
trap "kill -2 $bg_pid" 0
sleep 30 &&yarn run test-only
kill -2 $bg_pid
# In the meantime, wait for $bg_pid to end.
wait $bg_pid