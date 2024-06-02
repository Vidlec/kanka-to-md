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

const run = async () => {
  const categories = await loadEntities()

  const entities = categories.map((category) => category.files).flat()

  const mentionsMap = new Map(entities.map((entity) => [entity.entity.id, entity.name]))
  const entitiesMap = new Map(entities.map((entity) => [entity.id, entity]))

  const writeMd = (type: string, entities: Entity[]) => {
    let md: MarkdownEntryOrPrimitive[] = [{ h1: type }]
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

        md.push({ h2: `${name}${type ? ` (${type})` : ""}` })
        location_id && md.push({ p: `Nachází se v ${entitiesMap.get(location_id)?.name}` })

        entry && md.push({ p: interpolateMentions(removeHtmlTags(entry), mentionsMap) })
        age && md.push({ p: `Věk: ${age}` })
        sex && md.push({ p: `Pohlaví: ${translateGender[sex] ?? sex}` })
        price && md.push({ p: `Cena: ${price}` })
        size && md.push({ p: `Velikost: ${size}` })

        entityAttributes?.forEach(({ name, isHidden, value }) => {
          if (isHidden || !value) return
          md.push({ p: `${name}: ${value}` })
        })

        if (hasRenderableMembers(pivotMembers)) {
          md.push({ h3: "Členové" })
          pivotMembers.forEach(({ character_id, is_private }) => {
            if (is_private) return
            md.push({ p: entitiesMap.get(character_id)?.name })
          })
        }

        if (hasRenderableMembers(members)) {
          md.push({ h3: "Členové" })
          members.forEach(({ character_id, is_private, role }) => {
            if (is_private) return
            md.push({ p: `${entitiesMap.get(character_id)?.name}${role ? ` - ${role}` : ""}` })
          })
        }

        posts?.forEach((post) => {
          if (![VISIBILITY_TYPE.ALL, VISIBILITY_TYPE.MEMBERS].includes(post.visibility_id)) return
          if (post.entry) {
            md.push(
              { h3: post.name },
              { p: interpolateMentions(removeHtmlTags(post.entry), mentionsMap) }
            )
          }
        })

        eras?.forEach(({ start_year, end_year, entry, abbreviation, name }) => {
          md.push(
            {
              h3: `${name}${abbreviation ? ` (${abbreviation})` : ""}`,
            },
            { p: `Trvání: ${start_year} až ${end_year}` }
          )

          entry && md.push({ p: interpolateMentions(removeHtmlTags(entry), mentionsMap) })
        })
      }
    )

    console.log(`Created ${type}.md`)
    return writeFile(`./${type}.md`, tsm(md))
  }

  await Promise.all(categories.map(({ path, files }) => writeMd(path, files)))
}

run()
