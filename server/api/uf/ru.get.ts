import { parse } from "node-html-parser"

export default defineEventHandler(async () => {
  const { UF_RU } = useRuntimeConfig()
  const ruHTMLPage = await $fetch<string>(UF_RU)
  const page = parse(ruHTMLPage)
  const [, title] = page.querySelectorAll('h1')
  return {
    title: title.rawText.trim()
  }
})