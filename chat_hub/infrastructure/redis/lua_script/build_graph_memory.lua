-- KEYS: [nodes_key, metadata_key]
-- ARGV: [node_id, node_json, topic_id, topic_limit]

local nodes_key = KEYS[1]
local meta_key = KEYS[2]
local node_id = ARGV[1]
local node_json = ARGV[2]
local topic_id = ARGV[3]
local limit = tonumber(ARGV[4])

-- 1. Lưu node mới
redis.call('HSET', nodes_key, node_id, node_json)

-- 2. Tăng bộ đếm của topic trong metadata
local count_key = "topic:" .. topic_id .. ":count"
local current_count = redis.call('HINCRBY', meta_key, count_key, 1)

-- 3. Kiểm tra trục xuất (Evict)
-- Lưu ý: Vì bạn muốn RAM chỉ có 10, ta check tổng số field trong Hash nodes
local total_nodes = redis.call('HLEN', nodes_key)
local evicted_node = nil

if total_nodes > 10 then
    -- Tìm node cũ nhất để xóa (Dựa trên timestamp bên trong JSON hoặc 1 list phụ)
    -- Để đơn giản và nhanh, ta dùng 1 List phụ chỉ để quản lý thứ tự trục xuất
    local timeline_key = nodes_key .. ":timeline"
    redis.call('LPUSH', timeline_key, node_id)
    
    local oldest_id = redis.call('RPOP', timeline_key)
    if oldest_id and oldest_id ~= node_id then
        evicted_node = redis.call('HGET', nodes_key, oldest_id)
        redis.call('HDEL', nodes_key, oldest_id)
        -- Giảm count của topic tương ứng trong metadata
        -- (Cần parse JSON hoặc lưu map ID-Topic để làm chuẩn chỗ này)
    end
else
    redis.call('LPUSH', nodes_key .. ":timeline", node_id)
end

return evicted_node
