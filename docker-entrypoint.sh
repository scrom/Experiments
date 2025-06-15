#!/bin/sh
set -e

# Substitute environment variables in template and write real config
envsubst < /usr/local/etc/redis/redis.conf.template > /usr/local/etc/redis/redis.conf

# Start Redis with the generated config
exec redis-server /usr/local/etc/redis/redis.conf