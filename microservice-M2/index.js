
const express = require("express");
const winston = require("winston");
const app = express();
const PORT = 5002;
const amqpConnect = require("amqplib");
const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqPort = process.env.RABBITMQ_PORT;
const rabbitmqUser = process.env.RABBITMQ_USER;
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD;
const rabbitmqVhost = process.env.RABBITMQ_VHOST;

const rabbitmqUrl = `amqp://${rabbitmqUser}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}/${rabbitmqVhost}`;
let queueTask = "task"
let queueResponse = "response"
let channel, connection;

const m2Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[M2] ${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'm2.log' })
  ]
});

async function proccessTask() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulating task processing
      m2Logger.info("Task is being processed");
      // Assuming the task is successful, resolve the Promise with the result
      resolve("Task is finished");
      // If any error occurs during task processing, reject the Promise with the error
      // reject(new Error("Task processing failed"));
    }, 2000);
  });
}
async function connectToRabbitMQ() {
  try {
    connection = await amqpConnect.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(queueTask);
  } catch (error) {
    m2Logger.error(`Error connecting to RabbitMQ: ${error.message}`);
    process.exit(1); 
  }
}
connectToRabbitMQ().then(() => {
  channel.consume(queueTask, async (data) => {
    try {
      m2Logger.info("Receiving tasks from Microservice 1");
      const response = await proccessTask();
      channel.ack(data);
      channel.sendToQueue(
        queueResponse,
        Buffer.from(JSON.stringify({
          response: response,
        }))
      );
      m2Logger.info(`Task ${data.task}: is processed with result: ${response}`);
    } catch (err) {
      m2Logger.error(err.message);
    }
  });
});

// Graceful shutdown on process termination
process.on("SIGINT", async () => {
  try {
    m2Logger.info("Closing RabbitMQ channel and connection...");
    if (channel) await channel.close();
    if (connection) await connection.close();
    m2Logger.info("RabbitMQ channel and connection closed successfully.");
    process.exit(0); // Exit with a success code (0) to indicate clean shutdown.
  } catch (error) {
    m2Logger.error(`Error during graceful shutdown: ${error.message}`);
    process.exit(1); // Exit with a non-zero code to indicate an error during shutdown.
  }
});



app.use(express.json())

app.listen(PORT, () => {
  console.log(`Server at ${PORT}`);
});
