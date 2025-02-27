import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_OPTIONS}`;
const dbName = process.env.MONGO_DATABASE;

async function initializeDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(dbName);

    // Crear colección D_Product
    if (!(await db.listCollections({ name: "D_Product" }).hasNext())) {
      await db.createCollection("D_Product");
      await db.collection("D_Product").createIndex({ name: 1 }, { unique: true });
      console.log("Colección 'D_Product' creada.");
    }

    // Crear colección D_User
    if (!(await db.listCollections({ name: "D_User" }).hasNext())) {
      await db.createCollection("D_User");
      await db.collection("D_User").createIndex({ email: 1 }, { unique: true });
      console.log("Colección 'D_User' creada.");
    }

    // Crear colección D_Order
    if (!(await db.listCollections({ name: "D_Order" }).hasNext())) {
      await db.createCollection("D_Order");
      await db.collection("D_Order").createIndex({ userId: 1 });
      console.log("Colección 'D_Order' creada.");
    }

    // Crear colección d_order_products_d_product
    if (!(await db.listCollections({ name: "d_order_products_d_product" }).hasNext())) {
      await db.createCollection("d_order_products_d_product");
      await db.collection("d_order_products_d_product").createIndex({ dOrderId: 1 });
      await db.collection("d_order_products_d_product").createIndex({ dProductId: 1 });
      console.log("Colección 'd_order_products_d_product' creada.");
    }

    console.log("Estructura de la base de datos creada correctamente.");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  } finally {
    await client.close();
  }
}

initializeDatabase();