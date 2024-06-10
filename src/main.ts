import {
  hasRenderableMembers,
  interpolateMentions,
  removeHtmlTags,
  translateGender,
  writeFile,
} from "./utils"
import { ENTITY_TYPE, Entity, VISIBILITY_TYPE } from "./types"
import { loadEntities } from "./loader"

const run = async () => {
  const categories = await loadEntities()

  const entities = categories.map((category) => category.files).flat()

  const tagsMap = new Map(
    entities
      .filter((entity) => entity.entity.type_id === ENTITY_TYPE.TAG)
      .map((tag) => [tag.id, tag])
  )
  const mentionsMap = new Map(entities.map((entity) => [entity.entity.id, entity.name]))
  const entitiesMap = new Map(entities.map((entity) => [entity.id, entity]))

  const write = (category: string, entities: Entity[]) => {
    let text = `${category}\n`
    entities.forEach(
      ({
        entry,
        age,
        sex,
        price,
        size,
        pivotMembers,
        members,
        type,
        location_id,
        eras,
        entity: { posts, name, is_private, entityAttributes, entityTags },
      }) => {
        if (is_private) return

        text = text + `\n${name}${` (${type ?? category})`}\n`
        entityTags?.forEach(({ tag_id }, index) => {
          index === 0 && (text = text + "Tags: ")
          const tag = tagsMap.get(tag_id)
          if (tag?.entity.is_private) return
          text = text + `${index !== 0 ? ", " : ""}${tag?.name}`
          index === entityTags.length - 1 && (text = text + "\n")
        })
        location_id && `Nachází se v ${entitiesMap.get(location_id)?.name}\n`
        age && (text = text + `\nVěk: ${age}\n`)
        sex && (text = text + `Pohlaví: ${translateGender[sex] ?? sex}\n`)
        price && (text = text + `Cena: ${price}\n`)
        size && (text = text + `Velikost: ${size}\n`)
        entityAttributes?.forEach(({ name, isHidden, value }) => {
          if (isHidden || !value) return
          text = text + `${name}: ${value}\n`
        })
        entry && (text = text + `\n${interpolateMentions(removeHtmlTags(entry), mentionsMap)}\n`)

        if (hasRenderableMembers(pivotMembers)) {
          text = text + "\nČlenové:\n"
          pivotMembers.forEach(({ character_id, is_private }) => {
            if (is_private) return
            text = text + `${entitiesMap.get(character_id)?.name}\n`
          })
        }

        if (hasRenderableMembers(members)) {
          text = text + "\nČlenové:\n"
          members.forEach(({ character_id, is_private, role }) => {
            if (is_private) return
            text = text + `${entitiesMap.get(character_id)?.name}${role ? ` - ${role}` : ""}\n`
          })
        }

        posts?.forEach((post) => {
          if (![VISIBILITY_TYPE.ALL, VISIBILITY_TYPE.MEMBERS].includes(post.visibility_id)) return
          if (post.entry) {
            text = text + `\n${post.name}\n`
            text = text + `${interpolateMentions(removeHtmlTags(post.entry), mentionsMap)}\n`
          }
        })

        eras?.forEach(({ start_year, end_year, entry, abbreviation, name }) => {
          text = text + `\n${`${name}${abbreviation ? ` (${abbreviation})` : ""}`}\n`
          text = text + `Trvání: ${start_year} až ${end_year}\n`
          entry && (text = text + `${interpolateMentions(removeHtmlTags(entry), mentionsMap)}\n`)
        })
      }
    )

    console.log(`Created ${category}.txt`)
    return writeFile(`./${category}.txt`, text)
  }

  await Promise.all(
    categories
      .filter((category) => !category.path.includes("tags"))
      .map(({ path, files }) => write(path, files))
  )
}

run()
