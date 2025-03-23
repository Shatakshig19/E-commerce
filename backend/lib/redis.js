import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

//key-value store
// await redis.set("foo", "bar"); // foo is the key and bar is the value in the redis database
