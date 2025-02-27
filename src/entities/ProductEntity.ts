import { MaxLength, MinLength, Property, Required } from "@tsed/schema";
import { Column, Entity, ObjectIdColumn } from "typeorm";
import { ObjectId } from 'mongodb';

@Entity({ name: "D_Product" })
export class Product {
  @ObjectIdColumn()
  @Property()
  @Required()
  _id!: ObjectId;

  @Column({ length: 100 })
  @MinLength(3)
  @MaxLength(100)
  @Required()
  name!: string;

  @Column("text")
  @Required()
  description!: string;

  @Column("text")
  @Required()
  imageUrl!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @Required()
  price!: number;

  @Column("int")
  @Required()
  stock!: number;
  orders: any;
}
