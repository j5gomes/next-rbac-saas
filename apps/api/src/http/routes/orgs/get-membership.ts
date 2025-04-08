import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:organizationSlug/membership',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Get user membership on organization.',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
          }),
          response: {
            200: z.object({
              membership: z.object({
                id: z.string().uuid(),
                role: roleSchema,
                organizationId: z.string().uuid(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { organizationSlug } = request.params
        const { membership } = await request.getUserMembership(organizationSlug)

        return {
          membership: {
            id: membership.id,
            role: roleSchema.parse(membership.role),
            organizationId: membership.organizationId,
          },
        }
      }
    )
}
