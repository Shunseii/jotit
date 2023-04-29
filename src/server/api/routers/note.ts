import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const noteRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany();
  }),

  create: protectedProcedure
    .input(z.object({ content: z.string(), renderId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { content, renderId } = input;
      const { userId } = ctx.auth;

      return ctx.prisma.note.create({ data: { userId, content, renderId } });
    }),
});
