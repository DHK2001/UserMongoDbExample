import { Controller, Inject } from "@tsed/di";
import { BodyParams, HeaderParams, PathParams } from "@tsed/platform-params";
import { Delete, Get, Post, Put, Returns } from "@tsed/schema";
import { CreateProductDto, deleteProductResponse, UpdateProductDto } from "src/models/ProductModels.js";

import { ProducstService } from "./Services.js";
import { Product } from "src/entities/ProductEntity.js";

@Controller("/products")
export class ProductController {
  @Inject()
  private readonly productsService: ProducstService;

  @Get("/")
  @Returns(200, Product)
  async get(@HeaderParams("authorization-token") token: string) {
    return await this.productsService.getAll();
  }

  @Get("/:id")
  async getById(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string) {
    return await this.productsService.getById(id);
  }

  @Post()
  @Returns(201, Product)
  async create(
    @BodyParams() createProduct: CreateProductDto,
    @HeaderParams("authorization-token") token: string
  ): Promise<Product> {
    return await this.productsService.createProduct(createProduct);
  }

  @Put("/:id")
  @Returns(200, Product)
  async update(
    @PathParams("id") id: string,
    @BodyParams() product: UpdateProductDto,
    @HeaderParams("authorization-token") token: string
  ): Promise<Product> {
    return await this.productsService.update(id, product);
  }

  @Delete("/:id")
  @Returns(200, deleteProductResponse)
  async remove(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string): Promise<deleteProductResponse> {
    return await this.productsService.remove(id);
  }
}
