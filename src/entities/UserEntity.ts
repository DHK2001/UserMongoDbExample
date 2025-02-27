import { Email, MaxLength, MinLength, Property, Required } from "@tsed/schema";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ObjectIdColumn } from "typeorm";
import { ObjectId } from 'mongodb';

@Entity({ name: "D_User" })
export class User {
  @ObjectIdColumn()
  @Property()
  @Required()
  _id!: ObjectId;

  @Column({ length: 100 })
  @MinLength(3)
  @MaxLength(100)
  @Required()
  firstName!: string;

  @Column({ length: 100 })
  @MinLength(3)
  @MaxLength(100)
  @Required()
  lastName!: string;

  @Column({ unique: true })
  @Required()
  @Email()
  email!: string;

  @Column()
  @Required()
  password_bcrypt!: string;

  @CreateDateColumn()
  @Required()
  creationDate!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
