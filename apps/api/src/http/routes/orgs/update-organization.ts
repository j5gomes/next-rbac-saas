import { organizationSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:organizationSlug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Update organization.',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
          }),
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
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

        const { name, domain, shouldAttachUsersByDomain } = request.body

        const { cannot } = getUserPermissions(userId, membership.role)

        const authOrganization = organizationSchema.parse(organization)

        if (cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            'You not allowed to update this organization.'
          )
        }

        if (domain) {
          const organizationByDomain = await prisma.organization.findFirst({
            where: { domain, id: { not: organization.id } },
          })

          console.log(organizationByDomain)

          if (organizationByDomain) {
            throw new BadRequestError(
              'Another organization with same domain alrealy exists.'
            )
          }

          console.log('Update', name)

          await prisma.organization.update({
            where: { id: organization.id },
            data: {
              name,
              domain,
              shouldAttachUsersByDomain,
            },
          })

          return response.status(204).send()
        }
      }
    )
}
