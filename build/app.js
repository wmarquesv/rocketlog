"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_express6 = __toESM(require("express"));
var import_express_async_errors = require("express-async-errors");

// src/routes/index.ts
var import_express5 = require("express");

// src/routes/usersRoutes.ts
var import_express = require("express");

// src/database/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: process.env.NODE_ENV === "production" ? [] : ["query"]
});

// src/controllers/usersController.ts
var import_zod = require("zod");
var import_bcrypt = require("bcrypt");

// src/utils/appError.ts
var AppError = class {
  message;
  statusCode;
  constructor(message, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
};

// src/controllers/usersController.ts
var UsersController = class {
  async create(request, response) {
    const bodySchema = import_zod.z.object({
      name: import_zod.z.string().min(1).trim(),
      email: import_zod.z.string().email(),
      password: import_zod.z.string().min(6)
    });
    const { name, email, password } = bodySchema.parse(request.body);
    const userWithSameEmail = await prisma.user.findFirst({ where: { email } });
    if (userWithSameEmail) {
      throw new AppError("Usu\xE1rio com esse email j\xE1 existe");
    }
    const hashedPassword = await (0, import_bcrypt.hash)(password, 8);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    const { password: _, ...UserWithoutPassword } = user;
    return response.status(201).json(UserWithoutPassword);
  }
};

// src/routes/usersRoutes.ts
var usersRoutes = (0, import_express.Router)();
var usersController = new UsersController();
usersRoutes.post("/", usersController.create);

// src/routes/sessionRoutes.ts
var import_express2 = __toESM(require("express"));

// src/env.ts
var import_zod2 = require("zod");
var envSchema = import_zod2.z.object({
  DATABASE_URL: import_zod2.z.string().url(),
  JWT_SECRET: import_zod2.z.string(),
  PORT: import_zod2.z.coerce.number().default(3333)
});
var env = envSchema.parse(process.env);

// src/configs/auth.ts
var authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIN: "1d"
  }
};

// src/controllers/SessionsController.ts
var import_zod3 = require("zod");
var import_jsonwebtoken = require("jsonwebtoken");
var import_bcrypt2 = require("bcrypt");
var SessionsController = class {
  async create(request, response) {
    const bodySchema = import_zod3.z.object({
      email: import_zod3.z.string().email(),
      password: import_zod3.z.string().min(6)
    });
    const { email, password } = bodySchema.parse(request.body);
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new AppError("Email ou senha incorretos", 401);
    }
    const passwordMatched = await (0, import_bcrypt2.compare)(password, user.password);
    if (!passwordMatched) {
      throw new AppError("Email ou senha incorretos", 401);
    }
    const { secret, expiresIN } = authConfig.jwt;
    const token = (0, import_jsonwebtoken.sign)({ role: user.role ?? "customer" }, secret, {
      subject: user.id,
      expiresIn: expiresIN
    });
    const { password: hashedPassword, ...userWithoutPassword } = user;
    return response.json({ token, user: userWithoutPassword });
  }
};

// src/routes/sessionRoutes.ts
var sessionRoutes = (0, import_express2.default)();
var sessionsController = new SessionsController();
sessionRoutes.post("/", sessionsController.create);

// src/routes/deliveriesRoutes.ts
var import_express3 = require("express");

// src/controllers/deliveriesController.ts
var import_zod4 = require("zod");
var DeliveriesController = class {
  async create(request, response) {
    const bodySchema = import_zod4.z.object({
      user_id: import_zod4.z.string().uuid(),
      description: import_zod4.z.string()
    });
    const { user_id, description } = bodySchema.parse(request.body);
    await prisma.delivery.create({
      data: {
        userId: user_id,
        description
      }
    });
    response.status(201).json();
  }
  async index(request, response) {
    const deliveries = await prisma.delivery.findMany({
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    return response.json(deliveries);
  }
};

// src/controllers/deliveriesStatusController.ts
var import_zod5 = require("zod");
var DeliveriesStatusController = class {
  async update(request, response) {
    const paramsSchema = import_zod5.z.object({
      id: import_zod5.z.string().uuid()
    });
    const bodySchema = import_zod5.z.object({
      status: import_zod5.z.enum(["processing", "shipped", "delivered"])
    });
    const { id } = paramsSchema.parse(request.params);
    const { status } = bodySchema.parse(request.body);
    await prisma.delivery.update({
      data: {
        status
      },
      where: {
        id
      }
    });
    await prisma.deliveryLog.create({
      data: {
        deliveryId: id,
        description: status
      }
    });
    return response.json();
  }
};

// src/middlewares/ensureAuthenticated.ts
var import_jsonwebtoken2 = require("jsonwebtoken");
function ensureAuthenticated(request, response, next) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new AppError("JWT token not found.", 401);
    }
    const [, token] = authHeader.split(" ");
    const { role, sub: user_id } = (0, import_jsonwebtoken2.verify)(
      token,
      authConfig.jwt.secret
    );
    request.user = {
      id: user_id,
      role
    };
    return next();
  } catch (error) {
    throw new AppError("Invalid JWT token.", 401);
  }
}

