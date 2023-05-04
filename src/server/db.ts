import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: Omit<PrismaClient, "$use"> | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends({
    query: {
      note: {
        async findMany({ query, args }) {
          if (args.where) {
            args.where = { AND: [args.where, { deletedAt: null }] };
          } else {
            args.where = {
              deletedAt: null,
            };
          }

          return query(args);
        },
      },
    },
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
