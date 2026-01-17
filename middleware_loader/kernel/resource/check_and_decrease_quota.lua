-- Lua Script for Redis: Check and Decrease User API Quota
-- Usage: EVAL script 1 key maxCount
-- key format: "usage:{userId}:{actionType}:{date}"
-- maxCount: Maximum quota for the day
-- Returns: remaining count after decrease (-1 if quota exceeded)

local key = KEYS[1]
local maxCount = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

local current = redis.call('GET', key)

if current == false then
    redis.call('SETEX', key, ttl, maxCount - 1)
    return maxCount - 1
else
    current = tonumber(current)
    if current <= 0 then
        return -1
    else
        local remaining = redis.call('DECR', key)
        return remaining
    end
end
