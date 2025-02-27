import { Property, Required } from "@tsed/schema";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
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

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToMany(() => Product)
  @JoinTable()
  products!: Product[];

  @Column("decimal", { precision: 10, scale: 2 })
  @Required()
  totalAmount!: number;

  @CreateDateColumn()
  @Required()
  orderDate!: Date;

  @Column({ default: false })
  finalized: boolean;
}
