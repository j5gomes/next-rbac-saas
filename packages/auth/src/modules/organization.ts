import { z } from 'zod'

// NOTE: we only need to save the information that is related to permissions, we dont need all database fields here
// Atributte based authorization control

export const organizationSchema = z.object({
  __typename: z.literal('Organization').default('Organization'),
  id: z.string(),
  ownerId: z.string(),
})

export type Organization = z.infer<typeof organizationSchema>
