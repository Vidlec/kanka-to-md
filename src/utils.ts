import fs, { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"
import { ZodSchema, z } from "zod"
import { Member } from "./types"

export const loadJson = async <Schema extends ZodSchema>(
  path: string,
  schema: Schema
): Promise<z.infer<Schema>> => {
  const rawConfig = await readFile(join(__dirname, path), "utf-8")
  return schema.parse(JSON.parse(rawConfig))
}

export const readFolder = async (path: string) => {
  return readdir(join(__dirname, path))
}

export const writeFile = async (path: string, content: string) => {
  return fs.writeFile(join(__dirname, path), content)
}

export const removeHtmlTags = (text: string) => text.replace(/<[^>]*>?/gim, "")

export const interpolateMentions = (input: string, mentions: Map<number, string>): string => {
  return input.replace(/\[.*?:(\d+)?(?:\|(.*?))?\]/gm, (_, id, hardcodedText) => {
    if (hardcodedText) return hardcodedText
    return mentions.get(Number(id)) ?? "Unknown"
  })
}

export const translateGender: Record<string, string> = {
  Male: "muž",
  Female: "žena",
}

export const hasRenderableMembers = <Value extends Member>(
  members?: Value[] | null
): members is Value[] =>
  !!members && members.length > 0 && members.some((member) => !member.is_private)
