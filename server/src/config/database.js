import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return client;
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    isConnected = true;
    console.log("Connected to MongoDB");
    return client;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default client;
