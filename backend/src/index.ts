import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import departmentRoutes from './routes/department.routes';
import categoryRoutes from './routes/category.routes';
import employeeRoutes from './routes/employee.routes';
import assetRoutes from './routes/asset.routes';
<<<<<<< HEAD
import allocationRoutes from './routes/allocation.routes';
import bookingRoutes from './routes/booking.routes';
=======
>>>>>>> 4f8d915f04a061c58b190d009853885562843600

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
<<<<<<< HEAD
app.use('/api/allocations', allocationRoutes);
app.use('/api/bookings', bookingRoutes);
=======
>>>>>>> 4f8d915f04a061c58b190d009853885562843600

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
