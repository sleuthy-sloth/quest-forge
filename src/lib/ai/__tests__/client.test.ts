import { describe, it, expect } from 'vitest'
import { stripThinking } from '@/lib/ai/client'

describe('stripThinking', () => {
  it('returns input as-is when no thinking tags are present', () => {
    const input = 'Hello, world!'
    expect(stripThinking(input)).toBe('Hello, world!')
  })

  it('strips <thinking> tags', () => {
    const input = '<thinking>Let me reason about this</thinking>The answer is 42.'
    expect(stripThinking(input)).toBe('The answer is 42.')
  })

  it('strips <reasoning> tags', () => {
    const input = '<reasoning>I should consider both sides</reasoning>The conclusion is correct.'
    expect(stripThinking(input)).toBe('The conclusion is correct.')
  })

  it('strips <think> tags', () => {
    const input = '<think>This is a thought process</think>Final answer: yes'
    expect(stripThinking(input)).toBe('Final answer: yes')
  })

  it('strips <thought> tags', () => {
    const input = '<thought>What if we tried something else</thought>Try option B.'
    expect(stripThinking(input)).toBe('Try option B.')
  })

  it('strips <reflection> tags', () => {
    const input = '<reflection>On second thought...</reflection>Go with A.'
    expect(stripThinking(input)).toBe('Go with A.')
  })

  it('strips <scratchpad> tags', () => {
    const input = '<scratchpad>Temp notes here</scratchpad>Output.'
    expect(stripThinking(input)).toBe('Output.')
  })

  it('strips <internal_thought> tags', () => {
    const input = '<internal_thought>Self check</internal_thought>Ready.'
    expect(stripThinking(input)).toBe('Ready.')
  })

  it('removes orphaned opening XML tags', () => {
    const input = '<thinking>Orphaned open tag. Answer: yes'
    expect(stripThinking(input)).toBe('Orphaned open tag. Answer: yes')
  })

  it('removes orphaned closing XML tags', () => {
    const input = 'Some text</thinking>Result'
    expect(stripThinking(input)).toBe('Some textResult')
  })

  it('strips fenced ```thinking``` blocks', () => {
    const input = '```thinking\nLet me analyze step by step\n```\nThe answer is 42.'
    expect(stripThinking(input)).toBe('The answer is 42.')
  })

  it('strips fenced ```reasoning``` blocks', () => {
    const input = '```reasoning\nComplex reasoning here\n```\nDone.'
    expect(stripThinking(input)).toBe('Done.')
  })

  it('extracts content from <output> wrapper', () => {
    const input = '<output>This is the actual response</output>'
    expect(stripThinking(input)).toBe('This is the actual response')
  })

  it('extracts content from <answer> wrapper', () => {
    const input = 'Some preamble<answer>The real answer</answer>'
    expect(stripThinking(input)).toBe('The real answer')
  })

  it('extracts JSON from prose preamble', () => {
    const input = 'Let me think about what the user wants. They are asking for a JSON response. Here is my answer: {"key": "value", "number": 42}'
    const result = stripThinking(input)
    const parsed = JSON.parse(result)
    expect(parsed).toEqual({ key: 'value', number: 42 })
  })

  it('extracts quoted prose answer from untagged thinking', () => {
    const input = 'Okay, so the user wants me to think about this problem carefully and provide a thoughtful response. "Here is the final answer to the question you asked about."'
    const result = stripThinking(input)
    expect(result).toBe('Here is the final answer to the question you asked about.')
  })

  it('strips markdown fences from final result', () => {
    const input = '```json\n{"result": "success"}\n```'
    const result = stripThinking(input)
    expect(JSON.parse(result)).toEqual({ result: 'success' })
  })

  it('handles multiple thinking tag types in same input', () => {
    const input = '<thinking>First thought</thinking>Actual<reasoning>Second reasoning</reasoning> content.'
    expect(stripThinking(input)).toBe('Actual content.')
  })

  it('handles empty string input', () => {
    expect(stripThinking('')).toBe('')
  })

  it('preserves non-thinking XML tags like <note>', () => {
    const input = 'Keep this <note>important</note> text.'
    expect(stripThinking(input)).toBe('Keep this <note>important</note> text.')
  })

  it('strips nested thinking tags inside output wrapper', () => {
    const input = '<output><thinking>Internal thought</thinking>The final output</output>'
    expect(stripThinking(input)).toBe('The final output')
  })

  it('preserves regular text with no thinking patterns', () => {
    const input = 'Regular conversation text with no special tags or formats.'
    expect(stripThinking(input)).toBe('Regular conversation text with no special tags or formats.')
  })

  it('handles multiline thinking blocks', () => {
    const input = '<thinking>\n  Step 1: Analyze\n  Step 2: Process\n  Step 3: Conclude\n</thinking>\nResult here.'
    expect(stripThinking(input)).toBe('Result here.')
  })

  it('removes thinking with no trailing content', () => {
    const input = '<thinking>Just thinking</thinking>'
    expect(stripThinking(input)).toBe('')
  })
})
