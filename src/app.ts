import express from 'express';
import dotenv from 'dotenv';
import { json } from 'body-parser';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import funeralRoutes from './routes/funeral_service.routes';
import serviceRoutes from './routes/service.routes';
import bookingRoutes from './routes/booking.routes';
import messageRoute from './routes/message.routes';
import familyRoute from './routes/famili.routes';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(json());
app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
);
  
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/funerals', funeralRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/messages', messageRoute);
app.use('/api/family', familyRoute);
export default app;
