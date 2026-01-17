-- Lua Script for Redis: Check and Decrease User API Quota
-- Usage: EVAL script 1 key maxCount
-- key format: "usage:{userId}:{actionType}:{date}"
-- maxCount: Maximum quota for the day
-- Returns: remaining count after decrease (-1 if quota exceeded)

local key = KEYS[1]
local maxCount = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

-- Get current value
local current = redis.call('GET', key)

if current == false then
    -- Key doesn't exist, initialize with maxCount - 1
    redis.call('SETEX', key, 86400, maxCount - 1)  -- TTL = 24 hours
    return maxCount - 1
else
    -- Key exists, check if we can decrease
    current = tonumber(current)
    if current <= 0 then
        -- Quota exceeded
        return -1
    else
        -- Decrease by 1
        local remaining = redis.call('DECR', key)
        return remaining
    end
end
