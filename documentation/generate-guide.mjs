import fs from 'node:fs'
import path from 'node:path'
import PDFDocument from 'pdfkit'
import PptxGenJS from 'pptxgenjs'

const root = process.cwd()
const screenshots = path.join(root, 'documentation', 'screenshots')
const pptxPath = path.join(root, 'documentation', 'Stacks-Frontend-Walkthrough.pptx')
const pdfPath = path.join(root, 'documentation', 'Stacks-Frontend-Walkthrough-and-Code.pdf')
const palette = {
  ink: '202923',
  forest: '1D2924',
  green: '27624E',
  paper: 'F5F6F2',
  white: 'FFFFFF',
  muted: '78837B',
  line: 'E3E8E1',
  gold: 'E4B462',
  blue: '5488A3',
  coral: 'D7745C',
}

const files = [
  { path: 'frontend/package.json', purpose: 'Frontend scripts and React, Vite, and icon dependencies.', group: 'Runtime and setup' },
  { path: 'frontend/.gitignore', purpose: 'Prevents generated frontend files from being committed.', group: 'Runtime and setup' },
  { path: 'frontend/.oxlintrc.json', purpose: 'Oxlint configuration used by the frontend lint command.', group: 'Runtime and setup' },
  { path: 'frontend/README.md', purpose: 'Vite starter documentation; app-specific setup is in the root README.', group: 'Runtime and setup' },
  { path: 'frontend/index.html', purpose: 'Browser document shell, page title, metadata, and React mount node.', group: 'Runtime and setup' },
  { path: 'frontend/vite.config.js', purpose: 'Enables the React plugin and configures Vite.', group: 'Runtime and setup' },
  { path: 'frontend/src/main.jsx', purpose: 'Bootstraps React and mounts LibraryApp into #root.', group: 'Application code' },
  { path: 'frontend/src/LibraryApp.jsx', purpose: 'Main UI: auth, dashboard, catalog, members, circulation, forms, and actions.', group: 'Application code' },
  { path: 'frontend/src/lib/api.js', purpose: 'Fetch wrapper: API base URL, bearer token, JSON requests, and errors.', group: 'Application code' },
  { path: 'frontend/src/App.jsx', purpose: 'Unused Vite starter demo; main.jsx imports LibraryApp directly.', group: 'Starter leftovers' },
  { path: 'frontend/src/index.css', purpose: 'Global base styles from the Vite starter; loaded before app styles.', group: 'Styles' },
  { path: 'frontend/src/LibraryApp.css', purpose: 'Visual system and responsive styles for the Stacks workspace.', group: 'Styles' },
  { path: 'frontend/src/WorkspaceLayout.css', purpose: 'Pins the workspace navigation rail during page scrolling.', group: 'Styles' },
  { path: 'frontend/src/App.css', purpose: 'Unused Vite starter stylesheet; not imported by the running app.', group: 'Starter leftovers' },
  { path: 'frontend/src/assets/react.svg', purpose: 'Unused React starter illustration.', group: 'Starter leftovers' },
  { path: 'frontend/src/assets/vite.svg', purpose: 'Unused Vite starter illustration.', group: 'Starter leftovers' },
  { path: 'frontend/src/assets/hero.png', purpose: 'Unused Vite starter raster image; binary asset, not code.', group: 'Starter leftovers', binary: true },
  { path: 'frontend/public/favicon.svg', purpose: 'Public SVG favicon asset; not source logic.', group: 'Static assets' },
  { path: 'frontend/public/icons.svg', purpose: 'Public icon sprite from the Vite starter; not used by the app.', group: 'Starter leftovers' },
]

const codeFiles = files.filter((file) => !file.binary)
const pptx = new PptxGenJS()
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'Stacks Library Management'
pptx.subject = 'Frontend UI walkthrough and source-code guide'
pptx.title = 'Stacks Frontend Walkthrough'
pptx.company = 'Stacks Library Management'
pptx.lang = 'en-US'
pptx.theme = {
  headFontFace: 'Arial',
  bodyFontFace: 'Arial',
  lang: 'en-US',
}

