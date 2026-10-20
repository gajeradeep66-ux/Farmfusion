import mongoose from 'mongoose';

const fallbackUri = 'mongodb://127.0.0.1:27017/farmfusion';

const connectDB = async () => {
  const candidateUris = process.env.MONGO_URI
    ? [process.env.MONGO_URI]
    : process.env.NODE_ENV === 'production'
      ? []
      : [fallbackUri];

  if (candidateUris.length === 0) {
    throw new Error('MONGO_URI must be set in the production environment.');
  }

  for (const uri of candidateUris) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      let target = 'configured MongoDB server';
      try {
        target = new URL(uri).host || target;
      } catch {
        target = 'configured MongoDB server';
      }
      console.warn(`MongoDB connection failed for ${target}: ${error.message}`);
    }
  }

  throw new Error('MongoDB connection failed for all configured URIs.');
};

export default connectDB;
