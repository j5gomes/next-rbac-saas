import { organizationSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:organizationSlug/projects/:projectId',
      {
        schema: {
          tags: ['projects'],
          summary: 'Update project.',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
            projectId: z.string().uuid(),
          }),
          body: z.object({
            name: z.string(),
            description: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, response) => {
        const { organizationSlug, projectId } = request.params
        const userId = await request.getCurrentUserId()

        const { membership, organization } =
          await request.getUserMembership(organizationSlug)

        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found.')
        }

        const { cannot } = getUserPermissions(userId, membership.role)
        const authProject = organizationSchema.parse(project)

        // Passing the project directily makes the cannot check if we are deleting a project that we own
        if (cannot('update', authProject)) {
          throw new UnauthorizedError(
            'User is not allowed to update this project.'
          )
        }

        const { name, description } = request.body

        await prisma.project.update({
          where: {
            id: projectId,
          },
          data: {
            name,
            description,
          },
        })

        return response.status(204).send()
      }
    )
}