const slideW = 13.333
const slideH = 7.5
const pdf = new PDFDocument({ autoFirstPage: false, compress: true })
const pdfStream = fs.createWriteStream(pdfPath)
pdf.pipe(pdfStream)
const fontPath = 'C:/Windows/Fonts/consola.ttf'
if (fs.existsSync(fontPath)) pdf.registerFont('Consolas', fontPath)

function abs(filePath) {
  return path.join(root, filePath)
}

function addPptBg(slide, color = palette.paper) {
  slide.background = { color }
}

function addPptFooter(slide, page) {
  slide.addText('STACKS  /  FRONTEND WALKTHROUGH', {
    x: 0.55, y: 7.12, w: 6.5, h: 0.18,
    fontFace: 'Arial', fontSize: 8, bold: true,
    color: palette.muted, charSpacing: 0.8, margin: 0,
  })
  slide.addText(String(page).padStart(2, '0'), {
    x: 12.35, y: 7.08, w: 0.4, h: 0.22,
    fontFace: 'Arial', fontSize: 9, bold: true,
    color: palette.green, align: 'right', margin: 0,
  })
}

function addPdfBg(color = palette.paper) {
  pdf.addPage({ size: [960, 540], margin: 0 })
  pdf.rect(0, 0, 960, 540).fill(`#${color}`)
}

function addPdfFooter(page) {
  pdf.font('Helvetica-Bold').fontSize(7).fillColor(`#${palette.muted}`)
    .text('STACKS  /  FRONTEND WALKTHROUGH', 40, 515, { lineBreak: false, characterSpacing: 0.8 })
  pdf.font('Helvetica-Bold').fontSize(8).fillColor(`#${palette.green}`)
    .text(String(page).padStart(2, '0'), 900, 514, { width: 25, align: 'right', lineBreak: false })
}

function addSectionHeading(slide, kicker, title, description = '') {
  slide.addText(kicker.toUpperCase(), {
    x: 0.58, y: 0.34, w: 8, h: 0.18,
    fontFace: 'Arial', fontSize: 8, bold: true,
    color: palette.green, charSpacing: 1.4, margin: 0,
  })
  slide.addText(title, {
    x: 0.56, y: 0.58, w: 11.9, h: 0.48,
    fontFace: 'Arial', fontSize: 25, bold: true,
    color: palette.ink, margin: 0,
  })
  if (description) {
    slide.addText(description, {
      x: 0.58, y: 1.09, w: 11.9, h: 0.28,
      fontFace: 'Arial', fontSize: 10, color: palette.muted, margin: 0,
    })
  }
}

function addPdfHeading(kicker, title, description = '') {
  pdf.font('Helvetica-Bold').fontSize(8).fillColor(`#${palette.green}`)
    .text(kicker.toUpperCase(), 42, 26, { characterSpacing: 1.2, lineBreak: false })
  pdf.font('Helvetica-Bold').fontSize(24).fillColor(`#${palette.ink}`)
    .text(title, 40, 45, { lineBreak: false })
  if (description) {
    pdf.font('Helvetica').fontSize(9).fillColor(`#${palette.muted}`)
      .text(description, 42, 82, { width: 870, lineBreak: false })
  }
}

function pngSize(imagePath) {
  const header = fs.readFileSync(imagePath).subarray(0, 24)
  if (header.toString('ascii', 1, 4) !== 'PNG') return { width: 1440, height: 900 }
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) }
}

function fitImage(imagePath, x, y, w, h) {
  const { width, height } = pngSize(imagePath)
  const scale = Math.min(w / width, h / height)
  const imageW = width * scale
  const imageH = height * scale
  return { path: imagePath, x: x + (w - imageW) / 2, y: y + (h - imageH) / 2, w: imageW, h: imageH }
}

