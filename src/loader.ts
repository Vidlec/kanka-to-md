import { ENTITY_TYPE, EntitySchema, entityTypeToString } from "./types"
import { loadJson, readFolder } from "./utils"
import pluralize from "pluralize"

const entitiesTypes = [
  ENTITY_TYPE.CHARACTER,
  ENTITY_TYPE.LOCATION,
  ENTITY_TYPE.ORGANISATION,
  ENTITY_TYPE.CREATURE,
  ENTITY_TYPE.NOTE,
  ENTITY_TYPE.ITEM,
  ENTITY_TYPE.RACE,
  ENTITY_TYPE.FAMILY,
  ENTITY_TYPE.TIMELINE,
]

export const loadEntities = async () => {
  const paths = entitiesTypes.map((type) => pluralize(entityTypeToString[type]))
  const folders = await Promise.all(
    paths.map(async (path) => ({ path, fileNames: await readFolder(`./${path}`) }))
  )

  return Promise.all(
    folders.map(async ({ path, fileNames }) => {
      const files = await Promise.all(
        fileNames
          .filter((fileName) => fileName.includes("json"))
          .map((fileName) => loadJson(`./${path}/${fileName}`, EntitySchema))
      )

      return { path, files }
    })
  )
}
