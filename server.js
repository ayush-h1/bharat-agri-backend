const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

// Import cron job
require('./utils/cronJobs');

const app = express();

// ===== CORS Configuration =====
const allowedOrigins = [
  'https://bharat-agri-frontend.vercel.app', // production frontend
  'http://localhost:5173' // local development (adjust if your frontend uses another port)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy does not allow access from this origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // if you ever need cookies or auth headers
}));

// ===== Body Parsing =====
app.use(express.json());

// ===== Routes =====
app.use('/api/auth', require('./routes/authroutes'));        // authentication
app.use('/api/packages', require('./routes/packageRoutes')); // investment packages
app.use('/api/investments', require('./routes/investmentRoutes')); // user investments
app.use('/api/referrals', require('./routes/referralRoutes')); // referrals
app.use('/api/withdrawals', require('./routes/withdrawalRoutes')); // withdrawals
app.use('/api/admin', require('./routes/adminRoutes'));       // admin panel
app.use('/api/wallet', require('./routes/walletRoutes'));     // add funds (top-up)
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api', require('./routes/bankRoutes'));
app.use('/api/payment-requests', require('./routes/paymentRequestRoutes'));

// ===== Test Endpoint (optional) =====
app.get('/api/test', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ decoded });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ===== Root Health Check =====
app.get('/', (req, res) => {
  res.send('Bharat Agri Backend is running');
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