function addScreenshot(slide, imagePath, x, y, w, h) {
  if (!fs.existsSync(imagePath)) return false
  slide.addShape('rect', {
    x, y, w, h, fill: { color: palette.white },
    line: { color: palette.line, width: 0.8 },
  })
  slide.addImage(fitImage(imagePath, x + 0.05, y + 0.05, w - 0.1, h - 0.1))
  return true
}

function addPdfScreenshot(imagePath, x, y, w, h) {
  if (!fs.existsSync(imagePath)) return false
  pdf.save().rect(x, y, w, h).fillAndStroke(`#${palette.white}`, `#${palette.line}`).restore()
  const { width, height } = pngSize(imagePath)
  const scale = Math.min((w - 8) / width, (h - 8) / height)
  const imageW = width * scale
  const imageH = height * scale
  pdf.image(imagePath, x + (w - imageW) / 2, y + (h - imageH) / 2, { width: imageW, height: imageH })
  return true
}

function addBullets(slide, bullets, x = 8.45, y = 1.78, w = 4.25) {
  bullets.forEach((bullet, index) => {
    const top = y + index * 1.0
    slide.addShape('ellipse', {
      x, y: top + 0.01, w: 0.25, h: 0.25,
      line: { color: palette.green, transparency: 100 },
      fill: { color: index === 0 ? palette.green : 'DCE9E0' },
    })
    slide.addText(String(index + 1).padStart(2, '0'), {
      x, y: top + 0.055, w: 0.25, h: 0.1,
      fontFace: 'Arial', fontSize: 6.5, bold: true,
      color: index === 0 ? palette.white : palette.green,
      align: 'center', margin: 0,
    })
    slide.addText(bullet, {
      x: x + 0.38, y: top, w: w - 0.38, h: 0.68,
      fontFace: 'Arial', fontSize: 12, color: palette.ink,
      breakLine: false, valign: 'top', margin: 0,
      paraSpaceAfterPt: 3,
    })
  })
}

function addPdfBullets(bullets, x = 610, y = 132, w = 305) {
  bullets.forEach((bullet, index) => {
    const top = y + index * 72
    pdf.circle(x + 8, top + 9, 9).fill(index === 0 ? `#${palette.green}` : '#DCE9E0')
    pdf.font('Helvetica-Bold').fontSize(6).fillColor(index === 0 ? '#FFFFFF' : `#${palette.green}`)
      .text(String(index + 1).padStart(2, '0'), x + 3, top + 6, { width: 10, align: 'center', lineBreak: false })
    pdf.font('Helvetica').fontSize(11).fillColor(`#${palette.ink}`)
      .text(bullet, x + 27, top, { width: w - 28, height: 55, lineGap: 3 })
  })
}

function addScreenshotSlide(page, { title, kicker, description, image, bullets }) {
  const slide = pptx.addSlide()
  addPptBg(slide)
  addSectionHeading(slide, kicker, title, description)
  addScreenshot(slide, abs(image), 0.55, 1.55, 7.6, 5.15)
  addBullets(slide, bullets)
  addPptFooter(slide, page)

  addPdfBg()
  addPdfHeading(kicker, title, description)
  addPdfScreenshot(abs(image), 40, 110, 540, 380)
  addPdfBullets(bullets)
  addPdfFooter(page)
}

