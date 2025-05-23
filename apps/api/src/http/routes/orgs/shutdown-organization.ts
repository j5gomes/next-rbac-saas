import { organizationSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:organizationSlug/shutdown',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Shutdown organization.',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, response) => {
        const { organizationSlug } = request.params
        const userId = await request.getCurrentUserId()

        const { membership, organization } =
          await request.getUserMembership(organizationSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        const authOrganization = organizationSchema.parse(organization)

        // Passing the organization directily makes the cannot check if we are deleting a organization that we own
        if (cannot('delete', authOrganization)) {
          throw new UnauthorizedError(
            'You not allowed to shutdown this organization.'
          )
        }

        await prisma.organization.delete({
          where: { id: authOrganization.id },
        })

        return response.status(204).send()
      }
    )
}
