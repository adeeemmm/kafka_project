const { Kafka } = require("kafkajs");
const { pool } = require("./db");

const TOPIC = process.env.KAFKA_TOPIC || "chat-topic";

const kafka = new Kafka({
  clientId: "kafka-chat-app",
  brokers: [process.env.KAFKA_SERVER || "localhost:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "kafka-chat-backend" });
const admin = kafka.admin();

let producerConnected = false;

async function ensureTopic() {
  await admin.connect();
  const existingTopics = await admin.listTopics();

  if (!existingTopics.includes(TOPIC)) {
    await admin.createTopics({
      topics: [{ topic: TOPIC, numPartitions: 1, replicationFactor: 1 }],
    });
    console.log(`Created topic "${TOPIC}"`);
  }

  await admin.disconnect();
}
async function sendMessage(data) {
  if (!producerConnected) {
    await producer.connect();
    producerConnected = true;
  }

  await producer.send({
    topic: TOPIC,
    messages: [{ value: JSON.stringify(data) }],
  });
}

/**
 * Starts consuming the chat topic. Every consumed event is:
 *  1. persisted in MySQL (messages table)
 *  2. forwarded to `onMessage` (used to broadcast over WebSocket)
 */
async function startConsumer(onMessage) {
  await ensureTopic();
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });


  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());

      try {
        await pool.query(
          "INSERT INTO messages (username, message) VALUES (?, ?)",
          [data.user, data.message]
        );
      } catch (err) {
        console.error("Failed to persist message:", err.message);
      }

      onMessage(data);
    },
  });

  console.log(`Kafka consumer listening on topic "${TOPIC}"`);
}

module.exports = { sendMessage, startConsumer };