function addCover() {
  const slide = pptx.addSlide()
  addPptBg(slide, palette.forest)
  slide.addShape('rect', { x: 0, y: 0, w: 0.17, h: slideH, fill: { color: palette.gold }, line: { color: palette.gold } })
  slide.addText('STACKS  /  LIBRARY MANAGEMENT', {
    x: 0.85, y: 0.66, w: 6, h: 0.3,
    fontFace: 'Arial', fontSize: 9, bold: true,
    color: 'C1D0C5', charSpacing: 1.3, margin: 0,
  })
  slide.addText('Frontend\nwalkthrough', {
    x: 0.82, y: 1.72, w: 7.3, h: 2.0,
    fontFace: 'Arial', fontSize: 38, bold: true,
    color: palette.white, breakLine: false, margin: 0,
  })
  slide.addText('UI screens  /  File guide  /  Complete source appendix', {
    x: 0.86, y: 4.08, w: 7.5, h: 0.38,
    fontFace: 'Arial', fontSize: 14, color: 'C1D0C5', margin: 0,
  })
  slide.addShape('roundRect', {
    x: 9.45, y: 1.25, w: 2.65, h: 4.55, rectRadius: 0.08,
    fill: { color: '2C483B' }, line: { color: '53745F', width: 1 },
  })
  slide.addText('B', {
    x: 9.88, y: 1.85, w: 1.8, h: 2.5,
    fontFace: 'Georgia', fontSize: 104, bold: true,
    color: 'E4B462', align: 'center', margin: 0,
  })
  slide.addText('FIELD GUIDE  /  2026', {
    x: 9.55, y: 5.25, w: 2.45, h: 0.2,
    fontFace: 'Arial', fontSize: 8, bold: true,
    color: 'D0DCD2', align: 'center', charSpacing: 1.1, margin: 0,
  })

  addPdfBg(palette.forest)
  pdf.rect(0, 0, 12, 540).fill(`#${palette.gold}`)
  pdf.font('Helvetica-Bold').fontSize(9).fillColor('#C1D0C5')
    .text('STACKS  /  LIBRARY MANAGEMENT', 62, 50, { characterSpacing: 1.3 })
  pdf.font('Helvetica-Bold').fontSize(42).fillColor('#FFFFFF')
    .text('Frontend\nwalkthrough', 60, 154, { width: 540, lineGap: 5 })
  pdf.font('Helvetica').fontSize(14).fillColor('#C1D0C5')
    .text('UI screens  /  File guide  /  Complete source appendix', 62, 310, { width: 580 })
  pdf.roundedRect(682, 94, 190, 326, 9).fillAndStroke('#2C483B', '#53745F')
  pdf.font('Times-Bold').fontSize(132).fillColor('#E4B462').text('B', 720, 116, { width: 110, align: 'center' })
  pdf.font('Helvetica-Bold').fontSize(8).fillColor('#D0DCD2')
    .text('FIELD GUIDE  /  2026', 702, 375, { width: 150, align: 'center', characterSpacing: 1.1 })
}

