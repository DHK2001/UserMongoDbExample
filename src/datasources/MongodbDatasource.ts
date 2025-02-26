import { registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

export const MongodbDatasource = Symbol.for("MongodbDatasource");
export type MongodbDatasource = DataSource;

const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(
  process.env.MONGO_PASSWORD || "",
)}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DATABASE}${process.env.MONGO_OPTIONS}`;

console.log("url dev", MONGO_URL);

export const mongodbDatasource = new DataSource({
  type: "mongodb",
  url: MONGO_URL,
  database: process.env.MONGO_DATABASE,
  useUnifiedTopology: true,
  entities: [],
  synchronize: false,
  migrations: [],
});

registerProvider<DataSource>({
  provide: MongodbDatasource,
  type: "typeorm:datasource",
  deps: [Logger],
  async useAsyncFactory(logger: Logger) {
    try {
      await mongodbDatasource.initialize();
      logger.info("Connected with TypeORM to MongoDB database.");
      return mongodbDatasource;
    } catch (err) {
      logger.error("Failed to connect to MongoDB:", err);
      throw err;
    }
  },
  hooks: {
    $onDestroy(dataSource) {
      return dataSource.isInitialized && dataSource.close();
    },
  },
});
