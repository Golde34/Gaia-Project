package kafka 

type MessageHandler interface {
	HandleMessage(topic string, key, value []byte) 
}