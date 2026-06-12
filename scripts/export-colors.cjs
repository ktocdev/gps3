/**
 * Export CSS colors to Adobe-compatible formats
 *
 * Run: node scripts/export-colors.js
 *
 * Outputs:
 * - colors-swatches.ase (Adobe Swatch Exchange - import into Illustrator)
 * - colors-adobe.json (for color.adobe.com)
 * - colors-list.txt (simple hex list)
 */

const fs = require('fs')
const path = require('path')

// Read the CSS file
const cssPath = path.join(__dirname, '../src/styles/variables.css')
const css = fs.readFileSync(cssPath, 'utf8')

// Extract hex colors with their variable names
const colorRegex = /--color-([a-z0-9-]+):\s*(#[a-fA-F0-9]{6})/g
const colors = []
let match

while ((match = colorRegex.exec(css)) !== null) {
  colors.push({
    name: match[1],
    hex: match[2].toUpperCase()
  })
}

// Group colors by category
const categories = {
  'Background': colors.filter(c => c.name.startsWith('bg-')),
  'Text': colors.filter(c => c.name.startsWith('text-')),
  'Pink': colors.filter(c => c.name.startsWith('accent-pink')),
  'Green': colors.filter(c => c.name.startsWith('accent-green')),
  'Violet': colors.filter(c => c.name.startsWith('accent-violet')),
  'Yellow': colors.filter(c => c.name.startsWith('accent-yellow')),
  'Cyan': colors.filter(c => c.name.startsWith('accent-cyan')),
  'Neutral': colors.filter(c => c.name.startsWith('neutral')),
  'Warning': colors.filter(c => c.name.startsWith('warning')),
  'Error': colors.filter(c => c.name.startsWith('error')),
  'Info': colors.filter(c => c.name.startsWith('info')),
  'Needs': colors.filter(c => c.name.startsWith('need-'))
}

// Helper: Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// 1. Create simple text list
let textOutput = '# GPS2 Color Palette\n'
textOutput += '# Import these colors manually into Illustrator\n\n'

for (const [category, catColors] of Object.entries(categories)) {
  if (catColors.length === 0) continue
  textOutput += `## ${category}\n`
  for (const color of catColors) {
    const rgb = hexToRgb(color.hex)
    textOutput += `${color.hex}  ${color.name}  (R:${rgb.r} G:${rgb.g} B:${rgb.b})\n`
  }
  textOutput += '\n'
}

fs.writeFileSync(path.join(__dirname, 'colors-list.txt'), textOutput)
console.log('Created: scripts/colors-list.txt')

// 2. Create Adobe Color JSON (for color.adobe.com)
const adobeColorThemes = []

for (const [category, catColors] of Object.entries(categories)) {
  if (catColors.length === 0) continue

  // Adobe Color supports 5 colors per theme, so chunk them
  const chunks = []
  for (let i = 0; i < catColors.length; i += 5) {
    chunks.push(catColors.slice(i, i + 5))
  }

  chunks.forEach((chunk, index) => {
    adobeColorThemes.push({
      name: chunks.length > 1 ? `GPS2 ${category} ${index + 1}` : `GPS2 ${category}`,
      colors: chunk.map(c => ({
        name: c.name,
        hex: c.hex,
        rgb: hexToRgb(c.hex)
      }))
    })
  })
}

fs.writeFileSync(
  path.join(__dirname, 'colors-adobe.json'),
  JSON.stringify(adobeColorThemes, null, 2)
)
console.log('Created: scripts/colors-adobe.json')

// 3. Create ASE (Adobe Swatch Exchange) file
// ASE is a binary format - we'll create it manually

function createAseFile(colors, filename) {
  const chunks = []

  // ASE Header: "ASEF" + version (1.0)
  const header = Buffer.alloc(8)
  header.write('ASEF', 0)
  header.writeUInt16BE(1, 4) // Major version
  header.writeUInt16BE(0, 6) // Minor version
  chunks.push(header)

  // Block count (placeholder, we'll update later)
  const blockCountBuf = Buffer.alloc(4)
  chunks.push(blockCountBuf)

  let blockCount = 0

  // Add colors
  for (const color of colors) {
    // Color entry block type: 0x0001
    const blockType = Buffer.alloc(2)
    blockType.writeUInt16BE(0x0001, 0)
    chunks.push(blockType)

    // Prepare color name (UTF-16BE with null terminator)
    const nameStr = color.name
    const nameBuf = Buffer.alloc((nameStr.length + 1) * 2)
    for (let i = 0; i < nameStr.length; i++) {
      nameBuf.writeUInt16BE(nameStr.charCodeAt(i), i * 2)
    }
    nameBuf.writeUInt16BE(0, nameStr.length * 2) // null terminator

    // Color model: "RGB " (4 bytes)
    const colorModel = Buffer.from('RGB ')

    // RGB values as floats (0.0 - 1.0)
    const rgb = hexToRgb(color.hex)
    const rgbBuf = Buffer.alloc(12)
    rgbBuf.writeFloatBE(rgb.r / 255, 0)
    rgbBuf.writeFloatBE(rgb.g / 255, 4)
    rgbBuf.writeFloatBE(rgb.b / 255, 8)

    // Color type: 0 = Global, 1 = Spot, 2 = Normal
    const colorType = Buffer.alloc(2)
    colorType.writeUInt16BE(2, 0) // Normal

    // Calculate block length
    const blockLength = 2 + nameBuf.length + 4 + 12 + 2 // name length + name + model + rgb + type
    const blockLengthBuf = Buffer.alloc(4)
    blockLengthBuf.writeUInt32BE(blockLength, 0)
    chunks.push(blockLengthBuf)

    // Name length (in UTF-16 characters, including null)
    const nameLengthBuf = Buffer.alloc(2)
    nameLengthBuf.writeUInt16BE(nameStr.length + 1, 0)
    chunks.push(nameLengthBuf)

    chunks.push(nameBuf)
    chunks.push(colorModel)
    chunks.push(rgbBuf)
    chunks.push(colorType)

    blockCount++
  }

  // Update block count
  blockCountBuf.writeUInt32BE(blockCount, 0)

  // Write file
  const aseBuffer = Buffer.concat(chunks)
  fs.writeFileSync(path.join(__dirname, filename), aseBuffer)
}

// Create individual ASE files per category
for (const [category, catColors] of Object.entries(categories)) {
  if (catColors.length === 0) continue
  const filename = `colors-${category.toLowerCase().replace(/\s+/g, '-')}.ase`
  createAseFile(catColors, filename)
  console.log(`Created: scripts/${filename}`)
}

// Create one combined ASE file
createAseFile(colors, 'colors-all.ase')
console.log('Created: scripts/colors-all.ase')

console.log('\n--- Import Instructions ---')
console.log('Adobe Illustrator:')
console.log('1. Open Window > Swatches')
console.log('2. Click hamburger menu > Open Swatch Library > Other Library')
console.log('3. Select any .ase file from the scripts folder')
console.log('')
console.log('Adobe Color (color.adobe.com):')
console.log('1. Use colors-adobe.json as reference')
console.log('2. Create themes manually or use the Extract feature')
console.log('')
console.log(`Total colors exported: ${colors.length}`)