// src/middlewares/verifyUserAuthorization.ts
function verifyUserAuthorization(role) {
  return (request, response, next) => {
    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }
    if (!role.includes(request.user.role)) {
      throw new AppError("Unauthorized", 401);
    }
    return next();
  };
}

// src/routes/deliveriesRoutes.ts
var deliveriesRoutes = (0, import_express3.Router)();
var deliveriesController = new DeliveriesController();
var deliveriesStatusController = new DeliveriesStatusController();
deliveriesRoutes.use(ensureAuthenticated);
deliveriesRoutes.use(verifyUserAuthorization(["sale"]));
deliveriesRoutes.post("/", deliveriesController.create);
deliveriesRoutes.get("/", deliveriesController.index);
deliveriesRoutes.patch("/:id/status", deliveriesStatusController.update);

// src/routes/deliveriesLogsRoutes.ts
var import_express4 = require("express");

// src/controllers/deliveryLogsController.ts
var import_zod6 = require("zod");
var DeliveryLogsController = class {
  async create(request, response) {
    const bodySchema = import_zod6.z.object({
      delivery_id: import_zod6.z.string().uuid(),
      description: import_zod6.z.string()
    });
    const { delivery_id, description } = bodySchema.parse(request.body);
    const delivery = await prisma.delivery.findUnique({
      where: { id: delivery_id }
    });
    if (!delivery) {
      throw new AppError("Delivery not found", 404);
    }
    if (delivery.status === "delivered") {
      throw new AppError("this order has already been delivered");
    }
    if (delivery.status === "processing") {
      throw new AppError("change status to shipped");
    }
    await prisma.deliveryLog.create({
      data: {
        deliveryId: delivery_id,
        description
      }
    });
    return response.status(201).json();
  }
  async show(request, response) {
    const paramsSchema = import_zod6.z.object({
      delivery_id: import_zod6.z.string().uuid()
    });
    const { delivery_id } = paramsSchema.parse(request.params);
    const delivery = await prisma.delivery.findUnique({
      where: { id: delivery_id },
      include: {
        user: true,
        Logs: true
      }
    });
    if (request.user?.role === "customer" && request.user.id !== delivery?.userId) {
      throw new AppError("the user can only view their deliveries", 401);
    }
    return response.json(delivery);
  }
};

// src/routes/deliveriesLogsRoutes.ts
var deliveryLogsRoutes = (0, import_express4.Router)();
var deliveryLogsController = new DeliveryLogsController();
deliveryLogsRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["sale"]),
  deliveryLogsController.create
);
deliveryLogsRoutes.get(
  "/:delivery_id/show",
  ensureAuthenticated,
  verifyUserAuthorization(["sale", "customer"]),
  deliveryLogsController.show
);

// src/routes/index.ts
var routes = (0, import_express5.Router)();
routes.use("/users", usersRoutes);
routes.use("/sessions", sessionRoutes);
routes.use("/deliveries", deliveriesRoutes);
routes.use("/deliveryLogs", deliveryLogsRoutes);

// src/middlewares/errorHandling.ts
var import_zod7 = require("zod");
function errorHandling(error, request, response, next) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }
  if (error instanceof import_zod7.ZodError) {
    return response.status(400).json({
      message: "validation error",
      issues: error.format()
    });
  }
  return response.status(500).json({ message: error.message });
}

// src/app.ts
var app = (0, import_express6.default)();
app.use(import_express6.default.json());
app.use(routes);
app.use(errorHandling);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