function addArchitecture(page = 2) {
  const slide = pptx.addSlide()
  addPptBg(slide)
  addSectionHeading(slide, 'SYSTEM MAP', 'How the frontend works', 'The UI owns presentation and interactions; the API owns validation and persistent data.')
  const nodes = [
    { x: 0.7, title: 'REACT UI', file: 'LibraryApp.jsx', detail: 'Screens, forms, local state', color: 'E6EFE9' },
    { x: 3.85, title: 'API CLIENT', file: 'lib/api.js', detail: 'JSON + JWT requests', color: 'E8F0F4' },
    { x: 7.0, title: 'EXPRESS API', file: 'backend/routes + controllers', detail: 'Auth, checks, business rules', color: 'F6F0DD' },
    { x: 10.15, title: 'MONGODB', file: 'Mongoose models', detail: 'Users, books, issues', color: 'FAECE7' },
  ]
  nodes.forEach((node, index) => {
    slide.addShape('roundRect', {
      x: node.x, y: 2.25, w: 2.5, h: 1.75,
      rectRadius: 0.06, fill: { color: node.color },
      line: { color: palette.line, width: 0.8 },
    })
    slide.addText(node.title, {
      x: node.x + 0.2, y: 2.52, w: 2.1, h: 0.24,
      fontFace: 'Arial', fontSize: 11, bold: true, color: palette.green, margin: 0,
    })
    slide.addText(node.file, {
      x: node.x + 0.2, y: 2.92, w: 2.15, h: 0.24,
      fontFace: 'Arial', fontSize: 9, bold: true, color: palette.ink, margin: 0,
    })
    slide.addText(node.detail, {
      x: node.x + 0.2, y: 3.3, w: 2.14, h: 0.45,
      fontFace: 'Arial', fontSize: 8, color: palette.muted, margin: 0,
    })
    if (index < nodes.length - 1) {
      slide.addShape('line', {
        x: node.x + 2.55, y: 3.1, w: 0.5, h: 0,
        line: { color: palette.green, width: 1.5, endArrowType: 'triangle' },
      })
    }
  })
  slide.addText('Authentication is stored as a signed token; protected API requests send it in the Authorization header.', {
    x: 1.0, y: 5.1, w: 11.3, h: 0.55,
    fontFace: 'Arial', fontSize: 15, color: palette.ink, align: 'center', margin: 0,
  })
  addPptFooter(slide, page)

  addPdfBg()
  addPdfHeading('SYSTEM MAP', 'How the frontend works', 'The UI owns presentation and interactions; the API owns validation and persistent data.')
  nodes.forEach((node, index) => {
    const x = 50 + index * 218
    pdf.roundedRect(x, 184, 180, 126, 7).fillAndStroke(`#${node.color}`, `#${palette.line}`)
    pdf.font('Helvetica-Bold').fontSize(9).fillColor(`#${palette.green}`).text(node.title, x + 13, 203, { width: 150 })
    pdf.font('Helvetica-Bold').fontSize(8).fillColor(`#${palette.ink}`).text(node.file, x + 13, 232, { width: 150 })
    pdf.font('Helvetica').fontSize(7.5).fillColor(`#${palette.muted}`).text(node.detail, x + 13, 264, { width: 150 })
    if (index < nodes.length - 1) {
      pdf.moveTo(x + 182, 247).lineTo(x + 211, 247).stroke(`#${palette.green}`)
      pdf.polygon([x + 211, 243], [x + 218, 247], [x + 211, 251]).fill(`#${palette.green}`)
    }
  })
  pdf.font('Helvetica').fontSize(12).fillColor(`#${palette.ink}`)
    .text('Authentication uses a signed token; protected requests send it in the Authorization header.', 75, 390, { width: 810, align: 'center' })
  addPdfFooter(page)
}

function addFileMap(page, title, group, filesForSlide) {
  const slide = pptx.addSlide()
  addPptBg(slide)
  addSectionHeading(slide, 'FILE-BY-FILE GUIDE', title, 'Complete text sources are reproduced after the presentation in the PDF appendix.')
  let y = 1.65
  filesForSlide.forEach((file, index) => {
    slide.addShape('line', { x: 0.65, y: y + 0.72, w: 12.0, h: 0, line: { color: palette.line, width: 0.7 } })
    slide.addText(file.path.replace('frontend/', ''), {
      x: 0.68, y, w: 4.6, h: 0.24,
      fontFace: 'Arial', fontSize: 10, bold: true,
      color: palette.green, margin: 0,
    })
    slide.addText(file.purpose, {
      x: 5.15, y: y - 0.01, w: 7.25, h: 0.52,
      fontFace: 'Arial', fontSize: 10, color: palette.ink,
      valign: 'top', margin: 0,
    })
    y += index === filesForSlide.length - 1 ? 0 : 0.79
  })
  addPptFooter(slide, page)

  addPdfBg()
  addPdfHeading('FILE-BY-FILE GUIDE', title, 'Complete text sources are reproduced after the presentation in the PDF appendix.')
  y = 120
  filesForSlide.forEach((file) => {
    pdf.font('Helvetica-Bold').fontSize(8.5).fillColor(`#${palette.green}`)
      .text(file.path.replace('frontend/', ''), 48, y, { width: 290 })
    pdf.font('Helvetica').fontSize(9).fillColor(`#${palette.ink}`)
      .text(file.purpose, 345, y, { width: 555, height: 44 })
    pdf.moveTo(48, y + 45).lineTo(910, y + 45).lineWidth(0.6).stroke(`#${palette.line}`)
    y += 57
  })
  addPdfFooter(page)
}

