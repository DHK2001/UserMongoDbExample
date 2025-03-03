import { Property, Required } from "@tsed/schema";
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
} from "typeorm";

import { Product } from "./ProductEntity.js";
import { User } from "./UserEntity.js";
import { ObjectId } from "mongodb";

@Entity({ name: "D_Order" })
export class Order {
  @ObjectIdColumn()
  @Property()
  @Required()
  _id!: ObjectId;

  @Required()
  @Column()
  userId!: ObjectId;

  @Column()
  @Required()
  productIds!: ObjectId[]; 

  @Column("decimal", { precision: 10, scale: 2 })
  @Required()
  totalAmount!: number;

  @CreateDateColumn()
  @Required()
  orderDate!: Date;

  @Column({ default: false })
  finalized: boolean;
}
