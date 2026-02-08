var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express3 from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import nodemailer from "nodemailer";

// src/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum UserRole {\n  CUSTOMER\n  PROVIDER\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  SUSPENDED\n}\n\nenum OrderStatus {\n  PLACED\n  DELIVERED\n  CANCELLED\n}\n\nenum DietaryType {\n  VEG\n  NON_VEG\n  HALAL\n}\n\nmodel ProviderProfile {\n  id             String  @id @default(uuid())\n  userId         String  @unique\n  restaurantName String  @db.Text\n  description    String? @db.Text\n  address        String?\n  phone          String?\n  meals          Meal[]\n  orders         Order[]\n\n  user User @relation(fields: [userId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\nmodel Category {\n  id        String   @id @default(uuid())\n  name      String   @unique @db.VarChar(100)\n  meals     Meal[]\n  createdAt DateTime @default(now())\n}\n\nmodel Meal {\n  id          String          @id @default(uuid())\n  title       String          @db.VarChar(225)\n  description String?         @db.Text\n  price       Decimal         @db.Decimal(10, 2)\n  image       String?\n  dietaryType DietaryType\n  categoryId  String\n  providerId  String\n  provider    ProviderProfile @relation(fields: [providerId], references: [id])\n  category    Category        @relation(fields: [categoryId], references: [id])\n  isAvailable Boolean         @default(true)\n  orderItems  OrderItem[]\n  reviews     Review[] // Added relation to OrderItem\n  createdAt   DateTime        @default(now())\n\n  @@index([providerId])\n  @@index([categoryId])\n}\n\nmodel Order {\n  id              String          @id @default(uuid())\n  customerId      String\n  providerId      String\n  customer        User            @relation("CustomerOrders", fields: [customerId], references: [id])\n  provider        ProviderProfile @relation(fields: [providerId], references: [id])\n  totalPrice      Decimal         @db.Decimal(10, 2)\n  deliveryAddress String\n  status          OrderStatus     @default(PLACED)\n  items           OrderItem[]\n  reviews         Review[]\n  createdAt       DateTime        @default(now())\n\n  @@index([providerId])\n  @@index([customerId])\n}\n\nmodel OrderItem {\n  id       String  @id @default(uuid())\n  orderId  String\n  mealId   String\n  price    Decimal @db.Decimal(10, 2)\n  quantity Int\n\n  order Order @relation(fields: [orderId], references: [id])\n  meal  Meal  @relation(fields: [mealId], references: [id])\n\n  @@unique([orderId, mealId])\n  @@index([orderId])\n  @@index([mealId])\n}\n\nmodel Review {\n  id      String  @id @default(uuid())\n  rating  Int\n  comment String?\n\n  mealId  String\n  orderId String\n\n  meal      Meal     @relation(fields: [mealId], references: [id])\n  order     Order    @relation(fields: [orderId], references: [id])\n  createdAt DateTime @default(now())\n\n  @@unique([orderId, mealId])\n}\n\nmodel User {\n  id              String           @id\n  name            String\n  email           String\n  emailVerified   Boolean          @default(false)\n  image           String?\n  createdAt       DateTime         @default(now())\n  updatedAt       DateTime         @updatedAt\n  sessions        Session[]\n  accounts        Account[]\n  providerProfile ProviderProfile?\n  orders          Order[]          @relation("CustomerOrders")\n\n  role   UserRole   @default(CUSTOMER)\n  status UserStatus @default(ACTIVE)\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"ProviderProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"restaurantName","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"meals","kind":"object","type":"Meal","relationName":"MealToProviderProfile"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToProviderProfile"},{"name":"user","kind":"object","type":"User","relationName":"ProviderProfileToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"meals","kind":"object","type":"Meal","relationName":"CategoryToMeal"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Meal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"image","kind":"scalar","type":"String"},{"name":"dietaryType","kind":"enum","type":"DietaryType"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"MealToProviderProfile"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMeal"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MealToOrderItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"MealToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"CustomerOrders"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"OrderToProviderProfile"},{"name":"totalPrice","kind":"scalar","type":"Decimal"},{"name":"deliveryAddress","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"OrderToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToOrderItem"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToReview"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"providerProfile","kind":"object","type":"ProviderProfile","relationName":"ProviderProfileToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"CustomerOrders"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  MealScalarFieldEnum: () => MealScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  OrderItemScalarFieldEnum: () => OrderItemScalarFieldEnum,
  OrderScalarFieldEnum: () => OrderScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  ProviderProfileScalarFieldEnum: () => ProviderProfileScalarFieldEnum,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  ProviderProfile: "ProviderProfile",
  Category: "Category",
  Meal: "Meal",
  Order: "Order",
  OrderItem: "OrderItem",
  Review: "Review",
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var ProviderProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  restaurantName: "restaurantName",
  description: "description",
  address: "address",
  phone: "phone",
  createdAt: "createdAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  createdAt: "createdAt"
};
var MealScalarFieldEnum = {
  id: "id",
  title: "title",
  description: "description",
  price: "price",
  image: "image",
  dietaryType: "dietaryType",
  categoryId: "categoryId",
  providerId: "providerId",
  isAvailable: "isAvailable",
  createdAt: "createdAt"
};
var OrderScalarFieldEnum = {
  id: "id",
  customerId: "customerId",
  providerId: "providerId",
  totalPrice: "totalPrice",
  deliveryAddress: "deliveryAddress",
  status: "status",
  createdAt: "createdAt"
};
var OrderItemScalarFieldEnum = {
  id: "id",
  orderId: "orderId",
  mealId: "mealId",
  price: "price",
  quantity: "quantity"
};
var ReviewScalarFieldEnum = {
  id: "id",
  rating: "rating",
  comment: "comment",
  mealId: "mealId",
  orderId: "orderId",
  createdAt: "createdAt"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  status: "status"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var OrderStatus = {
  PLACED: "PLACED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"FoodHub" <foodhub@ph.com>',
          to: user.email,
          subject: "Please verify your email!",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .header {
      background-color: #0f172a;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      font-size: 22px;
    }

    .content {
      padding: 30px;
      color: #334155;
      line-height: 1.6;
    }

    .content h2 {
      margin-top: 0;
      font-size: 20px;
      color: #0f172a;
    }

    .button-wrapper {
      text-align: center;
      margin: 30px 0;
    }

    .verify-button {
      background-color: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      font-weight: bold;
      border-radius: 6px;
      display: inline-block;
    }

    .verify-button:hover {
      background-color: #1d4ed8;
    }

    .footer {
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
    }

    .link {
      word-break: break-all;
      font-size: 13px;
      color: #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>FoodHub</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Verify Your Email Address</h2>
      <p>
        Hello ${user.name} <br /><br />
        Thank you for registering on <strong>FoodHub</strong>.
        Please confirm your email address to activate your account.
      </p>

      <div class="button-wrapper">
        <a href="${verificationUrl}" class="verify-button">
          Verify Email
        </a>
      </div>

      <p>
        If the button doesn\u2019t work, copy and paste the link below into your browser:
      </p>

      <p class="link">
        ${verificationUrl}
      </p>

      <p>
        This verification link will expire soon for security reasons.
        If you did not create an account, you can safely ignore this email.
      </p>

      <p>
        Regards, <br />
        <strong>FoodHub Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      \xA9 2025 FoodHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`
        });
        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
});

// src/middlewares/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your creditials!";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Can't reach database server";
    }
  }
  res.status(statusCode);
  res.json({
    message: errorMessage,
    error: errorDetails
  });
}
var globalErrorHandler_default = errorHandler;

// src/modules/admin/admin.route.ts
import { Router } from "express";

// src/middlewares/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required. Please verfiy your email!"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resources!"
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
var auth_default = auth2;

// src/modules/admin/admin.service.ts
var getAllUsers = async () => {
  return await prisma.user.findMany({
    where: {
      role: {
        not: "ADMIN"
      }
    }
  });
};
var updateUserStatus = async (userId, status) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  return await prisma.user.update({
    where: { id: userId },
    data: { status }
  });
};
var getAllOrders = async () => {
  return await prisma.order.findMany({
    include: { items: true, reviews: true },
    orderBy: { createdAt: "desc" }
  });
};
var getAllCategories = async () => {
  return await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
};
var updateCategory = async (categoryId, data) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) throw new Error("Category not found");
  return await prisma.category.update({ where: { id: categoryId }, data });
};
var deleteCategory = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) throw new Error("Category not found");
  return await prisma.category.delete({ where: { id: categoryId } });
};
var getAdminStats = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalProviders,
    suspendedUsers,
    totalMeals,
    activeMeals,
    totalCategories,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    revenue
  ] = await Promise.all([
    // Users
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    // Meals & categories
    prisma.meal.count(),
    prisma.meal.count({ where: { isAvailable: true } }),
    prisma.category.count(),
    // Orders
    prisma.order.count(),
    prisma.order.count({ where: { status: "PLACED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    // Revenue
    prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalPrice: true }
    })
  ]);
  return {
    users: {
      total: totalUsers,
      customers: totalCustomers,
      providers: totalProviders,
      suspended: suspendedUsers
    },
    meals: {
      total: totalMeals,
      active: activeMeals
    },
    categories: totalCategories,
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    },
    revenue: revenue._sum.totalPrice || 0
  };
};
var adminService = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getAdminStats
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};
var updateUserStatus2 = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const updatedUser = await adminService.updateUserStatus(
      userId,
      status
    );
    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
};
var getAllOrders2 = async (req, res, next) => {
  try {
    const orders = await adminService.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};
var getAllCategories2 = async (req, res, next) => {
  try {
    const categories = await adminService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};
var updateCategory2 = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await adminService.updateCategory(
      categoryId,
      req.body
    );
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};
var deleteCategory2 = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    await adminService.deleteCategory(categoryId);
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};
var getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
var adminController = {
  getAllUsers: getAllUsers2,
  updateUserStatus: updateUserStatus2,
  getAllOrders: getAllOrders2,
  getAllCategories: getAllCategories2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2,
  getAdminDashboard
};

// src/modules/admin/admin.route.ts
var router = Router();
router.get("/", auth_default("ADMIN" /* ADMIN */), adminController.getAdminDashboard);
router.get("/users", auth_default("ADMIN" /* ADMIN */), adminController.getAllUsers);
router.patch(
  "/:userId/status",
  auth_default("ADMIN" /* ADMIN */),
  adminController.updateUserStatus
);
router.get("/orders", auth_default("ADMIN" /* ADMIN */), adminController.getAllOrders);
router.get(
  "/categories",
  auth_default("ADMIN" /* ADMIN */),
  adminController.getAllCategories
);
router.patch(
  "/categories/:categoryId",
  auth_default("ADMIN" /* ADMIN */),
  adminController.updateCategory
);
router.delete(
  "/categories/:categoryId",
  auth_default("ADMIN" /* ADMIN */),
  adminController.deleteCategory
);
var AdminRoutes = router;

// src/modules/category/category.route.ts
import { Router as Router2 } from "express";

// src/modules/category/category.service.ts
var createCategory = async (name) => {
  const existing = await prisma.category.findUnique({
    where: { name }
  });
  if (existing) {
    throw new Error("Category already exists");
  }
  return prisma.category.create({
    data: { name }
  });
};
var getAllCategories3 = async () => {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" }
  });
};
var CategoryService = {
  createCategory,
  getAllCategories: getAllCategories3
};

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }
    const category = await CategoryService.createCategory(name.trim());
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    if (error.message === "Category already exists") {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
  }
};
var getAllCategories4 = async (req, res, next) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
var CategoryController = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories4
};

// src/modules/category/category.route.ts
var router2 = Router2();
router2.post("/", auth_default("ADMIN" /* ADMIN */), CategoryController.createCategory);
router2.get("/", CategoryController.getAllCategories);
var CategoryRoutes = router2;

// src/modules/meal/meal.router.ts
import express from "express";

// src/helpers/paginationSortingHelper.ts
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var paginationSortingHelper_default = paginationSortingHelper;

// src/modules/meal/meal.service.ts
var createMeal = async (data) => {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId }
  });
  if (!category) throw new Error("Category not found");
  const provider = await prisma.providerProfile.findUnique({
    where: { id: data.providerId }
  });
  if (!provider) throw new Error("Provider profile not found");
  return prisma.meal.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() ?? null,
      image: data.image?.trim() ?? null,
      price: data.price,
      dietaryType: data.dietaryType,
      categoryId: data.categoryId,
      providerId: data.providerId
    }
  });
};
var getMeals = async (query) => {
  const { cuisine, dietary, minPrice, maxPrice, search } = query;
  const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(query);
  const where = {
    isAvailable: true
  };
  if (dietary) {
    where.dietaryType = dietary;
  }
  if (cuisine) {
    where.category = {
      name: {
        equals: cuisine,
        mode: "insensitive"
      }
    };
  }
  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive"
    };
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }
  const meals = await prisma.meal.findMany({
    where,
    include: {
      category: true,
      reviews: true,
      provider: {
        select: {
          id: true,
          restaurantName: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const total = await prisma.meal.count({
    where
  });
  return {
    meals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getMealById = async (id) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: { category: true, provider: true, reviews: true }
  });
  if (!meal) {
    const error = new Error("Meal not found");
    error.statusCode = 404;
    throw error;
  }
  return meal;
};
var updateMeal = async (userId, data) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId }
  });
  if (!provider) {
    throw new Error("Provider profile not found");
  }
  const meal = await prisma.meal.findFirst({
    where: {
      id: data.id,
      providerId: provider.id
    }
  });
  if (!meal) {
    throw new Error("Meal not found or access denied");
  }
  return await prisma.meal.update({
    where: { id: data.id },
    data: {
      ...data.title && { title: data.title },
      ...data.description && { description: data.description },
      ...data.price && { price: data.price },
      ...data.image && { image: data.image },
      ...data.categoryId && { categoryId: data.categoryId },
      ...data.isAvailable !== void 0 && {
        isAvailable: data.isAvailable
      }
    }
  });
};
var deleteMeal = async (userId, mealId) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId }
  });
  if (!provider) {
    throw new Error("Provider profile not found");
  }
  const meal = await prisma.meal.findFirst({
    where: {
      id: mealId,
      providerId: provider.id
    }
  });
  if (!meal) {
    throw new Error("Meal not found or access denied");
  }
  await prisma.meal.update({
    where: { id: mealId },
    data: {
      isAvailable: false
    }
  });
};
var mealService = {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal
};

// src/modules/meal/meal.controller.ts
var createMeal2 = async (req, res, next) => {
  try {
    const { title, description, price, image, categoryId, dietaryType } = req.body;
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!provider) {
      return res.status(403).json({
        success: false,
        message: "Provider not found. Create profile first."
      });
    }
    const meal = await mealService.createMeal({
      title,
      description,
      price,
      image,
      categoryId,
      dietaryType,
      providerId: provider.id
    });
    res.status(201).json({ success: true, data: meal });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};
var getAllMeals = async (req, res, next) => {
  try {
    const meals = await mealService.getMeals(req.query);
    res.status(200).json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
};
var getMeal = async (req, res, next) => {
  try {
    const meal = await mealService.getMealById(req.params.id);
    res.status(200).json({ success: true, data: meal });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
var updateMeal2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;
    const meal = await mealService.updateMeal(userId, data);
    res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};
var deleteMeal2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mealId } = req.params;
    await mealService.deleteMeal(userId, mealId);
    res.status(200).json({
      success: true,
      message: "Meal removed successfully"
    });
  } catch (error) {
    next(error);
  }
};
var mealController = {
  createMeal: createMeal2,
  getAllMeals,
  getMeal,
  updateMeal: updateMeal2,
  deleteMeal: deleteMeal2
};

// src/modules/meal/meal.router.ts
var router3 = express.Router();
router3.post("/", auth_default("PROVIDER" /* PROVIDER */), mealController.createMeal);
router3.patch("/", auth_default("PROVIDER" /* PROVIDER */), mealController.updateMeal);
router3.delete("/:mealId", auth_default("PROVIDER" /* PROVIDER */), mealController.deleteMeal);
router3.get("/", mealController.getAllMeals);
router3.get("/:id", mealController.getMeal);
var mealRouter = router3;

// src/modules/order/order.route.ts
import express2 from "express";

// src/modules/order/order.service.ts
var createOrder = async (data) => {
  return await prisma.$transaction(async (tx) => {
    const mealIds = data.items.map((item) => item.mealId);
    const meals = await tx.meal.findMany({
      where: { id: { in: mealIds }, isAvailable: true }
    });
    let totalPrice = 0;
    const orderItemsData = data.items.map((item) => {
      const meal = meals.find((m) => m.id === item.mealId);
      const itemTotal = Number(meal.price) * item.quantity;
      totalPrice += itemTotal;
      return {
        mealId: meal.id,
        quantity: item.quantity,
        price: meal.price
      };
    });
    const order = await tx.order.create({
      data: {
        customerId: data.customerId,
        providerId: data.providerId,
        deliveryAddress: data.deliveryAddress,
        totalPrice,
        status: OrderStatus.PLACED,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });
    return order;
  });
};
var getProviderOrders = async (providerId) => {
  const result = await prisma.order.findMany({
    where: { providerId },
    include: {
      items: {
        include: {
          meal: true
        }
      },
      customer: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var getCustomerOrders = async (customerId) => {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          meal: true
        }
      },
      provider: {
        select: { id: true, restaurantName: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getOrderById = async (orderId, customerId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId
    },
    include: {
      provider: {
        select: {
          id: true,
          restaurantName: true
        }
      },
      items: {
        include: {
          meal: {
            select: {
              id: true,
              title: true,
              image: true
            }
          }
        }
      }
    }
  });
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  return order;
};
var updateOrderStatus = async (orderId, status, providerId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.providerId !== providerId) {
    throw new Error("Forbidden: Not your order");
  }
  return prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
};
var orderService = {
  createOrder,
  getProviderOrders,
  getCustomerOrders,
  updateOrderStatus,
  getOrderById
};

// src/modules/order/order.controller.ts
var createOrder2 = async (req, res, next) => {
  try {
    const order = await orderService.createOrder({
      customerId: req.user.id,
      ...req.body
    });
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order
    });
  } catch (err) {
    next(err);
  }
};
var getProviderOrders2 = async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!provider) {
      return res.status(403).json({ message: "Provider profile not found" });
    }
    const providerId = provider.id;
    const orders = await orderService.getProviderOrders(providerId);
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
var getMyOrders = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const orders = await orderService.getCustomerOrders(customerId);
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
var getOrderById2 = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;
    const order = await orderService.getOrderById(id, customerId);
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
var updateOrderStatus2 = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!provider) {
      return res.status(403).json({ message: "Provider profile not found" });
    }
    const updateOrderStatus3 = await orderService.updateOrderStatus(
      id,
      status,
      provider.id
    );
    res.status(200).json({
      success: true,
      data: updateOrderStatus3
    });
  } catch (error) {
    next(error);
  }
};
var orderController = {
  createOrder: createOrder2,
  getProviderOrders: getProviderOrders2,
  getMyOrders,
  getOrderById: getOrderById2,
  updateOrderStatus: updateOrderStatus2
};

// src/modules/order/order.route.ts
var router4 = express2.Router();
router4.post("/", auth_default("CUSTOMER" /* CUSTOMER */), orderController.createOrder);
router4.get(
  "/provider",
  auth_default("PROVIDER" /* PROVIDER */),
  orderController.getProviderOrders
);
router4.get("/me", auth_default("CUSTOMER" /* CUSTOMER */), orderController.getMyOrders);
router4.get("/:id", auth_default("CUSTOMER" /* CUSTOMER */), orderController.getOrderById);
router4.patch(
  "/:id/status",
  auth_default("PROVIDER" /* PROVIDER */),
  orderController.updateOrderStatus
);
var orderRouter = router4;

// src/modules/profile/profile.route.ts
import { Router as Router5 } from "express";

// src/modules/profile/profile.service.ts
var updateUserProfile = async (userId, name, image) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      image
    }
  });
  return updatedUser;
};
var profileService = {
  updateUserProfile
};

// src/modules/profile/profile.controller.ts
var updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, image } = req.body;
    const updatedProfile = await profileService.updateUserProfile(
      userId,
      name,
      image
    );
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};
var profileController = {
  updateProfile
};

// src/modules/profile/profile.route.ts
var router5 = Router5();
router5.put("/", auth_default(), profileController.updateProfile);
var ProfileRoutes = router5;

// src/modules/provider/provider.route.ts
import { Router as Router6 } from "express";

// src/modules/provider/provider.service.ts
var createProviderProfile = async (data) => {
  const existing = await prisma.providerProfile.findUnique({
    where: { userId: data.userId }
  });
  if (existing) {
    throw new Error("Provider profile already exists for this user");
  }
  return prisma.providerProfile.create({
    data: {
      restaurantName: data.restaurantName,
      description: data.description ?? null,
      address: data.address ?? null,
      phone: data.phone ?? null,
      userId: data.userId
    }
  });
};
var updateProviderProfile = async (userId, data) => {
  const existing = await prisma.providerProfile.findUnique({
    where: { userId }
  });
  if (!existing) {
    throw new Error("Provider profile does not exist for this user");
  }
  return prisma.providerProfile.update({
    where: { userId },
    data: {
      restaurantName: data.restaurantName ?? existing.restaurantName,
      description: data.description ?? existing.description,
      address: data.address ?? existing.address,
      phone: data.phone ?? existing.phone
    }
  });
};
var getProviderByUserId = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      providerProfile: {
        include: {
          _count: {
            select: {
              meals: true,
              orders: true
            }
          }
        }
      }
    }
  });
  if (!user || !user.providerProfile) {
    const error = new Error("Provider not found");
    error.statusCode = 404;
    throw error;
  }
  return {
    ...user,
    providerProfile: {
      ...user.providerProfile,
      totalMeals: user.providerProfile._count.meals,
      totalOrders: user.providerProfile._count.orders
    }
  };
};
var getProvider = async (id) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      meals: true,
      orders: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  if (!provider) {
    const error = new Error("Provider not found");
    error.statusCode = 404;
    throw error;
  }
  return provider;
};
var getAllProviders = async () => {
  return prisma.providerProfile.findMany({
    include: { meals: true },
    orderBy: { createdAt: "desc" }
  });
};
var getProviderDashboard = async (userId) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      meals: {
        include: {
          category: true,
          _count: {
            select: {
              orderItems: true
            }
          }
        }
      },
      orders: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  if (!provider) {
    const error = new Error("Provider not found");
    error.statusCode = 404;
    throw error;
  }
  const [activeMeals, pendingOrders, deliveredOrders, revenue] = await Promise.all([
    prisma.meal.count({
      where: {
        providerId: provider.id,
        isAvailable: true
      }
    }),
    prisma.order.count({
      where: {
        providerId: provider.id,
        status: "PLACED"
      }
    }),
    prisma.order.count({
      where: {
        providerId: provider.id,
        status: "DELIVERED"
      }
    }),
    prisma.order.aggregate({
      where: {
        providerId: provider.id,
        status: "DELIVERED"
      },
      _sum: {
        totalPrice: true
      }
    })
  ]);
  return {
    provider,
    stats: {
      activeMeals,
      pendingOrders,
      deliveredOrders,
      totalRevenue: revenue._sum.totalPrice || 0
    }
  };
};
var ProviderService = {
  createProviderProfile,
  getProvider,
  getAllProviders,
  updateProviderProfile,
  getProviderByUserId,
  getProviderDashboard
};

// src/modules/provider/provider.controller.ts
var createProvider = async (req, res, next) => {
  try {
    const { restaurantName, description, address, phone } = req.body;
    if (!restaurantName || !restaurantName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required"
      });
    }
    const provider = await ProviderService.createProviderProfile({
      restaurantName: restaurantName.trim(),
      description,
      address,
      phone,
      userId: req.user.id
    });
    res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      data: provider
    });
  } catch (error) {
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
var updateProvider = async (req, res, next) => {
  try {
    const { restaurantName, description, address, phone } = req.body;
    const provider = await ProviderService.updateProviderProfile(req.user.id, {
      restaurantName,
      description,
      address,
      phone
    });
    res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      data: provider
    });
  } catch (error) {
    next(error);
  }
};
var getProviderProfile = async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByUserId(req.user.id);
    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    next(error);
  }
};
var getProvider2 = async (req, res, next) => {
  try {
    const provider = await ProviderService.getProvider(req.params.id);
    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
var getAllProviders2 = async (req, res, next) => {
  try {
    const providers = await ProviderService.getAllProviders();
    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    next(error);
  }
};
var getProviderDashboard2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await ProviderService.getProviderDashboard(userId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
var ProviderController = {
  createProvider,
  getProvider: getProvider2,
  getAllProviders: getAllProviders2,
  updateProvider,
  getProviderProfile,
  getProviderDashboard: getProviderDashboard2
};

// src/modules/provider/provider.route.ts
var router6 = Router6();
router6.post("/", auth_default("PROVIDER" /* PROVIDER */), ProviderController.createProvider);
router6.put("/", auth_default("PROVIDER" /* PROVIDER */), ProviderController.updateProvider);
router6.get(
  "/dashboard",
  auth_default("PROVIDER" /* PROVIDER */),
  ProviderController.getProviderDashboard
);
router6.get(
  "/profile",
  auth_default("PROVIDER" /* PROVIDER */),
  ProviderController.getProviderProfile
);
router6.get("/", ProviderController.getAllProviders);
router6.get("/:id", ProviderController.getProvider);
var ProviderRoutes = router6;

// src/modules/review/review.route.ts
import { Router as Router7 } from "express";

// src/modules/review/review.service.ts
var createReviewService = async (input, customerId) => {
  const { orderId, mealId, rating, comment } = input;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  if (!order) {
    throw { statusCode: 404, message: "Order not found" };
  }
  if (order.customerId !== customerId) {
    throw {
      statusCode: 403,
      message: "You can only review your own orders"
    };
  }
  const mealInOrder = order.items.some((item) => item.mealId === mealId);
  if (!mealInOrder) {
    throw {
      statusCode: 400,
      message: "This meal was not part of the order"
    };
  }
  const existingReview = await prisma.review.findUnique({
    where: {
      orderId_mealId: {
        orderId,
        mealId
      }
    }
  });
  if (existingReview) {
    throw {
      statusCode: 400,
      message: "You have already reviewed this meal for this order"
    };
  }
  const review = await prisma.review.create({
    data: {
      orderId,
      mealId,
      rating,
      comment
    }
  });
  return review;
};
var getMealReviewsService = async (mealId) => {
  return prisma.review.findMany({
    where: { mealId },
    include: {
      order: { select: { customer: { select: { name: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var reviewService = {
  createReviewService,
  getMealReviewsService
};

// src/modules/review/review.controller.ts
var createReview = async (req, res) => {
  try {
    const data = req.body;
    const customerId = req.user.id;
    const review = await reviewService.createReviewService(data, customerId);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(statusCode).json({ success: false, message });
  }
};
var getMealReviews = async (req, res, next) => {
  try {
    const { mealId } = req.params;
    const reviews = await reviewService.getMealReviewsService(mealId);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};
var reviewController = {
  createReview,
  getMealReviews
};

// src/modules/review/review.route.ts
var router7 = Router7();
router7.post("/", auth_default("CUSTOMER" /* CUSTOMER */), reviewController.createReview);
router7.get("/meals/:mealId", reviewController.getMealReviews);
var reviewRoutes = router7;

// src/app.ts
var app = express3();
app.use(express3.json());
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    // client side url
    credentials: true
  })
);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/categories", CategoryRoutes);
app.use("/api/providers", ProviderRoutes);
app.use("/api/meals", mealRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/profile", ProfileRoutes);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use(globalErrorHandler_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
