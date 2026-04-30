// @ts-check
import nextConfig from 'eslint-config-next'

const config = [
  // Next.js recommended config (flat config)
  ...nextConfig,

  // Project-specific overrides
  {
    rules: {
      // React Compiler rules (new in eslint-plugin-react-hooks v5) are
      // aspirational — they flag common patterns that work fine at runtime.
      // Disabling for now to keep the upgrade focused on build correctness.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/immutability': 'off',
    },
  },
]

export default config
