import { Column, Entity, JoinColumn, ManyToOne, ObjectIdColumn, PrimaryColumn } from "typeorm";

import { Order } from "./OrderEntity.js";
import { Product } from "./ProductEntity.js";
import { ObjectId } from "mongodb";
import { MaxLength, MinLength, Required } from "@tsed/schema";

@Entity({ name: "d_order_products_d_product" })
export class OrderProduct {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  orderId!: ObjectId;

  @Column()
  productId!: ObjectId;

  @Column({ length: 100 })
  name!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;
}
