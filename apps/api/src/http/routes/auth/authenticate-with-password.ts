import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['authentication'],
        summary: 'Authenticate user with email & password',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body

      const userByEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userByEmail) {
        throw new BadRequestError('Invalid credentials.')
      }

      if (userByEmail.passwordHash === null) {
        throw new BadRequestError(
          'User never logged in with password, please use social login.',
        )
      }

      const isPasswordValid = await compare(password, userByEmail.passwordHash)

      if (!isPasswordValid) {
        throw new BadRequestError('Invalid credentials.')
      }

      const token = await res.jwtSign(
        {
          sub: userByEmail.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return res.status(201).send({ token })
    },
  )
}
