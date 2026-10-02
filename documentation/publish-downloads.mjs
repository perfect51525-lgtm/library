import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const publicDownloads = path.join(root, 'frontend', 'public', 'downloads')
const exports = [
  'Stacks-Frontend-Walkthrough.pptx',
  'Stacks-Frontend-Walkthrough-and-Code.pdf',
]

await mkdir(publicDownloads, { recursive: true })
for (const filename of exports) {
  await copyFile(
    path.join(root, 'documentation', filename),
    path.join(publicDownloads, filename),
  )
}

console.log(`Published ${exports.length} downloads to ${path.relative(root, publicDownloads)}.`)