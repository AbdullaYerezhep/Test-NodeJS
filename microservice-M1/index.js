const express = require("express");
const winston = require('winston');
const app = express();
const PORT = 5001;
const amqpConnect  = require("amqplib");
const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqPort = process.env.RABBITMQ_PORT;
const rabbitmqUser = process.env.RABBITMQ_USER;
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD;
const rabbitmqVhost = process.env.RABBITMQ_VHOST;

const m1Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[M1] ${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'm1.log' })
  ]
});

const rabbitmqUrl = `amqp://${rabbitmqUser}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}/${rabbitmqVhost}`;
let queueTask = "task"
let queueResponse = "response"
let connection, channel
app.use(express.json()); 

async function initializeRabbitMQ() {
  try {
    connection = await amqpConnect.connect(rabbitmqUrl);
    m1Logger.info('Connected to RabbitMQ successfully!');
    channel = await connection.createChannel();
    await channel.assertQueue(queueTask);
    await channel.assertQueue(queueResponse);
  } catch (error) {
    m1Logger.error('Error connecting to RabbitMQ:', error.message);
    process.exit(1); // Exit the application if RabbitMQ connection fails
  }
}

// Initialize RabbitMQ and start the server after the connection is established
initializeRabbitMQ().then(() => {
  app.listen(PORT, () => {
    m1Logger.info(`Server at ${PORT}`);
  });
});

app.post("/send", async (req, res) => {
  try {
    const data = req.body;
    await channel.sendToQueue(queueTask, Buffer.from(JSON.stringify(data)));

    await channel.consume(queueResponse, (data) => {
      const response = data.content;
      m1Logger.info(`Received response from Microservice M2: ${response.toString()}`);
      res.send(response);
    });
  } catch (error) {
    // Handle the error and log it
    m1Logger.error(`Error occurred while processing request: ${error.message}`);
    res.status(500).send("An error occurred");
  }
});
