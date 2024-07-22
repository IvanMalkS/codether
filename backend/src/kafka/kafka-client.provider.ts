import { Kafka } from 'kafkajs';

export const KafkaClientProvider = {
  provide: 'KAFKA_CLIENT',
  useFactory: async () => {
    return new Kafka({
      clientId: 'codether',
      brokers: [process.env.KAFKA_BROKER_URL],
    });
  },
};
