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

  edit: protectedProcedure
    .input(z.object({ content: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { content, id } = input;

      return ctx.prisma.note.update({ where: { id }, data: { content } });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      return ctx.prisma.note.delete({ where: { id } });
    }),
});
