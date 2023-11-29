#!/bin/bash

touch blocked_ips.csv
CSV_FILE="blocked_ips.csv"

function restore_banned_ips() {
  while IFS=',' read -r ip end_time; do
    current_time=$(date +%s)
    if (( current_time >= end_time )); then
      ufw delete deny from $ip
    else
      ufw deny from $ip
    fi
  done < "$CSV_FILE"
}


restore_banned_ips