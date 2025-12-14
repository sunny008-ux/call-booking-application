const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const client = require('prom-client');

dotenv.config(); // Works locally; ignored in Kubernetes if envs are injected

const routes = require('./routes');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const { httpRequestTimer, counter } = require('./metrics');

const app = express();

/* -------------------- MIDDLEWARES -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- METRICS SETUP -------------------- */
const register = new client.Registry();
register.registerMetric(httpRequestTimer);
register.registerMetric(counter);

/* -------------------- DATABASE -------------------- */
(async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Exit if DB is not available
  }
})();

/* -------------------- ROUTES -------------------- */
app.use('/api', routes);

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

/* -------------------- ERROR HANDLING -------------------- */
app.use(notFound);
app.use(errorHandler);

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server started on PORT ${PORT}`);
});
