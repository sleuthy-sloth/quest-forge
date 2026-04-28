import { generateEduChallenges } from './edu'

async function run() {
  console.log("Generating math junior challenges...");
  const result = await generateEduChallenges('math', 'junior', 2);
  console.log("Result:", JSON.stringify(result, null, 2));
}

run().catch(console.error);
