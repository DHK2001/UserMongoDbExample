"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var dotenv = require("dotenv");
dotenv.config();
var uri = "mongodb+srv://".concat(process.env.MONGO_USER, ":").concat(process.env.MONGO_PASSWORD, "@").concat(process.env.MONGO_CLUSTER, "/").concat(process.env.MONGO_OPTIONS);
var dbName = process.env.MONGO_DATABASE;
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new mongodb_1.MongoClient(uri);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 20, 21, 23]);
                    return [4 /*yield*/, client.connect()];
                case 2:
                    _a.sent();
                    db = client.db(dbName);
                    return [4 /*yield*/, db.listCollections({ name: "D_Product" }).hasNext()];
                case 3:
                    if (!!(_a.sent())) return [3 /*break*/, 6];
                    return [4 /*yield*/, db.createCollection("D_Product")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, db.collection("D_Product").createIndex({ name: 1 }, { unique: true })];
                case 5:
                    _a.sent();
                    console.log("Colección 'D_Product' creada.");
                    _a.label = 6;
                case 6: return [4 /*yield*/, db.listCollections({ name: "D_User" }).hasNext()];
                case 7:
                    if (!!(_a.sent())) return [3 /*break*/, 10];
                    return [4 /*yield*/, db.createCollection("D_User")];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, db.collection("D_User").createIndex({ email: 1 }, { unique: true })];
                case 9:
                    _a.sent();
                    console.log("Colección 'D_User' creada.");
                    _a.label = 10;
                case 10: return [4 /*yield*/, db.listCollections({ name: "D_Order" }).hasNext()];
                case 11:
                    if (!!(_a.sent())) return [3 /*break*/, 14];
                    return [4 /*yield*/, db.createCollection("D_Order")];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, db.collection("D_Order").createIndex({ userId: 1 })];
                case 13:
                    _a.sent();
                    console.log("Colección 'D_Order' creada.");
                    _a.label = 14;
                case 14: return [4 /*yield*/, db.listCollections({ name: "d_order_products_d_product" }).hasNext()];
                case 15:
                    if (!!(_a.sent())) return [3 /*break*/, 19];
                    return [4 /*yield*/, db.createCollection("d_order_products_d_product")];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, db.collection("d_order_products_d_product").createIndex({ dOrderId: 1 })];
                case 17:
                    _a.sent();
                    return [4 /*yield*/, db.collection("d_order_products_d_product").createIndex({ dProductId: 1 })];
                case 18:
                    _a.sent();
                    console.log("Colección 'd_order_products_d_product' creada.");
                    _a.label = 19;
                case 19:
                    console.log("Estructura de la base de datos creada correctamente.");
                    return [3 /*break*/, 23];
                case 20:
                    error_1 = _a.sent();
                    console.error("Error al inicializar la base de datos:", error_1);
                    return [3 /*break*/, 23];
                case 21: return [4 /*yield*/, client.close()];
                case 22:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 23: return [2 /*return*/];
            }
        });
    });
}
initializeDatabase();
