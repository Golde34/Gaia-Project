package async

import (
	"context"
	"fmt"
	kafka_config "golang_kafka/config"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/IBM/sarama"
	"github.com/joho/godotenv"
)

func ProducerLoadEnv() (kafka_config.Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file: ", err)
	}

	prefix :=  "KAFKA_PRODUCER_"

	bootstrapServer := os.Getenv(prefix+"BOOTSTRAP_SERVERS")
	version := os.Getenv(prefix+"VERSION")
	assignor := os.Getenv(prefix+"ASSIGNOR")
	oldest := os.Getenv(prefix+"OLDEST")
	verbose := os.Getenv(prefix+"VERBOSE")
	producers := kafka_config.ConvertInt(os.Getenv(prefix+"PRODUCERS"))
	if err != nil {
		log.Fatal("Failed to convert PRODUCERS to integer:", err)
	}
	log.Println("Kafka consumer initialized: {}", bootstrapServer)

	config := kafka_config.Config{
		BootstrapServers: bootstrapServer,
		Version:          version,
		Assignor:         assignor,
		Oldest:           oldest == "true",
		Verbose:          verbose == "true",
		Producers:        producers,
	}

	return config, nil
}

func Producer(topic string, limit int) {
	config := sarama.NewConfig()
	kafkaConfig, err := ProducerLoadEnv()
	if err != nil {
		log.Fatal("Failed to load producer config:", err)
	}
	// 异步生产者不建议把 Errors 和 Successes 都开启，一般开启 Errors 就行
	// 同步生产者就必须都开启，因为会同步返回发送成功或者失败
	config.Producer.Return.Errors = true    // 设定是否需要返回错误信息
	config.Producer.Return.Successes = true // 设定是否需要返回成功信息
	producer, err := sarama.NewAsyncProducer([]string{kafkaConfig.BootstrapServers}, config)
	if err != nil {
		log.Fatal("NewSyncProducer err:", err)
	}
	var (
		wg                                   sync.WaitGroup
		enqueued, timeout, successes, errors int
	)
	// [!important] 异步生产者发送后必须把返回值从 Errors 或者 Successes 中读出来 不然会阻塞 sarama 内部处理逻辑 导致只能发出去一条消息
	wg.Add(1)
	go func() {
		defer wg.Done()
		for range producer.Successes() {
			// log.Printf("[Producer] Success: key:%v msg:%+v \n", s.Key, s.Value)
			successes++
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		for e := range producer.Errors() {
			log.Printf("[Producer] Errors：err:%v msg:%+v \n", e.Msg, e.Err)
			errors++
		}
	}()

	// 异步发送
	for i := 0; i < limit; i++ {
		str := strconv.Itoa(int(time.Now().UnixNano()))
		msg := &sarama.ProducerMessage{Topic: topic, Key: nil, Value: sarama.StringEncoder(str)}
		// 异步发送只是写入内存了就返回了，并没有真正发送出去
		// sarama 库中用的是一个 channel 来接收，后台 goroutine 异步从该 channel 中取出消息并真正发送
		// select + ctx 做超时控制,防止阻塞 producer.Input() <- msg 也可能会阻塞
		ctx, cancel := context.WithTimeout(context.Background(), time.Millisecond*10)
		select {
		case producer.Input() <- msg:
			enqueued++
		case <-ctx.Done():
			timeout++
		}
		cancel()
		if i%10000 == 0 && i != 0 {
			log.Printf("已发送消息数:%d 超时数:%d\n", i, timeout)
		}
	}

	// We are done
	producer.AsyncClose()
	wg.Wait()
	log.Printf("发送完毕 总发送条数:%d enqueued:%d timeout:%d successes: %d errors: %d\n", limit, enqueued, timeout, successes, errors)
}