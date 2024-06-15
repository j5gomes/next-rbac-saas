import { z } from 'zod'

import { projectSchema } from '../modules/project'

// tuple is an array with only to positions
export const projectSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Project'), projectSchema]),
])

export type ProjectSubject = z.infer<typeof projectSubject>
