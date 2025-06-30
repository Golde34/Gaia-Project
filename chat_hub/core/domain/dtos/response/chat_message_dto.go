package response_dtos

type RecentChatMessageDTO struct {
    UserMessage string   `json:"user_message"` 
    BotMessages []string `json:"bot_messages"` 
}

type RecentChatHistory struct {
    Messages []RecentChatMessageDTO `json:"messages"` 
}