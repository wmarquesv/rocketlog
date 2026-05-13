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

// src/routes/sessionRoutes.ts
var sessionRoutes_exports = {};
__export(sessionRoutes_exports, {
  sessionRoutes: () => sessionRoutes
});
module.exports = __toCommonJS(sessionRoutes_exports);
var import_express = __toESM(require("express"));

// src/utils/appError.ts
var AppError = class {
  message;
  statusCode;
  constructor(message, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
};

// src/env.ts
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string().url(),
  JWT_SECRET: import_zod.z.string(),
  PORT: import_zod.z.coerce.number().default(3333)
});
var env = envSchema.parse(process.env);

// src/configs/auth.ts
var authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIN: "1d"
  }
};

// src/database/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: process.env.NODE_ENV === "production" ? [] : ["query"]
});

// src/controllers/SessionsController.ts
var import_zod2 = require("zod");
var import_jsonwebtoken = require("jsonwebtoken");
var import_bcrypt = require("bcrypt");
var SessionsController = class {
  async create(request, response) {
    const bodySchema = import_zod2.z.object({
      email: import_zod2.z.string().email(),
      password: import_zod2.z.string().min(6)
    });
    const { email, password } = bodySchema.parse(request.body);
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new AppError("Email ou senha incorretos", 401);
    }
    const passwordMatched = await (0, import_bcrypt.compare)(password, user.password);
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
var sessionRoutes = (0, import_express.default)();
var sessionsController = new SessionsController();
sessionRoutes.post("/", sessionsController.create);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sessionRoutes
});