function addWorkflow(page = 10) {
  const slide = pptx.addSlide()
  addPptBg(slide, palette.forest)
  slide.addText('READING THE SOURCE', {
    x: 0.65, y: 0.45, w: 5, h: 0.2,
    fontFace: 'Arial', fontSize: 8, bold: true,
    color: 'B7CCBE', charSpacing: 1.2, margin: 0,
  })
  slide.addText('One action, end to end', {
    x: 0.65, y: 0.78, w: 11, h: 0.5,
    fontFace: 'Arial', fontSize: 27, bold: true,
    color: palette.white, margin: 0,
  })
  const steps = [
    ['01', 'Admin clicks', 'LibraryApp.jsx'],
    ['02', 'Form is checked', 'HTML + API validation'],
    ['03', 'Request is sent', 'lib/api.js + JWT'],
    ['04', 'Data is saved', 'Express + MongoDB'],
    ['05', 'UI refreshes', 'Dashboard and tables'],
  ]
  steps.forEach(([number, title, detail], index) => {
    const x = 0.65 + index * 2.52
    slide.addShape('roundRect', {
      x, y: 2.2, w: 2.15, h: 1.85, rectRadius: 0.05,
      fill: { color: '2B4035' }, line: { color: '4E6958', width: 0.8 },
    })
    slide.addText(number, { x: x + 0.18, y: 2.4, w: 0.5, h: 0.2, fontFace: 'Arial', fontSize: 9, bold: true, color: palette.gold, margin: 0 })
    slide.addText(title, { x: x + 0.18, y: 2.9, w: 1.8, h: 0.5, fontFace: 'Arial', fontSize: 13, bold: true, color: palette.white, margin: 0 })
    slide.addText(detail, { x: x + 0.18, y: 3.52, w: 1.8, h: 0.35, fontFace: 'Arial', fontSize: 8, color: 'C1D0C5', margin: 0 })
    if (index < steps.length - 1) slide.addShape('line', { x: x + 2.16, y: 3.12, w: 0.33, h: 0, line: { color: palette.gold, width: 1.2, endArrowType: 'triangle' } })
  })
  slide.addText('Build the app:  npm run build     •     Rebuild this guide:  npm run documentation:build', {
    x: 0.68, y: 5.35, w: 11.5, h: 0.35,
    fontFace: 'Arial', fontSize: 12, color: 'DCE8DE', margin: 0,
  })
  addPptFooter(slide, page)

  addPdfBg(palette.forest)
  pdf.font('Helvetica-Bold').fontSize(8).fillColor('#B7CCBE').text('READING THE SOURCE', 48, 34, { characterSpacing: 1.2 })
  pdf.font('Helvetica-Bold').fontSize(25).fillColor('#FFFFFF').text('One action, end to end', 48, 60)
  steps.forEach(([number, title, detail], index) => {
    const x = 44 + index * 178
    pdf.roundedRect(x, 177, 155, 135, 7).fillAndStroke('#2B4035', '#4E6958')
    pdf.font('Helvetica-Bold').fontSize(8).fillColor(`#${palette.gold}`).text(number, x + 13, 194)
    pdf.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text(title, x + 13, 222, { width: 130 })
    pdf.font('Helvetica').fontSize(7.5).fillColor('#C1D0C5').text(detail, x + 13, 270, { width: 130 })
    if (index < steps.length - 1) {
      pdf.moveTo(x + 157, 245).lineTo(x + 172, 245).stroke(`#${palette.gold}`)
      pdf.polygon([x + 172, 241], [x + 178, 245], [x + 172, 249]).fill(`#${palette.gold}`)
    }
  })
  pdf.font('Helvetica').fontSize(10).fillColor('#DCE8DE')
    .text('Build the app:  npm run build     |     Rebuild this guide:  npm run documentation:build', 48, 398, { width: 850 })
  addPdfFooter(page)
}

