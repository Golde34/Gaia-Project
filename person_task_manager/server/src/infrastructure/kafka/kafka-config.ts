import { Consumer, Producer, Kafka, Partitioners } from 'kafkajs';
import { config } from '../../kernel/config/kafka.configuration';

export class KafkaConfig {
    kafka: Kafka;
    producers: Map<string, Producer> = new Map();
    consumers: Map<string, Consumer> = new Map();

    constructor() {
        this.kafka = new Kafka({
            clientId: config.kafka.groupId,
            // brokers: getArrayBrokers(config.kafka.bootstrapServers)
            brokers: config.kafka.bootstrapServers
        });
    }

    private async getOrCreateProducer(topic: string): Promise<Producer> {
        if (!this.producers.has(topic)) {
            const producer = this.kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
            this.producers.set(topic, producer);
            await producer.connect();
        }
        return this.producers.get(topic)!;
    }

    private async getOrCreateConsumer(topic: string): Promise<Consumer> {
        if (!this.consumers.has(topic)) {
            const consumer = this.kafka.consumer({ groupId: `${config.kafka.groupId}-${topic}` });
            this.consumers.set(topic, consumer);
            await consumer.connect();
            await consumer.subscribe({ topic, fromBeginning: true });
        }
        return this.consumers.get(topic)!;
    }

    async produce(topic: string, messages: any[]) {
        try {
            const producer = await this.getOrCreateProducer(topic);
            await producer.send({ topic, messages });
        } catch (error) {
            console.error(`Error producing message to topic ${topic}:`, error);
        }
    }

    async consume(topic: string, callback: (message: any) => void) {
        try {
            const consumer = await this.getOrCreateConsumer(topic);
            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    console.log("Message received with partition: " + partition
                        + " and topic: " + topic
                        + " and value: " + (message.value ? message.value.toString() : null));
                    callback(message);
                }
            });
        } catch (error) {
            console.error(`Error consuming messages from topic ${topic}:`, error);
        }
    }

    async disconnect() {
        for (const producer of this.producers.values()) {
            await producer.disconnect();
        }
        for (const consumer of this.consumers.values()) {
            await consumer.disconnect();
        }
    }
}

function getArrayBrokers(bootstrapServers: string): string[] {
    console.log(bootstrapServers.split(','));
    return bootstrapServers.split(',');
}

export default KafkaConfig;