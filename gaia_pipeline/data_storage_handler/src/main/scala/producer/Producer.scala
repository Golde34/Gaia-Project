package producer

import java.util.Properties
import kernel.configs.{KafkaConfigLoader, KafkaConfig}
import java.util.UUID

class Producer(config: KafkaConfig) {
    private val properties = new Properties()
    properties.put("bootstrap.servers", "localhost:9094")
    properties.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer")
    properties.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer")
    properties.put("acks", "all")
    properties.put("retries", "0")
    properties.put("linger.ms", "1")
    properties.put("buffer.memory", "33554432")
    properties.put("batch.size", "16384")

    private val producer = new org.apache.kafka.clients.producer.KafkaProducer[String, String](properties)

    def send(topic: String, key: String, value: String): Unit = {
        val record = new org.apache.kafka.clients.producer.ProducerRecord[String, String](topic, key, value)
        producer.send(record)
    }
}

object RunKafkaProducer {
    def apply(topic: String, value: String): Unit = {
        val config: KafkaConfig = KafkaConfigLoader.loadKafkaConfig()
        val producer = new Producer(config)
        val key = UUID.randomUUID().toString
        producer.send(topic, key, value)
    }
}