function addPdfCodeAppendix() {
  pdf.addPage({ size: 'A4', margin: 0 })
  pdf.rect(0, 0, 595, 842).fill('#F5F6F2')
  pdf.font('Helvetica-Bold').fontSize(9).fillColor(`#${palette.green}`).text('APPENDIX  /  COMPLETE FRONTEND TEXT SOURCES', 42, 45, { characterSpacing: 1 })
  pdf.font('Helvetica-Bold').fontSize(24).fillColor(`#${palette.ink}`).text('Code, file by file', 40, 67)
  pdf.font('Helvetica').fontSize(10).fillColor(`#${palette.muted}`)
    .text(`${codeFiles.length} text-based frontend files are included below. Generated package-lock data and the binary hero image are inventoried but omitted.`, 42, 108, { width: 500, lineGap: 4 })
  let y = 165
  codeFiles.forEach((file) => {
    const fullPath = abs(file.path)
    if (!fs.existsSync(fullPath)) return
    const source = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n')
    const lineCount = source.endsWith('\n') ? source.split('\n').length - 1 : source.split('\n').length
    if (y > 770) {
      pdf.addPage({ size: 'A4', margin: 0 })
      pdf.rect(0, 0, 595, 842).fill('#F5F6F2')
      y = 48
    }
    pdf.font('Helvetica-Bold').fontSize(8).fillColor(`#${palette.green}`)
      .text(file.path, 42, y, { width: 510, lineBreak: false })
    y += 15
    pdf.font('Helvetica').fontSize(7).fillColor(`#${palette.muted}`)
      .text(`${file.purpose}  |  ${lineCount} lines`, 42, y, { width: 510, lineGap: 2 })
    y += 20
  })

  for (const file of codeFiles) {
    const fullPath = abs(file.path)
    if (!fs.existsSync(fullPath)) continue
    const source = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n')
    const originalLines = source.split('\n')
    pdf.addPage({ size: 'A4', margin: 0 })
    pdf.rect(0, 0, 595, 842).fill('#FFFFFF')
    let pageHeader = () => {
      pdf.rect(0, 0, 595, 40).fill(`#${palette.forest}`)
      pdf.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF')
        .text(`${file.path}${y > 760 ? '  /  continued' : ''}`, 34, 16, { width: 520, lineBreak: false })
    }
    pageHeader()
    let codeY = 52
    const fontSize = 6.3
    const lineHeight = 8.0
    const left = 34
    const maxChars = 132
    pdf.font('Consolas').fontSize(fontSize)
    originalLines.forEach((line, index) => {
      const chunks = line.length === 0 ? [''] : line.match(new RegExp(`.{1,${maxChars}}`, 'g')) || ['']
      chunks.forEach((chunk, chunkIndex) => {
        if (codeY > 805) {
          pdf.addPage({ size: 'A4', margin: 0 })
          pdf.rect(0, 0, 595, 842).fill('#FFFFFF')
          pageHeader = () => {
            pdf.rect(0, 0, 595, 40).fill(`#${palette.forest}`)
            pdf.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF')
              .text(`${file.path}  /  continued`, 34, 16, { width: 520, lineBreak: false })
          }
          pageHeader()
          codeY = 52
          pdf.font('Consolas').fontSize(fontSize)
        }
        const prefix = chunkIndex === 0 ? `${String(index + 1).padStart(4, ' ')}  ` : '      '
        pdf.fillColor('#263B30').text(prefix + chunk, left, codeY, { lineBreak: false })
        codeY += lineHeight
      })
    })
  }
}

