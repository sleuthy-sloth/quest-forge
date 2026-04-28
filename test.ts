function extractFirstValidJson(text: string): string | null {
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue
    let depth = 0
    let j = i
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++
      else if (text[j] === '}') { depth--; if (depth === 0) break }
    }
    if (depth === 0) {
      const candidate = text.slice(i, j + 1)
      try { JSON.parse(candidate); return candidate } catch { /* not valid JSON, keep walking */ }
    }
  }
  return null
}
function extractQuotedAnswer(text: string): string | null {
  const matches = Array.from(text.matchAll(/"([^"]{40,})"/g))
  for (let i = matches.length - 1; i >= 0; i--) {
    const candidate = matches[i][1].trim()
    if (candidate.includes(' ') && /[.!?]/.test(candidate)) {
      return candidate
    }
  }
  return null
}

function stripThinking(text: string): string {
  let cleaned = text
    .replace(/<reasoning[\s\S]*?<\/reasoning>/gi, '')
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/<thought[\s\S]*?<\/thought>/gi, '')
    .replace(/```thinking[\s\S]*?```/gi, '')
    .replace(/<\/?think>|<\/?reasoning>/gi, '')
    .trim()

  let hasValidJson = false
  if (cleaned.includes('{')) {
    const jsonBlock = extractFirstValidJson(cleaned)
    if (jsonBlock !== null) {
      hasValidJson = true
      const idx = cleaned.indexOf(jsonBlock)
      const before = cleaned.slice(0, idx).trim()
      if (before === '' || before.startsWith('```') || (idx > 50 && /[a-zA-Z]{4,}/.test(before))) {
        cleaned = jsonBlock
      }
    }
  }
  if (!hasValidJson && !cleaned.trimStart().startsWith('{') && !cleaned.trimStart().startsWith('```')) {
    const prose = extractQuotedAnswer(cleaned)
    if (prose) cleaned = prose
  }
  return cleaned.trim()
}

const sample1 = "```json\n{\n  \"questions\": [\n    { \"title\": \"test\", \"question\": \"test?\", \"options\": [\"a\",\"b\",\"c\",\"d\"], \"correct_answer\": \"a\", \"explanation\": \"This is a long explanation that acts as a test.\", \"xp_reward\": 20 }\n  ]\n}\n```";
console.log("TEST 1 (Markdown JSON):");
console.log(stripThinking(sample1));

const sample2 = "Here is my thought process.\nIt is quite long.\nAnd has many words.\nSo it goes over fifty characters quite easily.\n{\n  \"questions\": [\n    { \"title\": \"test\", \"question\": \"test?\", \"options\": [\"a\",\"b\",\"c\",\"d\"], \"correct_answer\": \"a\", \"explanation\": \"This is a long explanation that acts as a test.\", \"xp_reward\": 20 }\n  ]\n}";
console.log("\nTEST 2 (Long Prose + JSON):");
console.log(stripThinking(sample2));

const sample3 = "Sure! Here are your questions:\n{\n  \"questions\": [\n    { \"title\": \"test\", \"question\": \"test?\", \"options\": [\"a\",\"b\",\"c\",\"d\"], \"correct_answer\": \"a\", \"explanation\": \"This is a long explanation that acts as a test.\", \"xp_reward\": 20 }\n  ]\n}";
console.log("\nTEST 3 (Short Preamble + JSON):");
console.log(stripThinking(sample3));

const sample4 = "Here is a story.\n\n\"This is the quoted prose answer that should be extracted since it has more than forty characters and punctuation.\"\n";
console.log("\nTEST 4 (Prose Story):");
console.log(stripThinking(sample4));

