-- KEYS: [nodes_key, specific_topic_key, metadata_key]
-- ARGV: [node_id, node_json, topic_id, topic_limit]

local nodes_key = KEYS[1]
local topic_list_key = KEYS[2]
local meta_key = KEYS[3]

local node_id = ARGV[1]
local node_json_raw = ARGV[2]
local topic_id = ARGV[3]
local limit = tonumber(ARGV[4])

-- 1. Lưu nội dung Node vào Hash tổng
redis.call('HSET', nodes_key, node_id, node_json_raw)

-- 2. Đẩy ID vào List riêng của Topic (Sợi dây liên kết)
redis.call('LPUSH', topic_list_key, node_id)

-- 3. Cập nhật Metadata: Tăng count và Update WBOS Hindsight
local count_key = "topic:" .. topic_id .. ":count"
redis.call('HINCRBY', meta_key, count_key, 1)

-- 4. Quản lý Timeline tổng để Evict (Giữ RAM đúng 10 messages)
local timeline_key = nodes_key .. ":timeline"
redis.call('LPUSH', timeline_key, node_id)

local total_nodes = redis.call('HLEN', nodes_key)
local evicted_node = nil

if total_nodes > limit then
    -- RPOP lấy ID cũ nhất trong toàn bộ RAM
    local oldest_id = redis.call('RPOP', timeline_key)
    if oldest_id and oldest_id ~= node_id then
        evicted_node = redis.call('HGET', nodes_key, oldest_id)
        redis.call('HDEL', nodes_key, oldest_id)
        
        -- Xóa ID khỏi các danh sách Topic để tránh mồ côi (O(N) nhưng N=10 nên cực nhanh)
        -- Lưu ý: Thực tế node cũ chỉ thuộc 1 topic, Lua sẽ quét nhanh để dọn dẹp
        redis.call('LREM', topic_list_key, 0, oldest_id)
    end
end

return evicted_node
