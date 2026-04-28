import { generateEduChallenges } from './src/lib/ai/edu.ts';
import { stripThinking } from './src/lib/ai/client.ts';

// Mock the prompt and fetch logic to see if it throws any errors
async function test() {
  try {
    const res = await generateEduChallenges('math', 'junior', 2);
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
