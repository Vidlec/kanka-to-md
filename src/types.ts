import { z } from "zod"

export enum ENTITY_TYPE {
  CHARACTER = 1,
  LOCATION = 3,
  ORGANISATION = 4,
  ITEM = 5,
  CREATURE = 20,
  NOTE = 6,
  RACE = 9,
  FAMILY = 2,
  TIMELINE = 18,
}

export enum VISIBILITY_TYPE {
  ALL = 1,
  ADMINS = 2,
  ADMIN_SELF = 3,
  SELF = 4,
  MEMBERS = 5,
}

const EntityAttributeSchema = z.object({
  name: z.string(),
  value: z.string().optional().nullable(),
  isHidden: z.number().optional(),
})

const PostSchema = z.object({
  name: z.string(),
  entry: z.string().optional().nullable(),
  visibility_id: z.nativeEnum(VISIBILITY_TYPE),
})

const MemberSchema = z.object({
  character_id: z.number(),
  is_private: z.number().nullable().optional(),
  role: z.string().optional().nullable(),
})

const EraSchema = z.object({
  name: z.string(),
  abbreviation: z.string().optional().nullable(),
  start_year: z.number(),
  end_year: z.number(),
  entry: z.string().optional().nullable(),
})

export const EntitySchema = z.object({
  id: z.number(),
  type: z.string().optional().nullable(),
  name: z.string(),
  entry: z.string().optional().nullable(),
  age: z.string().optional().nullable(),
  sex: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  location_id: z.number().optional().nullable(),
  pivotMembers: z.array(MemberSchema).optional().nullable(),
  members: z.array(MemberSchema).optional().nullable(),
  entity: z.object({
    id: z.number(),
    is_private: z.number(),
    name: z.string(),
    type_id: z.nativeEnum(ENTITY_TYPE),
    entityAttributes: z.array(EntityAttributeSchema).optional().nullable(),
    posts: z.array(PostSchema).optional().nullable(),
  }),
  eras: z.array(EraSchema).optional().nullable(),
})

export type Entity = z.infer<typeof EntitySchema>
export type Member = z.infer<typeof MemberSchema>

export const entityTypeToString = {
  [ENTITY_TYPE.CHARACTER]: "character",
  [ENTITY_TYPE.LOCATION]: "location",
  [ENTITY_TYPE.ORGANISATION]: "organisation",
  [ENTITY_TYPE.CREATURE]: "creature",
  [ENTITY_TYPE.NOTE]: "note",
  [ENTITY_TYPE.ITEM]: "item",
  [ENTITY_TYPE.RACE]: "race",
  [ENTITY_TYPE.FAMILY]: "family",
  [ENTITY_TYPE.TIMELINE]: "timeline",
}