async function main() {
  const slideSpecs = [
    {
      title: 'Overview dashboard', kicker: 'LIVE INTERFACE',
      description: 'Collection health, loans, availability, members, and recent activity in one place.',
      image: 'dashboard.png',
      bullets: ['Four live metrics summarize copies, shelf availability, loans, and readers.', 'Collection-health bars update from MongoDB-backed totals.', 'Quick actions route directly to catalog, members, and circulation.'],
    },
    {
      title: 'Book catalog', kicker: 'COLLECTION MANAGEMENT',
      description: 'Search and maintain titles, ISBNs, categories, and copy availability.',
      image: 'book-catalog.png',
      bullets: ['Search matches title, author, or ISBN.', 'Category and availability filters narrow the table.', 'Add, edit, and delete actions use the protected books API.'],
    },
  ]

  addCover()
  addArchitecture(2)
  addScreenshotSlide(3, slideSpecs[0])
  addScreenshotSlide(4, slideSpecs[1])

  const combinedSlide = pptx.addSlide()
  addPptBg(combinedSlide)
  addSectionHeading(combinedSlide, 'PEOPLE + CIRCULATION', 'Members and book loans', 'Member records and check-in history are kept separate but connected by each issue record.')
  addScreenshot(combinedSlide, abs('documentation/screenshots/members.png'), 0.55, 1.62, 6.0, 4.85)
  addScreenshot(combinedSlide, abs('documentation/screenshots/circulation.png'), 6.78, 1.62, 6.0, 4.85)
  combinedSlide.addText('Members: create, edit, and remove accounts. Open loans block deletion.', { x: 0.65, y: 6.57, w: 5.9, h: 0.26, fontFace: 'Arial', fontSize: 9, color: palette.ink, margin: 0 })
  combinedSlide.addText('Circulation: check out available copies, track due dates, and check books back in.', { x: 6.9, y: 6.57, w: 5.75, h: 0.26, fontFace: 'Arial', fontSize: 9, color: palette.ink, margin: 0 })
  addPptFooter(combinedSlide, 5)
  addPdfBg()
  addPdfHeading('PEOPLE + CIRCULATION', 'Members and book loans', 'Member records and check-in history are separate, connected by each issue record.')
  addPdfScreenshot(abs('documentation/screenshots/members.png'), 38, 112, 425, 355)
  addPdfScreenshot(abs('documentation/screenshots/circulation.png'), 497, 112, 425, 355)
  pdf.font('Helvetica').fontSize(8).fillColor(`#${palette.ink}`).text('Members: create, edit, remove; open loans block deletion.', 44, 478, { width: 408 })
  pdf.font('Helvetica').fontSize(8).fillColor(`#${palette.ink}`).text('Circulation: check out, track due dates, and check in.', 503, 478, { width: 408 })
  addPdfFooter(5)

  addScreenshotSlide(6, {
    title: 'Add and edit forms', kicker: 'ADMIN WORKFLOW',
    description: 'Dialogs gather structured data, validate required fields, and report API errors.',
    image: 'add-book-dialog.png',
    bullets: ['Book form records title, author, ISBN, category, and copy count.', 'Member form creates accounts with hashed passwords.', 'Checkout form requires a member, an available book, and a future due date.'],
  })
  addScreenshotSlide(7, {
    title: 'Responsive workspace', kicker: 'SMALL-SCREEN LAYOUT',
    description: 'On narrow screens the sidebar collapses to an icon rail and remains visible while scrolling.',
    image: 'mobile-workspace.png',
    bullets: ['Navigation stays available in the sticky side rail.', 'Tables scroll inside their own region instead of widening the full page.', 'Forms stack vertically on small screens.'],
  })

  addFileMap(8, 'Core runtime files', 'APPLICATION CODE', files.filter((file) => file.group === 'Runtime and setup' || file.group === 'Application code'))
  addFileMap(9, 'Styles, assets, and starter files', 'FILE-BY-FILE GUIDE', files.filter((file) => file.group === 'Styles' || file.group === 'Static assets' || file.group === 'Starter leftovers'))
  addWorkflow(10)
  addPdfCodeAppendix()

  await pptx.writeFile({ fileName: pptxPath })
  await new Promise((resolve, reject) => {
    pdf.on('end', resolve)
    pdf.on('error', reject)
    pdf.end()
  })
  console.log(`Created ${path.relative(root, pptxPath)}`)
  console.log(`Created ${path.relative(root, pdfPath)}`)
  console.log(`PDF appendix includes ${codeFiles.length} text frontend files.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})