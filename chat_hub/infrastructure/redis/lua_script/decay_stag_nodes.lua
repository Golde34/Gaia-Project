-- KEYS: [energy_hash_key]
-- ARGV: [gamma]

local key = KEYS[1]
local gamma = tonumber(ARGV[1])

local all_nodes = redis.call('HGETALL', key)
    
for i = 1, #all_nodes, 2 do
    local node_id = all_nodes[i]
    local current_e = tonumber(all_nodes[i+1])
    
    local new_e = current_e * gamma
    redis.call('HSET', key, node_id, new_e)
end

return #all_nodes / 2

