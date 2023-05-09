import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const noteRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ searchKeyword: z.string().optional() }).optional())
    .query(({ ctx, input }) => {
      const { userId } = ctx.auth;

      return ctx.prisma.note.findMany({
        where: { userId, AND: [{ content: { search: input?.searchKeyword } }] },
      });
    }),

  create: protectedProcedure
    .input(z.object({ content: z.string(), renderId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { content, renderId } = input;
      const { userId } = ctx.auth;

      return ctx.prisma.note.create({ data: { userId, content, renderId } });
    }),

  edit: protectedProcedure
    .input(
      z.object({ content: z.string(), id: z.string(), renderId: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      const { content, renderId } = input;

      return ctx.prisma.note.update({ where: { renderId }, data: { content } });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(), renderId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { renderId } = input;

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Delete all notes that are older than 1 day, regularly
      await ctx.prisma.note.deleteMany({
        where: { deletedAt: { lte: oneDayAgo } },
      });

      return ctx.prisma.note.update({
        where: { renderId },
        data: { deletedAt: new Date() },
      });
    }),

  undoDelete: protectedProcedure
    .input(z.object({ id: z.string(), renderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { renderId } = input;

      return ctx.prisma.note.update({
        where: { renderId },
        data: { deletedAt: null },
      });
    }),
});
