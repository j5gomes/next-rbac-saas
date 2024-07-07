import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['authentication'],
        summary: 'Get authenticated user profile informations.',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (req, res) => {
      const { email } = req.body

      const userByEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (!userByEmail) {
        // We dont want people to know if user really exists
        return res.status(201).send()
      }

      const { id: code } = await prisma.token.create({
        data: {
          type: 'PASSWORD_RECOVER',
          userId: userByEmail.id,
        },
      })

      // Send email with password recover link

      console.log('Recover password token: ', code)

      return res.status(201).send()
    },
  )
}
