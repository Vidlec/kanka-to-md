import {
  hasRenderableMembers,
  interpolateMentions,
  removeHtmlTags,
  translateGender,
  writeFile,
} from "./utils"
import { MarkdownEntryOrPrimitive, tsMarkdown as tsm } from "ts-markdown"
import { Entity, VISIBILITY_TYPE, entityTypeToString } from "./types"
import { loadEntities } from "./loader"
import { type } from "node:os"

const run = async () => {
  const categories = await loadEntities()

  const entities = categories.map((category) => category.files).flat()

  const mentionsMap = new Map(entities.map((entity) => [entity.entity.id, entity.name]))
  const entitiesMap = new Map(entities.map((entity) => [entity.id, entity]))

  const writeMd = (category: string, entities: Entity[]) => {
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
        entity: { posts, name, is_private, entityAttributes },
      }) => {
        if (is_private) return

        text = text + `\n${name}${` (${type ?? category})`}\n`
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

  await Promise.all(categories.map(({ path, files }) => writeMd(path, files)))
}

run()
