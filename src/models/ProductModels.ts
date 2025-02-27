import { MaxLength, MinLength, Property, Required } from "@tsed/schema";

export class CreateProductDto {
  @Required()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @Required()
  description: string;

  @Required()
  imageUrl: string;

  @Required()
  price: number;

  @Required()
  stock: number;
}

export class UpdateProductDto {
  @MinLength(3)
  @MaxLength(100)
  @Required()
  name: string;

  @Required()
  description: string;

  @Required()
  imageUrl: string;

  @Required()
  price: number;

  @Required()
  stock: number;
}

export class deleteProductResponse {
  @Property()
  deleteUser: boolean;

  @Property()
  message: string;
}
