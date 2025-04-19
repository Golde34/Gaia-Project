package kafka

import (
	"context"
	"fmt"
	"log"

	"sync"

	"github.com/IBM/sarama"
)

type MyConsumerGroupHandler struct {
	name     string
	count    int64
	handlers map[string]MessageHandler
}

func NewConsumerGroupHandler(name string, handlers map[string]MessageHandler) MyConsumerGroupHandler {
	return MyConsumerGroupHandler{
		handlers: handlers,
		name:     name,
	}
}

func (MyConsumerGroupHandler) Setup(_ sarama.ConsumerGroupSession) error { return nil }

func (MyConsumerGroupHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }

func (h MyConsumerGroupHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    for {
        select {
        case msg, ok := <-claim.Messages():
            if !ok {
                return nil
            }

            fmt.Printf("[consumer] name:%s topic:%q partition:%d offset:%d\n", h.name, msg.Topic, msg.Partition, msg.Offset)
            fmt.Printf("[consumer] name:%s value:%s\n", h.name, string(msg.Value))
            sess.MarkMessage(msg, "")

            topic := msg.Topic
            handler, found := h.handlers[topic]
            if !found {
                log.Printf("No handler found for topic %s\n", topic)
                continue 
            }
            handler.HandleMessage(topic, msg.Key, msg.Value);

            h.count++
            if h.count%10000 == 0 {
                fmt.Printf("name:%s Consumption:%v\n", h.name, h.count)
            }

        case <-sess.Context().Done():
            return nil
        }
    }
}

func ConsumerGroup(bootstrapServers string, topics []string, group string, name MyConsumerGroupHandler) {
	config := sarama.NewConfig()
	config.Consumer.Return.Errors = true
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	cg, err := sarama.NewConsumerGroup([]string{bootstrapServers}, group, config)
	if err != nil {
		log.Fatal("NewConsumerGroup err: ", err)
	}
	defer cg.Close()
	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		for err = range cg.Errors() {
			fmt.Println("ERROR", err)
		}
	}()
	go func() {
		defer wg.Done()
		handler := MyConsumerGroupHandler{name: name.name, handlers: name.handlers}
		for {
			fmt.Println("running: ", name)
			err = cg.Consume(ctx, topics, handler)
			if err != nil {
				log.Println("Consume err: ", err)
			}
			if ctx.Err() != nil {
				return
			}
		}
	}()
	wg.Wait()
}
