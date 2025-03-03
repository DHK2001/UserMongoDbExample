import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound } from "@tsed/exceptions";
import { Logger } from "@tsed/logger";
import { ObjectId } from "mongodb";
import { MongodbDatasource } from "src/datasources/MongodbDatasource.js";
import { Order } from "src/entities/OrderEntity.js";
import { OrderProduct } from "src/entities/OrderProduct.js";
import { Product } from "src/entities/ProductEntity.js";
import { User } from "src/entities/UserEntity.js";
import {
  CreateOrderDto,
  DeleteOrderResponse,
  FinalizedOrderResponse,
  OrderResponse,
  UpdateOrderDto,
} from "src/models/OrderModels.js";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class OrderService {
  @Inject()
  logger!: Logger;

  @Inject(MongodbDatasource)
  private mysqlDataSource!: DataSource;

  private orderRepository!: Repository<Order>;
  private userRepository!: Repository<User>;
  private productRepository!: Repository<Product>;
  private orderProductRepository!: Repository<OrderProduct>;

  async $onInit() {
    if (this.mysqlDataSource.isInitialized) {
      this.orderRepository = this.mysqlDataSource.getRepository(Order);
      this.userRepository = this.mysqlDataSource.getRepository(User);
      this.productRepository = this.mysqlDataSource.getRepository(Product);
      this.orderProductRepository =
        this.mysqlDataSource.getRepository(OrderProduct);
    } else {
      throw new Error("Datasource not connected");
    }
  }

  async getAll(): Promise<OrderResponse[]> {
    try {
      const orders = await this.orderRepository.find();
      var orderResponse: OrderResponse[] = [];
      console.log("algo", orders);
      await Promise.all(
        orders.map(async (order) => {
          const products = await this.orderProductRepository.find({
            where: { orderId: new ObjectId(order._id) },
          });
          console.log("algo2", products);
          orderResponse.push({
            id: order._id.toString(),
            userId: order.userId.toString(),
            products: products.map((product) => ({
              id: product.productId.toString(),
              name: product.name || "",
              amount: product.amount,
            })),
            totalAmount: order.totalAmount,
            orderDate: order.orderDate,
            finalized: order.finalized,
          });
        })
      );

      return orderResponse;
    } catch (error) {
      this.logger.error("OrderService: getAll Error:", error);
      throw new BadRequest("Error fetching orders");
    }
  }

  async getByUserId(
    userId: string,
    finalized?: boolean
  ): Promise<OrderResponse[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(userId) },
      });
      if (!user) {
        throw new NotFound("User not found");
      }

      var orders;
      if (finalized !== undefined) {
        orders = await this.orderRepository.find({
          where: { userId: new ObjectId(userId), finalized: finalized },
        });
      } else {
        orders = await this.orderRepository.find({
          where: { userId: new ObjectId(userId) },
        });
      }

      const orderResponse: OrderResponse[] = await Promise.all(
        orders.map(async (order) => {
          const products = await this.orderProductRepository.find({
            where: { orderId: new ObjectId(order._id) },
          });
          return {
            id: order._id.toString(),
            userId: order.userId.toString(),
            products: products.map((product) => ({
              id: product.productId.toString(),
              name: product.name || "",
              amount: product.amount,
            })),
            totalAmount: order.totalAmount,
            orderDate: order.orderDate,
            finalized: order.finalized,
          };
        })
      );
      return orderResponse;
    } catch (error) {
      this.logger.error("OrderService: getByUserId Error:", error);
      throw error instanceof NotFound
        ? error
        : new BadRequest("Error fetching orders");
    }
  }

  async getById(id: string): Promise<OrderResponse> {
    try {
      const order = await this.orderRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
      if (!order) {
        throw new NotFound("Order not found");
      }
      const products = await this.orderProductRepository.find({
        where: { orderId: new ObjectId(order._id) },
      });
      return {
        id: order._id.toString(),
        userId:
          order.userId === null ? "User Deleted" : order.userId.toString(),
        products: products.map((product) => ({
          id: product.productId.toString(),
          name: product.name || "",
          amount: product.amount,
        })),
        totalAmount: order.totalAmount,
        orderDate: order.orderDate,
        finalized: order.finalized,
      };
    } catch (error) {
      this.logger.error("OrderService: getById Error:", error);
      throw error instanceof NotFound
        ? error
        : new BadRequest("Error fetching order");
    }
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(createOrderDto.userId) },
      });
      if (!user) {
        throw new NotFound("User not found");
      }

      var productsIds: ObjectId[] = [];

      const products = await Promise.all(
        createOrderDto.products.map(async (productDto) => {
          const product = await this.productRepository.findOne({
            where: { _id: new ObjectId(productDto.id) },
          });
          if (!product) {
            throw new NotFound(`Product with id ${productDto.id} not found`);
          }
          if (product.stock < productDto.amount) {
            throw new BadRequest(
              `Insufficient stock for product ${product.name}`
            );
          }
          productsIds.push(new ObjectId(product._id));
          return { ...product, amount: productDto.amount };
        })
      );

      const totalAmount = products.reduce(
        (sum, product) => sum + product.amount,
        0
      );

      const order = this.orderRepository.create({
        userId: user._id,
        productIds: productsIds,
        totalAmount,
        finalized: false,
      });
      const savedOrder = await this.orderRepository.save(order);

      await Promise.all(
        products.map(async (product) => {
          const productOrder = this.orderProductRepository.create({
            orderId: savedOrder._id,
            productId: product._id,
            name: product.name,
            amount: product.amount,
          });

          await this.orderProductRepository.save(productOrder);
          product.stock -= product.amount;
          await this.productRepository.save(product);
        })
      );

      return {
        id: savedOrder._id.toString(),
        userId: savedOrder.userId.toString(),
        products: products.map((product) => ({
          id: product._id.toString(),
          name: product.name,
          amount: product.amount,
        })),
        totalAmount: savedOrder.totalAmount,
        orderDate: savedOrder.orderDate,
        finalized: savedOrder.finalized,
      };
    } catch (error) {
      this.logger.error("OrderService: createOrder Error:", error);
      throw error instanceof NotFound || error instanceof BadRequest
        ? error
        : new BadRequest("Error creating order");
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto
  ): Promise<OrderResponse> {
    try {
      const existingOrder = await this.orderRepository.findOne({
        where: { _id: new ObjectId(id) },
      });

      if (!existingOrder) {
        throw new NotFound("Order not found");
      }

      if (existingOrder.finalized) {
        throw new BadRequest("Order already finalized");
      }

      var totalAmount = 0;

      await Promise.all(
        existingOrder.productIds.map(async (product) => {
          const productR = await this.productRepository.findOne({
            where: { _id: new ObjectId(product) },
          });
          if (!productR) {
            throw new NotFound(`Product with id ${product} not found`);
          }
          const exists = updateOrderDto.products.some(
            (productUp) => productUp.id === productR._id.toString()
          );
          if (!exists) {
            const orderProduct = await this.orderProductRepository.findOne({
              where: {
                orderId: new ObjectId(existingOrder._id),
                productId: new ObjectId(productR._id),
              },
            });
            productR.stock += orderProduct?.amount ?? 0;
            await this.productRepository.save(productR);

            const orderProducts = await this.orderProductRepository.find({
              where: { orderId: new ObjectId(existingOrder._id) },
            });
            if (orderProducts.length > 0) {
              var productDelete = orderProducts.filter(
                (orderProduct) =>
                  orderProduct.productId.toString() === productR._id.toString()
              );
              if (productDelete.length > 0) {
                const id = productDelete[0]._id.toString();
                await this.orderProductRepository.delete(id);
              }
            }
          }
        })
      );

      var products = await Promise.all(
        updateOrderDto.products.map(async (productDto) => {
          const product = await this.productRepository.findOne({
            where: { _id: new ObjectId(productDto.id) },
          });
          if (!product) {
            throw new NotFound(`Product with id ${productDto.id} not found`);
          }
          const orderProduct = await this.orderProductRepository.findOne({
            where: {
              orderId: new ObjectId(existingOrder._id),
              productId: new ObjectId(productDto.id),
            },
          });

          if (!orderProduct) {
            if (productDto.amount > 0) {
              if (product.stock < productDto.amount) {
                throw new BadRequest(
                  `Insufficient stock for product ${product.name}`
                );
              } else {
                await this.orderProductRepository.insert({
                  orderId: existingOrder._id,
                  productId: product._id,
                  name: product.name,
                  amount: productDto.amount,
                });
                product.stock -= productDto.amount;
                await this.productRepository.save(product);
              }
            }
          } else {
            var difference = productDto.amount - orderProduct.amount;
            if (product.stock < difference) {
              throw new BadRequest(
                `Insufficient stock for product ${product.name}`
              );
            } else {
              product.stock -= difference;
              await this.productRepository.save(product);
              if (productDto.amount > 0) {
                orderProduct.amount = productDto.amount;
                await this.orderProductRepository.save(orderProduct);
              } else {
                const orderProducts = await this.orderProductRepository.find({
                  where: { orderId: new ObjectId(existingOrder._id) },
                });
                if (orderProducts.length > 0) {
                  var productDelete = orderProducts.filter(
                    (orderProduct) =>
                      orderProduct.productId.toString() === productDto.id
                  );
                  if (productDelete.length > 0) {
                    const id = productDelete[0]._id.toString();
                    await this.orderProductRepository.delete(id);
                  }
                }
              }
            }
          }
          totalAmount += productDto.amount;
          return { ...product, amount: productDto.amount };
        })
      );
      const productIds = products
        .filter((product) => product.amount !== 0)
        .map((product) => product._id);
      existingOrder.totalAmount = totalAmount;
      existingOrder.productIds = productIds;
      await this.orderRepository.save(existingOrder);
      return {
        id: existingOrder._id.toString(),
        userId: existingOrder.userId.toString(),
        products: products.map((product) => ({
          id: product._id.toString(),
          name: product.name,
          amount: product.amount,
        })),
        totalAmount: existingOrder.totalAmount,
        orderDate: existingOrder.orderDate,
        finalized: existingOrder.finalized,
      };
    } catch (error) {
      this.logger.error("OrderService: update Error:", error);
      throw error instanceof NotFound || error instanceof BadRequest
        ? error
        : new BadRequest("Error updating order");
    }
  }

  async remove(id: string): Promise<DeleteOrderResponse> {
    try {
      const order = await this.orderRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
      if (!order) {
        throw new NotFound("Order not found");
      }
      await this.orderRepository.delete(id);

      const orderProducts = await this.orderProductRepository.find({
        where: { orderId: new ObjectId(id) },
      });
      if (orderProducts.length > 0) {
        await Promise.all(
          orderProducts.map(async (orderProduct) => {
            const id = orderProduct._id.toString();
            await this.orderProductRepository.delete(id);
          })
        );
      }
      return { deleted: true, message: "Order deleted successfully" };
    } catch (error) {
      this.logger.error("OrderService: remove Error:", error);
      throw error instanceof NotFound
        ? error
        : new BadRequest("Error deleting order");
    }
  }

  async finalize(id: string): Promise<FinalizedOrderResponse> {
    try {
      const order = await this.orderRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
      if (!order) {
        throw new NotFound("Order not found");
      }

      if (order.finalized) {
        throw new BadRequest("Order already finalized");
      }

      order.finalized = true;
      await this.orderRepository.save(order);
      return { finilized: true, message: "Order finalized successfully" };
    } catch (error) {
      this.logger.error("OrderService: finalize Error:", error);
      throw error instanceof NotFound
        ? error
        : new BadRequest("Error finalizing order");
    }
  }
}
