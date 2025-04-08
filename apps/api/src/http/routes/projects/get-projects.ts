import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:organizationSlug/projects',
      {
        schema: {
          tags: ['projects'],
          summary: 'Get all projects from an organization.',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
          }),
          response: {
            200: z.object({
              projects: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  description: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().nullable(),
                  ownerId: z.string().uuid(),
                  organizationId: z.string().uuid(),
                  createdAt: z.date(),
                  owner: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request, response) => {
        const { organizationSlug } = request.params
        const userId = await request.getCurrentUserId()

        const { membership, organization } =
          await request.getUserMembership(organizationSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError(
            'User is not allowed to see this project.'
          )
        }

        const projects = await prisma.project.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            organizationId: organization.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        if (!projects) {
          throw new BadRequestError('No project found.')
        }

        return response.status(200).send({ projects })
      }
    )
}
