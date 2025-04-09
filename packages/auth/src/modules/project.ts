import { z } from 'zod'

export const projectSchema = z.object({
  __typename: z.literal('Project').default('Project'), // This field is to identify the schema
  id: z.string(),
  ownerId: z.string(),
})

export type Project = z.infer<typeof projectSchema>
