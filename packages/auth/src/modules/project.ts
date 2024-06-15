import { z } from 'zod'

// NOTE: we only need to save the information that is related to permissions, we dont need all database fields here

export const projectSchema = z.object({
  __typename: z.literal('Project').default('Project'), // This field is to identify the schema
  id: z.string(),
  ownerId: z.string(),
})

export type Project = z.infer<typeof projectSchema>
