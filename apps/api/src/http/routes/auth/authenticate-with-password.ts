import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

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
          400: z.object({
            message: z.string(),
          }),
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
        return res.status(400).send({ message: 'Invalid credentials.' })
      }

      if (userByEmail.passwordHash === null) {
        return res.status(400).send({
          message:
            'User never logged in with password, please use social login.',
        })
      }

      const isPasswordValid = await compare(password, userByEmail.passwordHash)

      if (!isPasswordValid) {
        return res.status(400).send({ message: 'Invalid credentials.' })
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
