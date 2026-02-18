-- KEYS: [meta_key, topics_recency_key]
-- ARGV: [node_id, topic_id, threshold]

local meta_key = KEYS[1]
local topics_recency_key = KEYS[2]

local node_id = ARGV[1]
local topic_id = ARGV[2]
local threshold = tonumber(ARGV[3]) or 50
local timestamp = os.time()

-- 1. Tăng tổng số lượng message toàn bộ STAG
local total_session_count = redis.call('HINCRBY', meta_key, "total_count", 1)

-- 2. Tăng số lượng message trong Topic hiện tại
local topic_count_field = "topic:" .. topic_id .. ":count"
local current_topic_count = redis.call('HINCRBY', meta_key, topic_count_field, 1)

-- 3. Cập nhật ID cuối cùng của Topic
local topic_last_node_field = "topic:" .. topic_id .. ":last_node_id"
redis.call('HSET', meta_key, topic_last_node_field, node_id)

-- 4. Cập nhật độ tươi của Topic (ZADD với timestamp)
redis.call('ZADD', topics_recency_key, timestamp, topic_id)

-- 5. Xử lý Logic Trả về khi đạt ngưỡng 50
local topics_to_consolidate = {}

if total_session_count >= threshold then
    -- Lấy toàn bộ danh sách topic sắp xếp từ cũ nhất đến mới nhất
    local all_topics = redis.call('ZRANGE', topics_recency_key, 0, -1)
    local t = #all_topics
    
    if t > 0 then
        -- Quy tắc: Nếu t < 3 trả về t-1, nếu t >= 3 trả về 3 thằng đầu (t-3)
        local num_to_take = 3
        if t < 3 then
            num_to_take = t - 1
        end
        
        -- Chỉ lấy nếu num_to_take > 0 (tránh trường hợp t=1)
        if num_to_take > 0 then
            for i = 1, num_to_take do
                table.insert(topics_to_consolidate, all_topics[i])
            end
        else
            -- Trường hợp t=1, trả về chính nó nếu cần xử lý
            table.insert(topics_to_consolidate, all_topics[1])
        end
    end
end

-- Trả về: [Tổng count, Count của topic vừa add, Danh sách topic cũ cần nén]
return {
    total_session_count,
    current_topic_count,
    topics_to_consolidate
}
