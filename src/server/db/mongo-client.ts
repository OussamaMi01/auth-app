// src/server/db/mongo-client.ts
import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "@/env";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientSingleton: MongoClient | undefined;
}

export function getMongoClient() {
  if (!global._mongoClientSingleton) {
    if (!env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined in environment variables");
    }
    
    const isLocalhost = env.MONGODB_URL.includes("localhost") || 
                        env.MONGODB_URL.includes("127.0.0.1");
    
    const options = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      // Disable TLS for local development
      tls: !isLocalhost,
      tlsAllowInvalidCertificates: isLocalhost,
      tlsAllowInvalidHostnames: isLocalhost,
      // Add connection timeout
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    global._mongoClientSingleton = new MongoClient(env.MONGODB_URL, options);
  }
  return global._mongoClientSingleton;
}

export const mongoClientPromise = (async () => {
  try {
    const client = getMongoClient();
    await client.connect();
    
    // Test the connection
    const pingResult = await client.db().admin().ping();
    
    return client;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("\n💡 Tip: Make sure MongoDB is running locally:");
        console.error("   For Docker: docker run -d -p 27017:27017 --name mongodb mongo");
        console.error("   For Windows: Start MongoDB service from Services");
      }
      if (error.message.includes("tls") || error.message.includes("SSL")) {
        console.error("\n💡 Tip: Try adding '?tls=false' to your MongoDB URL for local development");
      }
    }
    
    throw error;
  }
})();