import { Column, Entity, JoinColumn, ManyToOne, ObjectIdColumn, PrimaryColumn } from "typeorm";

import { Order } from "./OrderEntity.js";
import { Product } from "./ProductEntity.js";
import { ObjectId } from "mongodb";

@Entity({ name: "d_order_products_d_product" })
export class OrderProduct {
  @ObjectIdColumn()
  orderId!: ObjectId;

  @ObjectIdColumn()
  productId!: ObjectId;

  @ManyToOne(() => Order, (order) => order.products)
  @JoinColumn({ name: "dOrderId" })
  order!: Order;

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn({ name: "dProductId" })
  product!: Product;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;
}
