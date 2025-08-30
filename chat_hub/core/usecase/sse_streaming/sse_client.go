package sse

import (
	"fmt"
	"net/http"
	"sync"
)

type SSEClient struct {
	DialogueId string
	TabId      string
	ch         chan string
}

var (
	sseClients = make(map[string][]*SSEClient)
	mu         sync.Mutex
)

func SubcribeSSE(w http.ResponseWriter, r *http.Request) (*SSEClient, error) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return nil, nil
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	dialogueId := r.URL.Query().Get("dialogueId")
	tabId := r.URL.Query().Get("tabId")

	client := &SSEClient{
		DialogueId: dialogueId,
		TabId:      tabId,
		ch:         make(chan string),
	}
	sseClients[dialogueId] = append(sseClients[dialogueId], client)
	defer func() {
		clients := sseClients[dialogueId]
		for i, c := range clients {
			if c.TabId == tabId {
				sseClients[dialogueId] = append(clients[:i], clients[i+1:]...)
				break
			}
		}
		close(client.ch)
	}()

	go func() {
		for msg := range client.ch {
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
		}
	}()

	return client, nil
}

func BroadcastToDialogue(dialogueId, message string) {
	mu.Lock()
	defer mu.Unlock()
	for _, client := range sseClients[dialogueId] {
		select {
		case client.ch <- message:
		default:
			// buffer is full, skip sending
			fmt.Printf("Failed to send message to client %s in dialogue %s\n", client.TabId, dialogueId)
		}
	}
}
