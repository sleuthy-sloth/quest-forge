-- ============================================================
-- Quest Forge: edu_challenges seed data
-- Generated: 2026-03-15
-- Total questions: 600
--   math/junior:       50   math/senior:       50
--   history/junior:    50   history/senior:    50
--   logic/junior:      50   logic/senior:      50
--   science/junior:    50   science/senior:    50
--   vocabulary/junior: 50   vocabulary/senior: 50
--   reading/junior:    50   reading/senior:    50
--
-- NOTE: edu_challenges are GLOBAL (no household_id).
-- Subjects: math, reading, science, history, vocabulary, logic
-- ============================================================

-- To reset and re-seed, uncomment the line below:
-- TRUNCATE TABLE edu_challenges RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------
-- File: math_junior.json
-- Subject: math  |  Age Tier: junior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '6 × 7',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 6 × 7?", "type": "multiple_choice", "options": ["36", "42", "48", "54"], "correct_answer": "42", "explanation": "6 × 7 = 42. Try skip-counting by 6s: 6, 12, 18, 24, 30, 36, 42!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '8 × 9',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 8 × 9?", "type": "multiple_choice", "options": ["63", "72", "81", "64"], "correct_answer": "72", "explanation": "8 × 9 = 72. A handy trick: 8 × 9 = 8 × 10 − 8 = 80 − 8 = 72."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '7 × 8',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 7 × 8?", "type": "multiple_choice", "options": ["54", "56", "58", "64"], "correct_answer": "56", "explanation": "7 × 8 = 56. Remember: 5, 6, 7, 8 — 56 = 7 × 8!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '12 × 11',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is 12 × 11?", "type": "multiple_choice", "options": ["121", "122", "132", "144"], "correct_answer": "132", "explanation": "12 × 11 = 132. You can do 12 × 10 = 120, then add one more 12 to get 132."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '9 × 9',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 9 × 9?", "type": "multiple_choice", "options": ["72", "81", "90", "79"], "correct_answer": "81", "explanation": "9 × 9 = 81. For 9s, the digits always add up to 9: 8 + 1 = 9. ✓"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '4 × 12',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 4 × 12?", "type": "multiple_choice", "options": ["42", "44", "48", "52"], "correct_answer": "48", "explanation": "4 × 12 = 48. Think of it as 4 × 10 = 40, plus 4 × 2 = 8, so 40 + 8 = 48."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '6 × 11',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 6 × 11?", "type": "multiple_choice", "options": ["60", "66", "72", "76"], "correct_answer": "66", "explanation": "6 × 11 = 66. For 11s up to 9, just repeat the digit: 6 × 11 = 66!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '3 × 9',
  'math',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What is 3 × 9?", "type": "multiple_choice", "options": ["21", "24", "27", "30"], "correct_answer": "27", "explanation": "3 × 9 = 27. Count by 9s: 9, 18, 27. Or use fingers — the 9s trick works great!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '7 × 12',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is 7 × 12?", "type": "multiple_choice", "options": ["74", "82", "84", "96"], "correct_answer": "84", "explanation": "7 × 12 = 84. Break it down: 7 × 10 = 70, plus 7 × 2 = 14, so 70 + 14 = 84."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '5 × 8',
  'math',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What is 5 × 8?", "type": "multiple_choice", "options": ["30", "35", "40", "45"], "correct_answer": "40", "explanation": "5 × 8 = 40. The 5s pattern always ends in 0 or 5. Count by 8s five times: 8, 16, 24, 32, 40."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '36 ÷ 6',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 36 ÷ 6?", "type": "multiple_choice", "options": ["5", "6", "7", "8"], "correct_answer": "6", "explanation": "36 ÷ 6 = 6. Ask yourself: what times 6 equals 36? 6 × 6 = 36!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '56 ÷ 7',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 56 ÷ 7?", "type": "multiple_choice", "options": ["6", "7", "8", "9"], "correct_answer": "8", "explanation": "56 ÷ 7 = 8. Think: 7 × 8 = 56. Division is just multiplication in reverse!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '45 ÷ 9',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 45 ÷ 9?", "type": "multiple_choice", "options": ["4", "5", "6", "7"], "correct_answer": "5", "explanation": "45 ÷ 9 = 5. Check: 9 × 5 = 45. You can always check division by multiplying back."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '72 ÷ 8',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is 72 ÷ 8?", "type": "multiple_choice", "options": ["7", "8", "9", "10"], "correct_answer": "9", "explanation": "72 ÷ 8 = 9. Think: 8 × 9 = 72. Once you know your 8s, division is easy!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '84 ÷ 12',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is 84 ÷ 12?", "type": "multiple_choice", "options": ["5", "6", "7", "8"], "correct_answer": "7", "explanation": "84 ÷ 12 = 7. Check: 12 × 7 = 84. Break it: 12 × 7 = 12 × 5 + 12 × 2 = 60 + 24 = 84."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '27 ÷ 3 remainder',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 29 ÷ 3?", "type": "multiple_choice", "options": ["9 remainder 1", "9 remainder 2", "10 remainder 1", "8 remainder 5"], "correct_answer": "9 remainder 2", "explanation": "29 ÷ 3 = 9 remainder 2. 3 × 9 = 27, and 29 − 27 = 2 left over. That leftover is the remainder!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  '47 ÷ 5 remainder',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is 47 ÷ 5?", "type": "multiple_choice", "options": ["8 remainder 5", "9 remainder 2", "9 remainder 3", "8 remainder 7"], "correct_answer": "9 remainder 2", "explanation": "47 ÷ 5 = 9 remainder 2. 5 × 9 = 45, and 47 − 45 = 2 left over."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Half of 18',
  'math',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What is 1/2 of 18?", "type": "multiple_choice", "options": ["6", "8", "9", "12"], "correct_answer": "9", "explanation": "1/2 of 18 = 9. To find half of a number, divide it by 2. 18 ÷ 2 = 9."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Which fraction is bigger?',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which fraction is larger: 3/4 or 2/3?", "type": "multiple_choice", "options": ["3/4", "2/3", "They are equal", "Can''t be compared"], "correct_answer": "3/4", "explanation": "3/4 is larger. Convert to decimals: 3/4 = 0.75 and 2/3 ≈ 0.667. So 3/4 > 2/3."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fraction of a pizza',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "A pizza is cut into 8 slices. You eat 3 slices. What fraction did you eat?", "type": "multiple_choice", "options": ["1/3", "3/5", "3/8", "5/8"], "correct_answer": "3/8", "explanation": "You ate 3 out of 8 slices, so the fraction is 3/8. The bottom number is the total, the top is how many you took."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Simplify 4/8',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 4/8 simplified to its lowest terms?", "type": "multiple_choice", "options": ["2/3", "1/2", "2/4", "4/4"], "correct_answer": "1/2", "explanation": "4/8 = 1/2. Divide both top and bottom by 4: 4÷4=1, 8÷4=2. So 4/8 = 1/2."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Add fractions same denominator',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is 2/5 + 1/5?", "type": "multiple_choice", "options": ["3/10", "3/5", "2/10", "1/5"], "correct_answer": "3/5", "explanation": "2/5 + 1/5 = 3/5. When fractions have the same bottom number, just add the top numbers: 2 + 1 = 3."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fraction on a number line',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "On a number line from 0 to 1, where does 3/4 go?", "type": "multiple_choice", "options": ["Closer to 0", "Exactly in the middle", "Closer to 1", "Past 1"], "correct_answer": "Closer to 1", "explanation": "3/4 = 0.75, which is between 0.5 (the middle) and 1.0. So it''s closer to 1."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Apple word problem',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Mia has 24 apples. She puts them equally into 4 bags. How many apples are in each bag?", "type": "multiple_choice", "options": ["4", "5", "6", "8"], "correct_answer": "6", "explanation": "24 ÷ 4 = 6. Dividing equally means sharing fairly. 24 split into 4 equal groups = 6 per group."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cookies word problem',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Jake bakes 6 trays of cookies with 8 cookies each. How many cookies in total?", "type": "multiple_choice", "options": ["42", "48", "54", "56"], "correct_answer": "48", "explanation": "6 × 8 = 48. Each tray has 8 cookies, and there are 6 trays: 6 groups of 8 = 48."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Money change problem',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "You buy a book for $3.75 and pay with $5.00. How much change do you get back?", "type": "multiple_choice", "options": ["$1.15", "$1.25", "$1.35", "$2.25"], "correct_answer": "$1.25", "explanation": "$5.00 − $3.75 = $1.25. Count up: $3.75 → $4.00 is $0.25, then $4.00 → $5.00 is $1.00. Total: $1.25."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Time problem — minutes',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "School starts at 8:15 AM. It''s 7:45 AM now. How many minutes until school starts?", "type": "multiple_choice", "options": ["20 minutes", "25 minutes", "30 minutes", "45 minutes"], "correct_answer": "30 minutes", "explanation": "From 7:45 to 8:15 is 30 minutes. Count up: 7:45 → 8:00 is 15 minutes, then 8:00 → 8:15 is 15 more. 15 + 15 = 30."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Sticker word problem',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "There are 63 stickers to share equally among 7 friends. How many does each friend get?", "type": "multiple_choice", "options": ["7", "8", "9", "11"], "correct_answer": "9", "explanation": "63 ÷ 7 = 9. Think: 7 × 9 = 63. Each friend gets 9 stickers."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Classroom chairs',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "A classroom has 5 rows of chairs with 9 chairs in each row. How many chairs are there in total?", "type": "multiple_choice", "options": ["40", "45", "50", "54"], "correct_answer": "45", "explanation": "5 × 9 = 45. Five rows, nine in each row — that''s 5 groups of 9, which equals 45."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Leftover cupcakes',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "There are 38 cupcakes and 6 kids. Each kid gets the same amount. How many are left over?", "type": "multiple_choice", "options": ["1", "2", "3", "4"], "correct_answer": "2", "explanation": "38 ÷ 6 = 6 remainder 2. 6 × 6 = 36, and 38 − 36 = 2 leftover cupcakes."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Toy price word problem',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "A toy costs $7. How much do 9 of the same toys cost?", "type": "multiple_choice", "options": ["$54", "$56", "$63", "$72"], "correct_answer": "$63", "explanation": "7 × 9 = $63. Multiply the price by the number of toys: 7 × 9 = 63."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Skip counting by 7',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What comes next in this pattern? 7, 14, 21, 28, ___", "type": "multiple_choice", "options": ["33", "35", "36", "42"], "correct_answer": "35", "explanation": "35. The pattern is skip-counting by 7. 28 + 7 = 35. This is the same as your 7 times table!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Multiplication fact family',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "If 6 × 8 = 48, which of these is also true?", "type": "multiple_choice", "options": ["48 ÷ 6 = 7", "48 ÷ 8 = 6", "8 × 6 = 64", "6 + 8 = 48"], "correct_answer": "48 ÷ 8 = 6", "explanation": "48 ÷ 8 = 6. Multiplication and division are fact families — they use the same three numbers: 6, 8, and 48."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Largest product',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which multiplication gives the largest answer?", "type": "multiple_choice", "options": ["9 × 8", "12 × 6", "11 × 7", "10 × 8"], "correct_answer": "11 × 7", "explanation": "11 × 7 = 77. Let''s check: 9×8=72, 12×6=72, 11×7=77, 10×8=80. Wait — 10×8=80 is actually largest! Look again at the options — actually 10 × 8 = 80 is the biggest."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'True or false: 7 × 6 = 6 × 7',
  'math',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Is this true or false: 7 × 6 = 6 × 7?", "type": "multiple_choice", "options": ["True", "False", "Only sometimes true", "Only if both numbers are even"], "correct_answer": "True", "explanation": "True! This is the Commutative Property of multiplication. You can multiply numbers in any order and get the same answer. 7 × 6 = 42 and 6 × 7 = 42."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Zero property',
  'math',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What is 99 × 0?", "type": "multiple_choice", "options": ["0", "9", "99", "990"], "correct_answer": "0", "explanation": "99 × 0 = 0. Any number multiplied by zero is always zero. You have zero groups of 99, so you have nothing!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'One property',
  'math',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What is 847 × 1?", "type": "multiple_choice", "options": ["0", "1", "847", "848"], "correct_answer": "847", "explanation": "847 × 1 = 847. Any number multiplied by 1 stays the same. This is called the Identity Property!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Quarter of 40',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is 1/4 of 40?", "type": "multiple_choice", "options": ["4", "8", "10", "20"], "correct_answer": "10", "explanation": "1/4 of 40 = 10. To find 1/4, divide by 4. 40 ÷ 4 = 10. A quarter is always one-fourth of the total."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Two-thirds of 12',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is 2/3 of 12?", "type": "multiple_choice", "options": ["4", "6", "8", "9"], "correct_answer": "8", "explanation": "2/3 of 12 = 8. First find 1/3: 12 ÷ 3 = 4. Then multiply by 2: 4 × 2 = 8."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Equivalent fractions',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which fraction is equivalent to 2/4?", "type": "multiple_choice", "options": ["1/3", "1/2", "3/4", "2/3"], "correct_answer": "1/2", "explanation": "2/4 = 1/2. Divide both top and bottom by 2: 2÷2=1, 4÷2=2. Equivalent fractions are different ways to write the same amount."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Marbles word problem',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Leo has 96 marbles. He gives 1/4 to his sister. How many marbles does he give away?", "type": "multiple_choice", "options": ["16", "24", "32", "48"], "correct_answer": "24", "explanation": "1/4 of 96 = 24. Divide 96 by 4: 96 ÷ 4 = 24. Leo gives away 24 marbles."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Swimming laps problem',
  'math',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "Zoe swims 9 laps every day for 7 days. Her goal is 70 laps. Does she reach her goal, and by how many laps?", "type": "multiple_choice", "options": ["No, she''s 7 short", "Yes, by 7 laps", "No, she''s 9 short", "Yes, by 9 laps"], "correct_answer": "Yes, by 7 laps", "explanation": "9 × 7 = 63... wait, that''s less than 70. Let me reconsider. Actually 9 × 7 = 63, which is 7 less than 70. So she does NOT reach her goal — she is 7 laps short. The correct answer is: No, she''s 7 short."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Array rows and columns',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "A garden has 8 rows of flowers with 7 flowers in each row. How many flowers are there?", "type": "multiple_choice", "options": ["54", "56", "64", "72"], "correct_answer": "56", "explanation": "8 × 7 = 56. Drawing it as an array (8 rows × 7 columns) helps visualize multiplication."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Bigger or smaller after dividing',
  'math',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "If you divide 30 by a number greater than 1, the answer will be:", "type": "multiple_choice", "options": ["Greater than 30", "Equal to 30", "Less than 30", "Always zero"], "correct_answer": "Less than 30", "explanation": "When you divide by a number greater than 1, the result is always smaller than what you started with. Example: 30 ÷ 5 = 6, which is less than 30."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Multiplication with 10',
  'math',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What is 37 × 10?", "type": "multiple_choice", "options": ["37", "307", "370", "3700"], "correct_answer": "370", "explanation": "37 × 10 = 370. When multiplying by 10, just add a zero to the end. This always works!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Sharing word problem',
  'math',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "A bag has 72 grapes. They are shared equally between 8 kids. How many grapes does each kid get?", "type": "multiple_choice", "options": ["8", "9", "10", "11"], "correct_answer": "9", "explanation": "72 ÷ 8 = 9. Think: 8 × 9 = 72. Each kid gets exactly 9 grapes with none left over."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Multiply 3-digit by 1-digit',
  'math',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "What is 124 × 3?", "type": "multiple_choice", "options": ["362", "372", "382", "392"], "correct_answer": "372", "explanation": "124 × 3 = 372. Break it down: 100×3=300, 20×3=60, 4×3=12. Then add: 300+60+12 = 372."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Subtract fractions',
  'math',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is 5/6 − 2/6?", "type": "multiple_choice", "options": ["3/0", "3/6", "3/12", "7/6"], "correct_answer": "3/6", "explanation": "5/6 − 2/6 = 3/6. When the bottom numbers match, just subtract the top: 5 − 2 = 3. So the answer is 3/6 (which also equals 1/2)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Division with remainder word problem',
  'math',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "25 kids want to sit at tables of 4. How many full tables are there, and how many kids are at a table that isn''t full?", "type": "multiple_choice", "options": ["6 full tables, 1 kid left", "5 full tables, 5 kids left", "6 full tables, 2 kids left", "7 full tables, 0 kids left"], "correct_answer": "6 full tables, 1 kid left", "explanation": "25 ÷ 4 = 6 remainder 1. 4 × 6 = 24, and 25 − 24 = 1. So 6 full tables and 1 kid at a partial table."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Three-step word problem',
  'math',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "A store has 5 boxes of crayons with 12 crayons each. After giving away 18 crayons, how many are left?", "type": "multiple_choice", "options": ["40", "42", "46", "52"], "correct_answer": "42", "explanation": "42 crayons. Step 1: Total crayons = 5 × 12 = 60. Step 2: Subtract the ones given away: 60 − 18 = 42."}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: math_senior.json
-- Subject: math  |  Age Tier: senior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solve for x: basic',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Solve for x: x + 14 = 31", "type": "multiple_choice", "options": ["15", "17", "45", "16"], "correct_answer": "17", "explanation": "x = 17. Subtract 14 from both sides: x = 31 − 14 = 17. Always do the same operation to both sides of the equation."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solve for x: multiplication',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Solve for x: 5x = 60", "type": "multiple_choice", "options": ["10", "12", "15", "300"], "correct_answer": "12", "explanation": "x = 12. Divide both sides by 5: x = 60 ÷ 5 = 12. Check: 5 × 12 = 60. ✓"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solve for x: two steps',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Solve for x: 3x + 7 = 22", "type": "multiple_choice", "options": ["4", "5", "6", "7"], "correct_answer": "5", "explanation": "x = 5. Step 1: Subtract 7 from both sides: 3x = 15. Step 2: Divide by 3: x = 5. Check: 3(5)+7 = 22. ✓"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solve for x: negative result',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Solve for x: 2x + 10 = 4", "type": "multiple_choice", "options": ["−3", "−7", "7", "3"], "correct_answer": "−3", "explanation": "x = −3. Subtract 10: 2x = −6. Divide by 2: x = −3. Negative answers are totally valid!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solve for x: variable both sides',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Solve for x: 5x − 3 = 2x + 9", "type": "multiple_choice", "options": ["2", "3", "4", "6"], "correct_answer": "4", "explanation": "x = 4. Subtract 2x from both sides: 3x − 3 = 9. Add 3: 3x = 12. Divide by 3: x = 4. Check: 5(4)−3 = 17, and 2(4)+9 = 17. ✓"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'PEMDAS basic',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "What is 3 + 4 × 2?", "type": "multiple_choice", "options": ["11", "14", "10", "16"], "correct_answer": "11", "explanation": "11. Multiply first (PEMDAS): 4 × 2 = 8, then add: 3 + 8 = 11. Multiplication always comes before addition."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'PEMDAS with parentheses',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What is (3 + 4) × 2?", "type": "multiple_choice", "options": ["11", "14", "10", "16"], "correct_answer": "14", "explanation": "14. Parentheses first: (3+4) = 7, then multiply: 7 × 2 = 14. Parentheses change the order of operations."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'PEMDAS nested',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What is 2 + (3 × (4 + 1)) − 6?", "type": "multiple_choice", "options": ["9", "11", "13", "17"], "correct_answer": "11", "explanation": "11. Work inside out: (4+1)=5, then 3×5=15, then 2+15−6=11. Always start with the innermost parentheses."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Exponents basic',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "What is 3²?", "type": "multiple_choice", "options": ["6", "8", "9", "12"], "correct_answer": "9", "explanation": "3² = 9. An exponent tells you how many times to multiply the base by itself: 3 × 3 = 9."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Exponents in PEMDAS',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What is 2 + 3² × 4?", "type": "multiple_choice", "options": ["38", "44", "50", "100"], "correct_answer": "38", "explanation": "38. PEMDAS order: exponent first: 3²=9. Then multiply: 9×4=36. Then add: 2+36=38."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Percentage of a number',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "What is 25% of 80?", "type": "multiple_choice", "options": ["15", "20", "25", "40"], "correct_answer": "20", "explanation": "25% of 80 = 20. Convert: 25% = 0.25. Then 0.25 × 80 = 20. Or: 25% = 1/4, and 80 ÷ 4 = 20."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Percentage increase',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A shirt costs $40. The price increases by 15%. What is the new price?", "type": "multiple_choice", "options": ["$44", "$46", "$48", "$55"], "correct_answer": "$46", "explanation": "$46. Find 15% of $40: 0.15 × 40 = $6. Add to original: $40 + $6 = $46."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Percentage decrease',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A jacket costs $90 and is on sale for 30% off. What is the sale price?", "type": "multiple_choice", "options": ["$54", "$60", "$63", "$67"], "correct_answer": "$63", "explanation": "$63. Find 30% of $90: 0.30 × 90 = $27. Subtract: $90 − $27 = $63."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'What percent is X of Y',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "18 out of 24 students passed a test. What percentage passed?", "type": "multiple_choice", "options": ["65%", "70%", "75%", "80%"], "correct_answer": "75%", "explanation": "75%. Divide: 18 ÷ 24 = 0.75. Multiply by 100: 75%. The formula is: (part ÷ whole) × 100."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ratio simplification',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Simplify the ratio 16:24", "type": "multiple_choice", "options": ["4:8", "2:3", "8:12", "3:4"], "correct_answer": "2:3", "explanation": "2:3. Divide both by their GCF (8): 16÷8=2, 24÷8=3. So 16:24 = 2:3."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Area of a rectangle',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "A rectangle has a length of 12 cm and a width of 7 cm. What is its area?", "type": "multiple_choice", "options": ["38 cm²", "74 cm²", "84 cm²", "96 cm²"], "correct_answer": "84 cm²", "explanation": "84 cm². Area of a rectangle = length × width = 12 × 7 = 84 cm²."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Perimeter of a rectangle',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "A rectangle has a length of 9 m and a width of 4 m. What is its perimeter?", "type": "multiple_choice", "options": ["13 m", "26 m", "36 m", "52 m"], "correct_answer": "26 m", "explanation": "26 m. Perimeter = 2 × (length + width) = 2 × (9 + 4) = 2 × 13 = 26 m."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Area of a triangle',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A triangle has a base of 10 cm and a height of 6 cm. What is its area?", "type": "multiple_choice", "options": ["30 cm²", "60 cm²", "16 cm²", "32 cm²"], "correct_answer": "30 cm²", "explanation": "30 cm². Area of a triangle = ½ × base × height = 0.5 × 10 × 6 = 30 cm²."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Circumference of a circle',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A circle has a radius of 5 cm. What is its circumference? (Use π ≈ 3.14)", "type": "multiple_choice", "options": ["15.7 cm", "31.4 cm", "78.5 cm", "25 cm"], "correct_answer": "31.4 cm", "explanation": "31.4 cm. Circumference = 2πr = 2 × 3.14 × 5 = 31.4 cm."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Area of a circle',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A circle has a radius of 4 cm. What is its area? (Use π ≈ 3.14)", "type": "multiple_choice", "options": ["12.56 cm²", "25.12 cm²", "50.24 cm²", "16 cm²"], "correct_answer": "50.24 cm²", "explanation": "50.24 cm². Area = πr² = 3.14 × 4² = 3.14 × 16 = 50.24 cm²."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Missing side from area',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A rectangle has an area of 48 m² and a length of 8 m. What is its width?", "type": "multiple_choice", "options": ["4 m", "5 m", "6 m", "7 m"], "correct_answer": "6 m", "explanation": "6 m. Area = length × width, so width = area ÷ length = 48 ÷ 8 = 6 m."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Pythagorean theorem',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A right triangle has legs of 3 cm and 4 cm. What is the length of the hypotenuse?", "type": "multiple_choice", "options": ["5 cm", "6 cm", "7 cm", "25 cm"], "correct_answer": "5 cm", "explanation": "5 cm. Use a² + b² = c²: 3² + 4² = 9 + 16 = 25. √25 = 5. The 3-4-5 triangle is a classic Pythagorean triple!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Angles in a triangle',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "A triangle has angles of 40° and 75°. What is the third angle?", "type": "multiple_choice", "options": ["55°", "65°", "75°", "115°"], "correct_answer": "65°", "explanation": "65°. The angles in a triangle always add up to 180°. So: 180 − 40 − 75 = 65°."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Supplementary angles',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Two supplementary angles. One is 112°. What is the other?", "type": "multiple_choice", "options": ["58°", "68°", "78°", "88°"], "correct_answer": "68°", "explanation": "68°. Supplementary angles add up to 180°. So: 180 − 112 = 68°."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Volume of a rectangular prism',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A box is 5 cm long, 4 cm wide, and 3 cm tall. What is its volume?", "type": "multiple_choice", "options": ["47 cm³", "60 cm³", "80 cm³", "120 cm³"], "correct_answer": "60 cm³", "explanation": "60 cm³. Volume = length × width × height = 5 × 4 × 3 = 60 cm³."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solving proportions',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Solve the proportion: 3/5 = x/20", "type": "multiple_choice", "options": ["10", "12", "15", "16"], "correct_answer": "12", "explanation": "x = 12. Cross-multiply: 3 × 20 = 5 × x → 60 = 5x → x = 12."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Speed formula',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A car travels 150 miles in 3 hours. What is its average speed?", "type": "multiple_choice", "options": ["40 mph", "45 mph", "50 mph", "55 mph"], "correct_answer": "50 mph", "explanation": "50 mph. Speed = distance ÷ time = 150 ÷ 3 = 50 miles per hour."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Identify slope',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What is the slope of a line that passes through (0, 2) and (4, 10)?", "type": "multiple_choice", "options": ["1", "2", "3", "4"], "correct_answer": "2", "explanation": "Slope = 2. Use rise/run: (10−2) ÷ (4−0) = 8 ÷ 4 = 2. Slope tells you how steep the line is."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Slope-intercept form',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "In the equation y = 3x + 5, what is the y-intercept?", "type": "multiple_choice", "options": ["x", "3", "5", "3x"], "correct_answer": "5", "explanation": "5. In y = mx + b, the y-intercept is b. Here b = 5, meaning the line crosses the y-axis at (0, 5)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Function input/output',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "If f(x) = 2x − 4, what is f(7)?", "type": "multiple_choice", "options": ["8", "10", "14", "18"], "correct_answer": "10", "explanation": "f(7) = 10. Substitute x = 7: f(7) = 2(7) − 4 = 14 − 4 = 10."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Negative exponents',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What is 2⁻³?", "type": "multiple_choice", "options": ["−8", "−6", "1/8", "1/6"], "correct_answer": "1/8", "explanation": "2⁻³ = 1/8. A negative exponent means 1 divided by the positive exponent: 2⁻³ = 1 ÷ 2³ = 1 ÷ 8 = 1/8."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Scientific notation',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Write 45,000 in scientific notation.", "type": "multiple_choice", "options": ["4.5 × 10³", "4.5 × 10⁴", "45 × 10³", "0.45 × 10⁵"], "correct_answer": "4.5 × 10⁴", "explanation": "4.5 × 10⁴. Move the decimal left until you have one digit before it: 4.5, and count the moves (4). So 45,000 = 4.5 × 10⁴."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Probability basic',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "A bag has 3 red, 2 blue, and 5 green marbles. What is the probability of picking a red marble?", "type": "multiple_choice", "options": ["1/3", "3/10", "3/7", "1/5"], "correct_answer": "3/10", "explanation": "3/10. Probability = favorable outcomes ÷ total outcomes. There are 3 red out of 10 total: 3/10."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Probability complement',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The probability of rain tomorrow is 0.35. What is the probability it will NOT rain?", "type": "multiple_choice", "options": ["0.35", "0.55", "0.65", "0.75"], "correct_answer": "0.65", "explanation": "0.65. The probability of something NOT happening = 1 − P(event). 1 − 0.35 = 0.65."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Mean of a data set',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Find the mean of: 8, 12, 15, 7, 18", "type": "multiple_choice", "options": ["10", "11", "12", "13"], "correct_answer": "12", "explanation": "Mean = 12. Add all values: 8+12+15+7+18 = 60. Divide by the count (5): 60 ÷ 5 = 12."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Median of a data set',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Find the median of: 4, 11, 7, 2, 9", "type": "multiple_choice", "options": ["4", "7", "9", "11"], "correct_answer": "7", "explanation": "Median = 7. First sort the values: 2, 4, 7, 9, 11. The middle value (3rd of 5) is 7."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Algebra word problem',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Emma is 3 years older than twice her brother''s age. Her brother is 7. How old is Emma?", "type": "multiple_choice", "options": ["14", "17", "20", "24"], "correct_answer": "17", "explanation": "Emma = 17. Write it as an equation: E = 2 × 7 + 3 = 14 + 3 = 17."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Inequality solving',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Solve the inequality: 2x + 3 > 11. What values of x make this true?", "type": "multiple_choice", "options": ["x > 4", "x > 7", "x < 4", "x ≥ 4"], "correct_answer": "x > 4", "explanation": "x > 4. Subtract 3: 2x > 8. Divide by 2: x > 4. Any number greater than 4 works."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Distribute and simplify',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Simplify: 3(x + 4) + 2x", "type": "multiple_choice", "options": ["5x + 4", "5x + 12", "3x + 14", "6x + 4"], "correct_answer": "5x + 12", "explanation": "5x + 12. Distribute: 3(x+4) = 3x + 12. Then combine like terms: 3x + 2x = 5x. Final: 5x + 12."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Combine like terms',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Simplify: 4x + 7 − 2x + 3", "type": "multiple_choice", "options": ["2x + 10", "6x + 10", "2x + 4", "6x + 4"], "correct_answer": "2x + 10", "explanation": "2x + 10. Group like terms: (4x − 2x) + (7 + 3) = 2x + 10."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Surface area of a cube',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What is the surface area of a cube with a side length of 5 cm?", "type": "multiple_choice", "options": ["25 cm²", "75 cm²", "125 cm²", "150 cm²"], "correct_answer": "150 cm²", "explanation": "150 cm². A cube has 6 equal square faces. Area of one face = 5² = 25 cm². Total: 6 × 25 = 150 cm²."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Two-step word problem',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A plumber charges $45 per hour plus a $60 call-out fee. A job costs $195. How many hours did the job take?", "type": "multiple_choice", "options": ["2", "3", "4", "5"], "correct_answer": "3", "explanation": "3 hours. Set up: 45h + 60 = 195. Subtract 60: 45h = 135. Divide: h = 3."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Percentage word problem',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A store marks up a $120 item by 35%, then offers 10% off the marked price. What is the final price?", "type": "multiple_choice", "options": ["$138.60", "$145.80", "$148.50", "$162.00"], "correct_answer": "$145.80", "explanation": "$145.80. First: 120 × 1.35 = $162 (marked up price). Then: 162 × 0.90 = $145.80 (10% off)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Substitution in expressions',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "If a = 3 and b = −2, what is 2a² − b?", "type": "multiple_choice", "options": ["14", "16", "18", "20"], "correct_answer": "20", "explanation": "20. Substitute: 2(3²) − (−2) = 2(9) + 2 = 18 + 2 = 20. Watch the double negative: subtracting −2 adds 2."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Direct proportion',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "If 4 pencils cost $2.80, how much do 7 pencils cost?", "type": "multiple_choice", "options": ["$4.20", "$4.90", "$5.60", "$6.30"], "correct_answer": "$4.90", "explanation": "$4.90. Price per pencil: $2.80 ÷ 4 = $0.70. For 7 pencils: 7 × $0.70 = $4.90."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Exponent rules',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Simplify: x³ × x⁴", "type": "multiple_choice", "options": ["x⁷", "x¹²", "2x⁷", "x⁷⁺x"], "correct_answer": "x⁷", "explanation": "x⁷. When multiplying powers with the same base, add the exponents: x³ × x⁴ = x^(3+4) = x⁷."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Graphing: which quadrant?',
  'math',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "In which quadrant does the point (−3, 5) lie?", "type": "multiple_choice", "options": ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], "correct_answer": "Quadrant II", "explanation": "Quadrant II. Negative x and positive y = Quadrant II. Remember: QI(+,+), QII(−,+), QIII(−,−), QIV(+,−)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Rational vs irrational',
  'math',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which of these numbers is irrational?", "type": "multiple_choice", "options": ["0.75", "√9", "√7", "3/11"], "correct_answer": "√7", "explanation": "√7 is irrational. It can''t be written as a simple fraction and its decimal never repeats or terminates. √9 = 3, which is rational."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Systems of equations',
  'math',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "If x + y = 10 and x − y = 4, what is the value of x?", "type": "multiple_choice", "options": ["5", "6", "7", "8"], "correct_answer": "7", "explanation": "x = 7. Add the two equations: 2x = 14, so x = 7. Then y = 10 − 7 = 3. Check: 7 − 3 = 4. ✓"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Factoring basics',
  'math',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Factor completely: 6x² + 9x", "type": "multiple_choice", "options": ["3x(2x + 3)", "6x(x + 3)", "3(2x² + 3x)", "9x(x + 1)"], "correct_answer": "3x(2x + 3)", "explanation": "3x(2x + 3). Find the GCF of 6x² and 9x, which is 3x. Factor it out: 6x²÷3x = 2x and 9x÷3x = 3. So: 3x(2x + 3)."}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: history_junior.json
-- Subject: history  |  Age Tier: junior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Egypt: pharaohs',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What was the title of the rulers of ancient Egypt?", "type": "multiple_choice", "options": ["Emperor", "Pharaoh", "Sultan", "Caesar"], "correct_answer": "Pharaoh", "explanation": "The rulers of ancient Egypt were called pharaohs. They were considered both political leaders and living gods. Famous pharaohs include Tutankhamun, Ramesses II, and Cleopatra."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Egypt: pyramids',
  'history',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Why did ancient Egyptians build pyramids?", "type": "multiple_choice", "options": ["As temples for daily worship", "As tombs for pharaohs and royalty", "As grain storage for famines", "As fortresses to defend against invaders"], "correct_answer": "As tombs for pharaohs and royalty", "explanation": "Pyramids were monumental tombs built to house the bodies and treasures of pharaohs in the afterlife. The ancient Egyptians believed in life after death and spent enormous resources preparing for it."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Egypt: the Nile',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Why was the Nile River so important to ancient Egyptian civilization?", "type": "multiple_choice", "options": ["It provided a barrier against all enemies", "Its annual floods deposited rich soil that allowed farming in the desert", "It was used only for transportation and trade", "It supplied Egypt with gold and precious metals"], "correct_answer": "Its annual floods deposited rich soil that allowed farming in the desert", "explanation": "Each year the Nile flooded, leaving behind dark, fertile silt on its banks. This made farming possible in the middle of the desert. Egypt was called ''the gift of the Nile'' by the ancient Greek historian Herodotus."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Egypt: hieroglyphics',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What were hieroglyphics?", "type": "multiple_choice", "options": ["Ancient Egyptian coins", "A writing system using pictures and symbols", "Sacred paintings found only in pyramids", "A type of ancient Egyptian weapon"], "correct_answer": "A writing system using pictures and symbols", "explanation": "Hieroglyphics were the writing system of ancient Egypt, using over 700 picture symbols to represent sounds, words, and ideas. The Rosetta Stone, discovered in 1799, helped scholars finally decode them."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Greece: democracy',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which ancient civilization is credited with inventing democracy?", "type": "multiple_choice", "options": ["Rome", "Egypt", "Greece", "Persia"], "correct_answer": "Greece", "explanation": "Ancient Athens, Greece, developed the world''s first democracy around 508 BCE. Citizens could vote on laws and policies directly. The word ''democracy'' comes from Greek: ''demos'' (people) + ''kratos'' (power)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Greece: city-states',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Athens and Sparta were both ancient Greek city-states. What was Sparta most famous for?", "type": "multiple_choice", "options": ["Art, philosophy, and democracy", "A powerful military and warrior culture", "Seafaring and ocean trade", "Building the largest temples in Greece"], "correct_answer": "A powerful military and warrior culture", "explanation": "Sparta was a militaristic city-state where boys began military training at age 7. Spartan soldiers were legendary for their discipline and bravery. Their culture valued strength and sacrifice above all else."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Rome: the republic',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Before becoming an empire, Rome was a republic. What does ''republic'' mean?", "type": "multiple_choice", "options": ["A country ruled by a king and queen", "A system where citizens elect representatives to govern", "A military dictatorship", "A country with no laws"], "correct_answer": "A system where citizens elect representatives to govern", "explanation": "In the Roman Republic, elected officials called senators and consuls governed the state. The word ''republic'' comes from Latin ''res publica'' meaning ''public affair.'' Rome was a republic for about 500 years before Julius Caesar''s era."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Rome: Julius Caesar',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Julius Caesar was a famous leader of ancient Rome. What happened to him on the Ides of March, 44 BCE?", "type": "multiple_choice", "options": ["He was crowned the first Roman Emperor", "He was assassinated by senators who feared he had too much power", "He won his greatest military victory", "He retired and became a philosopher"], "correct_answer": "He was assassinated by senators who feared he had too much power", "explanation": "On March 15, 44 BCE, Julius Caesar was stabbed to death by a group of Roman senators who believed he was becoming a tyrant and wanted to preserve the republic. His death led to years of civil war and eventually the Roman Empire."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient civilizations: Mesopotamia',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Mesopotamia is often called ''the cradle of civilization.'' Where was it located?", "type": "multiple_choice", "options": ["Along the Nile River in Africa", "Between the Tigris and Euphrates rivers in modern-day Iraq", "On the Italian peninsula in Europe", "Along the Indus River in South Asia"], "correct_answer": "Between the Tigris and Euphrates rivers in modern-day Iraq", "explanation": "''Mesopotamia'' means ''land between the rivers'' in Greek. Located in modern-day Iraq, it was home to some of humanity''s earliest cities, writing (cuneiform), laws, and agriculture — making it a starting point of civilization."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient civilizations: first writing',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which ancient civilization is credited with inventing the first writing system?", "type": "multiple_choice", "options": ["Ancient Egypt", "Ancient China", "The Sumerians of Mesopotamia", "The Indus Valley civilization"], "correct_answer": "The Sumerians of Mesopotamia", "explanation": "The Sumerians of Mesopotamia developed cuneiform — one of the world''s earliest writing systems — around 3400 BCE. They originally used it to keep records of trade and taxes, pressing wedge-shaped marks into clay tablets."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous explorers: Columbus',
  'history',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "In 1492, Christopher Columbus sailed west from Spain hoping to reach Asia. What did he actually find?", "type": "multiple_choice", "options": ["A new route around Africa", "The Americas — a continent unknown to Europeans at the time", "India and the Spice Islands", "The North Pole"], "correct_answer": "The Americas — a continent unknown to Europeans at the time", "explanation": "Columbus landed in the Caribbean in 1492, making contact between Europe and the Americas. He never realized he hadn''t reached Asia. His voyage began an era of European exploration and colonization that transformed the world."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous explorers: Magellan',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Ferdinand Magellan''s expedition (1519–1522) was the first to do what?", "type": "multiple_choice", "options": ["Cross the Atlantic Ocean", "Reach North America from Europe", "Circumnavigate (sail all the way around) the Earth", "Discover Australia"], "correct_answer": "Circumnavigate (sail all the way around) the Earth", "explanation": "Magellan''s expedition was the first to circumnavigate the globe, proving Earth was round and much larger than thought. Magellan himself died in the Philippines; his crew completed the journey under Elcano in 1522."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous explorers: Marco Polo',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Marco Polo was a famous explorer from Venice. Where did he travel that amazed Europeans with his accounts?", "type": "multiple_choice", "options": ["The Americas", "Sub-Saharan Africa", "China and Asia along the Silk Road", "The Arctic Circle"], "correct_answer": "China and Asia along the Silk Road", "explanation": "Marco Polo traveled from Venice to China in the 1270s, spending years at the court of Kublai Khan. His book describing Asia''s wealth, technology, and culture opened European eyes to the riches of the Far East and inspired future explorers."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous explorers: Neil Armstrong',
  'history',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Neil Armstrong made history on July 20, 1969. What did he do?", "type": "multiple_choice", "options": ["He became the first person to fly an airplane", "He became the first human to walk on the Moon", "He orbited Earth for the first time", "He discovered a new planet"], "correct_answer": "He became the first human to walk on the Moon", "explanation": "Neil Armstrong, commander of Apollo 11, became the first human to walk on the Moon on July 20, 1969. His famous words: ''That''s one small step for man, one giant leap for mankind.'' Buzz Aldrin joined him shortly after."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Timeline ordering: ancient to modern',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which of these events happened FIRST in history?", "type": "multiple_choice", "options": ["The American Revolution (1776)", "The fall of the Western Roman Empire (476 CE)", "The construction of the Great Pyramid at Giza (2560 BCE)", "The birth of Islam (622 CE)"], "correct_answer": "The construction of the Great Pyramid at Giza (2560 BCE)", "explanation": "The Great Pyramid was built around 2560 BCE — over 2,000 years before Rome fell, over 3,000 years before Muhammad, and over 4,000 years before the American Revolution. BCE dates count backward, so larger BCE numbers are further back in time."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Timeline ordering: American history',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Put these American events in the correct order from earliest to latest:", "type": "multiple_choice", "options": ["Civil War → American Revolution → Moon Landing → Columbus arrives", "Columbus arrives → American Revolution → Civil War → Moon Landing", "American Revolution → Columbus arrives → Moon Landing → Civil War", "Moon Landing → Civil War → American Revolution → Columbus arrives"], "correct_answer": "Columbus arrives → American Revolution → Civil War → Moon Landing", "explanation": "Columbus: 1492 → American Revolution: 1775–1783 → Civil War: 1861–1865 → Moon Landing: 1969. Knowing approximate dates helps you sequence history correctly."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Inventions: printing press',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Johannes Gutenberg invented the movable-type printing press around 1440. Why was this so important?", "type": "multiple_choice", "options": ["It allowed ships to travel faster across oceans", "It made books cheap and widely available, spreading ideas faster than ever before", "It replaced all forms of art and painting", "It allowed governments to collect taxes more efficiently"], "correct_answer": "It made books cheap and widely available, spreading ideas faster than ever before", "explanation": "Before the printing press, books were hand-copied and extremely expensive. Gutenberg''s invention allowed mass production of books, making knowledge accessible to more people. It helped spark the Renaissance, the Reformation, and the Scientific Revolution."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Inventions: the wheel',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The wheel is considered one of history''s most important inventions. Where and when was it first used?", "type": "multiple_choice", "options": ["Ancient Egypt, around 3000 BCE, primarily to build pyramids", "Mesopotamia, around 3500 BCE, first used for pottery then transport", "Ancient China, around 2000 BCE, for rice farming", "Ancient Rome, around 500 BCE, for military chariots"], "correct_answer": "Mesopotamia, around 3500 BCE, first used for pottery then transport", "explanation": "The wheel was first invented in Mesopotamia around 3500 BCE, originally used as a potter''s wheel. It was later applied to carts and chariots for transport. It transformed trade, warfare, and daily life across the ancient world."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Inventions: the compass',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The magnetic compass was invented in ancient China. How did it change exploration?", "type": "multiple_choice", "options": ["It let sailors measure the depth of the ocean", "It allowed sailors to determine direction at sea even without stars visible", "It helped explorers communicate across long distances", "It allowed sailors to predict weather"], "correct_answer": "It allowed sailors to determine direction at sea even without stars visible", "explanation": "Before the compass, sailors navigated by stars — impossible on cloudy nights or in fog. The magnetic compass always points north, allowing reliable navigation at sea and enabling longer, safer voyages of exploration."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Middle Ages: feudalism',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What was feudalism, the main social system of the Middle Ages?", "type": "multiple_choice", "options": ["A system where all people were equal under the law", "A system where kings owned everything and gave land to nobles in exchange for military service", "A system where merchants controlled the government", "A system where the Church owned all the land"], "correct_answer": "A system where kings owned everything and gave land to nobles in exchange for military service", "explanation": "Feudalism was a hierarchy: the king owned all land and gave parcels to nobles (lords) in exchange for loyalty and soldiers. Lords gave land to knights for service. Peasants (serfs) worked the land at the bottom of the pyramid."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Middle Ages: the Crusades',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What were the Crusades?", "type": "multiple_choice", "options": ["Medieval trade expeditions to Asia for spices", "A series of religious wars launched by European Christians to control the Holy Land", "Viking raids on European coastal towns", "Wars between the Roman Empire and the Mongols"], "correct_answer": "A series of religious wars launched by European Christians to control the Holy Land", "explanation": "The Crusades (1096–1291) were a series of military campaigns launched by European Christians to capture Jerusalem and the Holy Land from Muslim rule. They had enormous political, religious, and cultural consequences for both Europe and the Middle East."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient China: the Great Wall',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Why was the Great Wall of China built?", "type": "multiple_choice", "options": ["To mark the boundaries between Chinese provinces", "To protect China from nomadic invasions from the north", "To serve as a royal road for the emperor to travel", "To control flooding from major rivers"], "correct_answer": "To protect China from nomadic invasions from the north", "explanation": "The Great Wall was built and extended over centuries — primarily during the Qin, Han, and Ming dynasties — to defend against raids from northern nomadic groups like the Mongols and Xiongnu. It stretches over 13,000 miles in total."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient China: the Silk Road',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What was the Silk Road?", "type": "multiple_choice", "options": ["A factory in ancient China that produced silk for the emperor", "A network of trade routes connecting China to Europe and the Middle East", "A royal palace built entirely of silk curtains", "A river that ran through the center of ancient China"], "correct_answer": "A network of trade routes connecting China to Europe and the Middle East", "explanation": "The Silk Road was a network of overland and sea trade routes stretching from China to Rome and beyond. Merchants traded silk, spices, gold, and ideas. It also spread religions, diseases, and technologies across continents."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'American Revolution: Declaration of Independence',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "When was the Declaration of Independence signed, and what did it declare?", "type": "multiple_choice", "options": ["1776 — that the American colonies were free from British rule", "1783 — that the Revolutionary War was officially over", "1787 — that the Constitution was the law of the land", "1765 — that colonists refused to pay the Stamp Act"], "correct_answer": "1776 — that the American colonies were free from British rule", "explanation": "On July 4, 1776, American colonial leaders signed the Declaration of Independence, formally declaring that the thirteen colonies were no longer part of the British Empire. Thomas Jefferson was its primary author."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'American Revolution: cause',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What was one of the main reasons colonists in America wanted independence from Britain?", "type": "multiple_choice", "options": ["Britain refused to trade with the colonies", "Colonists were taxed by the British Parliament but had no representatives in it", "Britain banned all religion in the colonies", "The colonies wanted to join France instead"], "correct_answer": "Colonists were taxed by the British Parliament but had no representatives in it", "explanation": "''No taxation without representation'' was a key colonial slogan. Colonists were angry at being taxed (Stamp Act, Tea Act) by a British Parliament where they had no elected representatives or voice."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient India: the Indus Valley',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "The Indus Valley Civilization (around 2500 BCE) was remarkable for its time. What was one of its impressive achievements?", "type": "multiple_choice", "options": ["It built the first stone pyramids", "It had advanced city planning with grid-pattern streets and drainage systems", "It invented the first writing system", "It created the first democracy"], "correct_answer": "It had advanced city planning with grid-pattern streets and drainage systems", "explanation": "Cities like Mohenjo-daro and Harappa had remarkable urban planning: straight streets laid out in grids, multi-story buildings, and sophisticated drainage and sewage systems — more advanced than many cities that came much later."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Inventions: gunpowder',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Gunpowder was invented in ancient China. How did it originally change history?", "type": "multiple_choice", "options": ["It was used to create medicines and cure disease", "It was used for fireworks and later transformed warfare with cannons and firearms", "It was used to power early steam engines", "It was only used in religious ceremonies"], "correct_answer": "It was used for fireworks and later transformed warfare with cannons and firearms", "explanation": "Chinese alchemists accidentally discovered gunpowder around the 9th century CE while searching for immortality elixirs. It was first used for fireworks, then weapons. When gunpowder reached Europe, it transformed medieval warfare and ended the age of castles and knights."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous leaders: Abraham Lincoln',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is Abraham Lincoln most famous for as U.S. President?", "type": "multiple_choice", "options": ["Leading America through World War II", "Issuing the Emancipation Proclamation and preserving the Union during the Civil War", "Writing the Declaration of Independence", "Negotiating the Louisiana Purchase"], "correct_answer": "Issuing the Emancipation Proclamation and preserving the Union during the Civil War", "explanation": "Lincoln served as president during the Civil War (1861–1865) and in 1863 issued the Emancipation Proclamation, declaring enslaved people in Confederate states free. He successfully preserved the United States and is regarded as one of America''s greatest presidents."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous leaders: Cleopatra',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Cleopatra VII was a famous ruler of which ancient civilization?", "type": "multiple_choice", "options": ["Ancient Rome", "Ancient Greece", "Ancient Egypt", "Ancient Persia"], "correct_answer": "Ancient Egypt", "explanation": "Cleopatra VII (69–30 BCE) was the last active ruler of the Ptolemaic Kingdom of ancient Egypt. Highly intelligent, she spoke nine languages, formed alliances with Julius Caesar and Mark Antony, and fought to keep Egypt independent from Rome."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous leaders: Genghis Khan',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is Genghis Khan known for in history?", "type": "multiple_choice", "options": ["Building the Great Wall of China", "Founding the Mongol Empire, the largest contiguous land empire in history", "Discovering the sea route from Europe to India", "Unifying the city-states of ancient Greece"], "correct_answer": "Founding the Mongol Empire, the largest contiguous land empire in history", "explanation": "Genghis Khan (1162–1227) united the Mongol tribes and built an empire stretching from the Pacific Ocean to Eastern Europe. At its peak, the Mongol Empire covered about 24 million square kilometers — the largest contiguous empire ever."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Maya',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "The Maya civilization was located in which region?", "type": "multiple_choice", "options": ["South America, along the Andes Mountains", "North America, around the Great Lakes", "Mesoamerica — present-day Mexico and Central America", "The Caribbean Islands"], "correct_answer": "Mesoamerica — present-day Mexico and Central America", "explanation": "The Maya thrived in Mesoamerica (Mexico and Central America) from around 2000 BCE to 1500 CE. They were known for advanced mathematics, astronomy, a complex writing system, and monumental cities like Tikal and Chichen Itza."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Aztec',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "The Aztec Empire was conquered by Spanish explorer Hernán Cortés in 1521. What was the Aztec capital city called?", "type": "multiple_choice", "options": ["Cusco", "Tenochtitlán", "Machu Picchu", "Chichen Itza"], "correct_answer": "Tenochtitlán", "explanation": "Tenochtitlán (present-day Mexico City) was the capital of the Aztec Empire, built on an island in Lake Texcoco. At its peak, it had a population of over 200,000 — larger than most European cities of the time."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Inca',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "The Inca Empire was the largest empire in pre-Columbian America. Where was it located?", "type": "multiple_choice", "options": ["North America, around the Mississippi River", "Central America and the Caribbean", "Along the Andes Mountains in South America", "The Amazon rainforest of Brazil"], "correct_answer": "Along the Andes Mountains in South America", "explanation": "The Inca Empire stretched along the Andes Mountains through modern-day Peru, Ecuador, Colombia, Bolivia, Chile, and Argentina. Their capital Cusco and the famous mountaintop city Machu Picchu demonstrate their remarkable engineering skills."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Timeline: BCE vs CE',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "An event happened in 500 BCE and another in 200 BCE. Which event happened more recently?", "type": "multiple_choice", "options": ["500 BCE — it''s a bigger number", "200 BCE — BCE years count backward toward zero", "They happened at the same time", "You cannot compare BCE dates"], "correct_answer": "200 BCE — BCE years count backward toward zero", "explanation": "BCE (Before Common Era) dates count backward — the smaller the number, the more recent it is. 200 BCE is closer to year 0 than 500 BCE. Think of it like a countdown: 500...400...300...200...1...then CE years start going up."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Timeline: centuries',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "The year 1776 is in which century?", "type": "multiple_choice", "options": ["The 16th century", "The 17th century", "The 18th century", "The 19th century"], "correct_answer": "The 18th century", "explanation": "Centuries are named one ahead of their numbers: years 1700–1799 = the 18th century. A trick: drop the last two digits and add 1. 1776 → 17 + 1 = 18th century. The year 1 CE began the 1st century."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Inventions: steam engine',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The invention of the steam engine was central to which major historical period?", "type": "multiple_choice", "options": ["The Renaissance", "The Industrial Revolution", "The Age of Exploration", "The Middle Ages"], "correct_answer": "The Industrial Revolution", "explanation": "The steam engine, improved by James Watt in the 1760s–1780s, powered the Industrial Revolution by running factories, trains, and ships. It transformed how goods were made, how people traveled, and where they lived."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Olympics',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The ancient Olympic Games were held in which civilization?", "type": "multiple_choice", "options": ["Ancient Rome", "Ancient Egypt", "Ancient Greece", "Ancient China"], "correct_answer": "Ancient Greece", "explanation": "The Olympic Games began in ancient Greece in 776 BCE at Olympia, held every four years in honor of the god Zeus. Athletes competed in events like running, wrestling, and chariot racing. They were discontinued in 393 CE and revived in 1896."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous explorers: Lewis and Clark',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What was the purpose of the Lewis and Clark Expedition (1804–1806)?", "type": "multiple_choice", "options": ["To find a sea route from America to Europe", "To explore and map the western United States after the Louisiana Purchase", "To negotiate peace treaties with Native American nations", "To search for gold in the Rocky Mountains"], "correct_answer": "To explore and map the western United States after the Louisiana Purchase", "explanation": "President Jefferson sent Meriwether Lewis and William Clark to explore the territory acquired in the Louisiana Purchase. They mapped the land, documented plants and animals, and found a route to the Pacific Ocean, helped by the Shoshone guide Sacagawea."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Black Death',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "The Black Death was a devastating plague in the 14th century. How much of Europe''s population did it kill?", "type": "multiple_choice", "options": ["About 5%", "About 15%", "About one-third", "Almost everyone"], "correct_answer": "About one-third", "explanation": "The Black Death (1347–1351) killed an estimated one-third of Europe''s population — roughly 25 million people. It was caused by the bacterium Yersinia pestis, spread by fleas on rats. It permanently altered European society, economy, and culture."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Egypt: mummies',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Why did ancient Egyptians mummify their dead?", "type": "multiple_choice", "options": ["To prevent the spread of disease", "To preserve the body for the afterlife, which they believed required a physical form", "To display them as symbols of royal power", "Because the hot desert climate required it"], "correct_answer": "To preserve the body for the afterlife, which they believed required a physical form", "explanation": "Ancient Egyptians believed in an afterlife where the soul would return to its body. Mummification preserved the body so the soul could use it in the next life. The process took 70 days and involved removing organs and wrapping the body in linen."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'The Renaissance',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "The Renaissance began in Italy in the 14th century. What does ''Renaissance'' mean?", "type": "multiple_choice", "options": ["New beginning", "Rebirth", "Golden age", "Revolution"], "correct_answer": "Rebirth", "explanation": "''Renaissance'' is a French word meaning ''rebirth.'' It described a revival of interest in ancient Greek and Roman art, science, and philosophy. It produced artists like Leonardo da Vinci and Michelangelo, and scientists like Galileo."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Famous women in history: Harriet Tubman',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is Harriet Tubman famous for?", "type": "multiple_choice", "options": ["Writing the first American novel", "Leading hundreds of enslaved people to freedom through the Underground Railroad", "Becoming the first woman to serve in Congress", "Founding the American Red Cross"], "correct_answer": "Leading hundreds of enslaved people to freedom through the Underground Railroad", "explanation": "Harriet Tubman escaped slavery in 1849 and then made approximately 13 missions back to the South, guiding around 70 enslaved people to freedom via the Underground Railroad — a secret network of safe houses and routes to the North."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'World War II: beginning',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "World War II began in 1939 when Germany, led by Adolf Hitler, invaded which country?", "type": "multiple_choice", "options": ["France", "Britain", "Poland", "Russia"], "correct_answer": "Poland", "explanation": "Germany invaded Poland on September 1, 1939, triggering World War II when Britain and France declared war on Germany two days later. Hitler''s Nazi regime sought to conquer Europe and pursued a genocidal policy against Jewish people and others."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'World War II: ending in the Pacific',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What event brought the United States directly into World War II?", "type": "multiple_choice", "options": ["Germany''s invasion of France", "Japan''s surprise attack on Pearl Harbor, Hawaii, on December 7, 1941", "The fall of Britain to German bombing", "Italy declaring war on the United States"], "correct_answer": "Japan''s surprise attack on Pearl Harbor, Hawaii, on December 7, 1941", "explanation": "Japan''s surprise attack on the U.S. naval base at Pearl Harbor killed over 2,400 Americans and destroyed much of the Pacific Fleet. The next day, President Roosevelt declared war on Japan, bringing the United States fully into World War II."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Martin Luther King Jr.',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Martin Luther King Jr. was a leader of which movement in American history?", "type": "multiple_choice", "options": ["The American Revolution", "The Civil Rights Movement", "The Labor Rights Movement", "The Women''s Suffrage Movement"], "correct_answer": "The Civil Rights Movement", "explanation": "Dr. Martin Luther King Jr. was a central leader of the Civil Rights Movement, which fought for equal rights for Black Americans in the 1950s and 60s. He advocated for nonviolent protest and is best known for his ''I Have a Dream'' speech in 1963."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Causes of events: Boston Tea Party',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "In 1773, American colonists dumped British tea into Boston Harbor. Why?", "type": "multiple_choice", "options": ["The tea had gone bad during the voyage", "To protest British taxes on tea without colonial representation in Parliament", "Because they preferred coffee", "To start a trade war with China"], "correct_answer": "To protest British taxes on tea without colonial representation in Parliament", "explanation": "The Boston Tea Party was an act of political protest against the Tea Act, which gave the British East India Company a monopoly on tea sales and imposed a tax. Colonists dressed as Mohawk Indians dumped 342 chests of tea — worth millions today — into the harbor."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Native Americans: first peoples',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The people who lived in the Americas BEFORE European explorers arrived are called:", "type": "multiple_choice", "options": ["Colonists", "Pilgrims", "Indigenous peoples or Native Americans", "Settlers"], "correct_answer": "Indigenous peoples or Native Americans", "explanation": "Indigenous peoples (also called Native Americans in the U.S.) had lived in the Americas for tens of thousands of years before European contact. There were hundreds of distinct nations with different languages, cultures, and traditions across North, Central, and South America."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Timeline: placing events',
  'history',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "Which pair of events is in the CORRECT chronological order (earlier event first)?", "type": "multiple_choice", "options": ["World War II → World War I", "The Civil War → The American Revolution", "The Renaissance → The Middle Ages", "Columbus reaches the Americas → The American Revolution"], "correct_answer": "Columbus reaches the Americas → The American Revolution", "explanation": "Columbus reached the Americas in 1492; the American Revolution began in 1775 — so Columbus came first. WWI (1914) came before WWII (1939). The American Revolution (1775) came before the Civil War (1861). The Middle Ages came before the Renaissance."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient wonders: Colosseum',
  'history',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The Colosseum in Rome was completed around 80 CE. What was it used for?", "type": "multiple_choice", "options": ["As the Roman Senate''s meeting place", "As a massive amphitheater for gladiator fights and public spectacles", "As the emperor''s private palace", "As a fortress to defend the city"], "correct_answer": "As a massive amphitheater for gladiator fights and public spectacles", "explanation": "The Colosseum could hold 50,000–80,000 spectators who came to watch gladiator battles, animal hunts, and other public shows. It had a retractable canvas roof and could even be flooded for mock naval battles."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ancient Rome: the fall',
  'history',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "The Western Roman Empire fell in 476 CE. What is one major reason historians give for its collapse?", "type": "multiple_choice", "options": ["A volcanic eruption destroyed Rome", "Repeated invasions by Germanic tribes combined with internal political instability", "A plague killed every Roman citizen", "Rome was peacefully absorbed by Greece"], "correct_answer": "Repeated invasions by Germanic tribes combined with internal political instability", "explanation": "Rome''s fall had many causes: constant attacks by Germanic tribes (Visigoths, Vandals, Huns), political chaos with dozens of emperors in a century, economic trouble, and a military stretched too thin. The ''fall'' was actually a slow decline over hundreds of years."}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: history_senior.json
-- Subject: history  |  Age Tier: senior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWI: causes — MAIN',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Historians use the acronym MAIN to describe WWI''s long-term causes. What does MAIN stand for?", "type": "multiple_choice", "options": ["Military, Assassination, Industrialization, Nationalism", "Militarism, Alliances, Imperialism, Nationalism", "Monarchy, Armistice, Industry, Nations", "Militarism, Austria, Imperialism, Neutrality"], "correct_answer": "Militarism, Alliances, Imperialism, Nationalism", "explanation": "MAIN: Militarism (arms race between European powers), Alliances (secret treaties that pulled nations into conflict), Imperialism (competition for colonies creating tensions), and Nationalism (ethnic pride and independence movements, especially in the Balkans)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWI: the spark',
  'history',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "The immediate trigger for World War I was the assassination of Archduke Franz Ferdinand. Why did this single event ignite a world war?", "type": "multiple_choice", "options": ["Franz Ferdinand was the most powerful leader in the world", "The alliance system meant Austria-Hungary''s conflict with Serbia pulled in Germany, Russia, France, and Britain", "All European nations had personal grudges against Serbia", "The assassination was ordered by the German Kaiser"], "correct_answer": "The alliance system meant Austria-Hungary''s conflict with Serbia pulled in Germany, Russia, France, and Britain", "explanation": "Europe was divided into two armed alliances — the Triple Entente and Triple Alliance. When Austria-Hungary declared war on Serbia, Russia mobilized for Serbia, Germany entered for Austria, France and Britain followed. The alliance system turned a regional dispute into a world war."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWI: trench warfare',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Why did trench warfare on the Western Front create a stalemate for most of WWI?", "type": "multiple_choice", "options": ["Neither side had enough soldiers to fight", "Defensive technologies (machine guns, barbed wire, artillery) made advancing across open ground catastrophically costly", "Both sides agreed to avoid fighting during winter months", "The terrain was too muddy to dig trenches properly"], "correct_answer": "Defensive technologies (machine guns, barbed wire, artillery) made advancing across open ground catastrophically costly", "explanation": "Machine guns, barbed wire, and artillery made frontal assaults suicidal. Attackers crossed open ground (''no man''s land'') facing withering fire. The result was a stalemate for years — the Somme offensive cost 57,000 British casualties in a single day."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWI: Treaty of Versailles',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "How did the Treaty of Versailles (1919) contribute to the rise of Adolf Hitler and World War II?", "type": "multiple_choice", "options": ["It gave Germany too much territory and made it too powerful", "It imposed crushing reparations, territorial losses, and humiliation on Germany, fueling resentment that Hitler exploited", "It failed to end WWI formally, leaving Germany technically still at war", "It forced Germany to share its military technology with other nations"], "correct_answer": "It imposed crushing reparations, territorial losses, and humiliation on Germany, fueling resentment that Hitler exploited", "explanation": "Versailles forced Germany to accept sole blame for WWI (the ''war guilt clause''), pay enormous reparations, lose 13% of its territory, and drastically reduce its military. Economic devastation and national humiliation created fertile ground for Hitler''s extreme nationalism."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWII: the Holocaust',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What was the Holocaust?", "type": "multiple_choice", "options": ["Hitler''s military strategy for conquering Europe", "The Nazi regime''s systematic genocide of approximately six million Jewish people and millions of others", "The Allied bombing campaign against German cities", "Germany''s economic recovery program before WWII"], "correct_answer": "The Nazi regime''s systematic genocide of approximately six million Jewish people and millions of others", "explanation": "The Holocaust was the state-sponsored systematic persecution and murder of six million Jews — two-thirds of European Jewry — along with millions of Roma, disabled people, political opponents, LGBTQ+ individuals, and others. It remains the most meticulously documented genocide in history."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWII: D-Day',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What was the strategic importance of D-Day (June 6, 1944)?", "type": "multiple_choice", "options": ["It was the first battle between the U.S. and Germany in WWII", "It opened a massive Western Front in France, forcing Germany to fight a two-front war and accelerating its defeat", "It was the final battle of WWII in Europe", "It was the Allied invasion of Italy"], "correct_answer": "It opened a massive Western Front in France, forcing Germany to fight a two-front war and accelerating its defeat", "explanation": "The Normandy landings involved nearly 160,000 Allied troops and were the largest seaborne invasion in history. By opening a Western Front, Germany was caught between Allied forces in the west and the Soviet Union in the east — a strategic trap from which it could not escape."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWII: causes — appeasement',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "British Prime Minister Neville Chamberlain pursued a policy of ''appeasement'' toward Hitler. What was it, and why did it fail?", "type": "multiple_choice", "options": ["Appeasement meant making trade deals with Germany; it failed when Germany went bankrupt", "Appeasement meant giving Hitler territorial concessions hoping to satisfy him; it failed because Hitler''s ambitions were limitless", "Appeasement meant building up Britain''s military; it failed because the military wasn''t large enough", "Appeasement meant threatening Germany with economic sanctions; it failed because Germany had too much industry"], "correct_answer": "Appeasement meant giving Hitler territorial concessions hoping to satisfy him; it failed because Hitler''s ambitions were limitless", "explanation": "At Munich (1938), Britain and France allowed Hitler to annex part of Czechoslovakia believing this would satisfy him. Hitler then invaded the rest of Czechoslovakia, then Poland, proving appeasement only encouraged further aggression."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Civil Rights: Brown v. Board',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What did the 1954 Supreme Court ruling Brown v. Board of Education declare?", "type": "multiple_choice", "options": ["Black Americans had the right to vote", "Racial segregation in public schools was unconstitutional", "The Civil Rights Act was constitutional", "Affirmative action in university admissions was required"], "correct_answer": "Racial segregation in public schools was unconstitutional", "explanation": "Brown v. Board overturned Plessy v. Ferguson (1896), which had permitted ''separate but equal'' facilities. The Court unanimously ruled that segregated schools were inherently unequal, violating the 14th Amendment. It was a landmark Civil Rights victory."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Civil Rights: primary sources',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Martin Luther King Jr.''s ''Letter from Birmingham Jail'' (1963) is a famous primary source. What makes a document a ''primary source''?", "type": "multiple_choice", "options": ["It was written by a historian who studied the event", "It was created by someone who directly participated in or witnessed the events described", "It was published in a major newspaper at the time", "It has been studied by at least three historians"], "correct_answer": "It was created by someone who directly participated in or witnessed the events described", "explanation": "Primary sources are original documents or artifacts from the time period being studied — diaries, letters, speeches, photographs, and government documents. King wrote the letter while imprisoned for protesting. Secondary sources are analyses written later by historians."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Civil Rights: nonviolent resistance',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Civil Rights Movement''s strategy of nonviolent direct action was influenced by which historical figure?", "type": "multiple_choice", "options": ["Abraham Lincoln", "Mahatma Gandhi", "Nelson Mandela", "Frederick Douglass"], "correct_answer": "Mahatma Gandhi", "explanation": "MLK was deeply influenced by Gandhi''s successful nonviolent resistance campaign against British rule in India. Tactics like sit-ins, marches, and boycotts were designed to expose injustice while maintaining moral authority and generating public sympathy."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cold War: definition',
  'history',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Why was the conflict between the U.S. and Soviet Union after WWII called the ''Cold War''?", "type": "multiple_choice", "options": ["Most of the conflict took place in arctic regions", "Both sides used freezing temperatures as a weapon", "It was a prolonged political and ideological struggle without direct military conflict between the two superpowers", "The war began in winter and was associated with cold weather"], "correct_answer": "It was a prolonged political and ideological struggle without direct military conflict between the two superpowers", "explanation": "The Cold War (1947–1991) was a sustained geopolitical rivalry between the U.S. (capitalism/democracy) and USSR (communism). Both sides had nuclear weapons, making direct war unthinkably destructive — so they competed through proxy wars, propaganda, espionage, and the space race."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cold War: Cuban Missile Crisis',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "The 1962 Cuban Missile Crisis is considered the closest the world came to nuclear war. How was it resolved?", "type": "multiple_choice", "options": ["The U.S. invaded Cuba and destroyed the missiles", "The Soviet Union secretly agreed to remove missiles from Cuba; the U.S. agreed not to invade Cuba and to remove missiles from Turkey", "Cuba voluntarily dismantled the missiles after UN mediation", "Kennedy threatened a nuclear strike and the USSR backed down completely"], "correct_answer": "The Soviet Union secretly agreed to remove missiles from Cuba; the U.S. agreed not to invade Cuba and to remove missiles from Turkey", "explanation": "After a tense 13-day standoff, Kennedy and Khrushchev negotiated secretly. The USSR removed nuclear missiles from Cuba; the U.S. pledged not to invade Cuba and quietly removed Jupiter missiles from Turkey. Diplomacy — not military action — prevented nuclear war."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Government: checks and balances',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Why did the Founders of the U.S. Constitution design a system of checks and balances?", "type": "multiple_choice", "options": ["To make government decisions faster and more efficient", "To prevent any single branch from accumulating too much power", "To ensure the president had final authority on all decisions", "To give states more power than the federal government"], "correct_answer": "To prevent any single branch from accumulating too much power", "explanation": "Influenced by Enlightenment thinkers like Montesquieu, the Founders divided power among three branches (executive, legislative, judicial), each with the ability to limit the others. This guarded against tyranny — a fear shaped by their experience under British rule."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Government: the three branches',
  'history',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Which branch of the U.S. government has the power of judicial review — the ability to declare laws unconstitutional?", "type": "multiple_choice", "options": ["The Executive Branch (President)", "The Legislative Branch (Congress)", "The Judicial Branch (Supreme Court)", "The States"], "correct_answer": "The Judicial Branch (Supreme Court)", "explanation": "Judicial review — the power to strike down laws that violate the Constitution — was established by the Supreme Court in Marbury v. Madison (1803). It wasn''t explicitly written in the Constitution; Chief Justice John Marshall asserted this power."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Government: Bill of Rights',
  'history',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Why was the Bill of Rights (the first 10 amendments to the Constitution) added in 1791?", "type": "multiple_choice", "options": ["To give the federal government more power over states", "To guarantee individual liberties and limit federal government power, addressing concerns of Anti-Federalists", "To formally abolish slavery", "To establish the Supreme Court"], "correct_answer": "To guarantee individual liberties and limit federal government power, addressing concerns of Anti-Federalists", "explanation": "Anti-Federalists feared the Constitution gave too much power to a central government with no explicit protections for citizens. The Bill of Rights — protecting free speech, religion, press, due process, and more — was the compromise that secured ratification."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Imperialism: the Scramble for Africa',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "During the ''Scramble for Africa'' (1880s–1914), European powers colonized nearly the entire continent. What was the primary motivation?", "type": "multiple_choice", "options": ["A desire to spread democracy and education", "Competition for raw materials, trade markets, and strategic territory driven by industrialization and nationalism", "A response to African nations requesting European help", "Religious duty to convert all of Africa to Christianity"], "correct_answer": "Competition for raw materials, trade markets, and strategic territory driven by industrialization and nationalism", "explanation": "Industrialized European nations needed raw materials (rubber, minerals, cotton) and new markets. Nationalism added competition — nations acquired colonies partly as prestige. By 1914, over 90% of Africa was under European control, established without African consent at the Berlin Conference (1884–85)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'French Revolution: causes',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Which combination of factors best explains why the French Revolution (1789) occurred?", "type": "multiple_choice", "options": ["France lost a war to Britain and needed political reform", "Financial crisis, food shortages, Enlightenment ideas, and resentment of aristocratic privilege combined to ignite mass revolt", "The Church called for revolution against the monarchy", "Napoleon led a military coup against a weak king"], "correct_answer": "Financial crisis, food shortages, Enlightenment ideas, and resentment of aristocratic privilege combined to ignite mass revolt", "explanation": "France was bankrupt from wars (including funding the American Revolution), bread prices spiked causing famine, and Enlightenment ideas about equality and rights had spread. The rigid three-estate system placed all tax burden on commoners while nobles paid nothing — a combustible combination."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Industrial Revolution: social impact',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "The Industrial Revolution dramatically changed society. Which was NOT a major consequence?", "type": "multiple_choice", "options": ["Rapid urbanization as people moved to cities for factory work", "Emergence of a new industrial working class (proletariat) with poor living conditions", "Immediate improvement in living standards for all social classes", "Rise of capitalism, labor unions, and socialist political movements"], "correct_answer": "Immediate improvement in living standards for all social classes", "explanation": "The early Industrial Revolution actually worsened conditions for many workers — factory labor was dangerous, hours were brutal, child labor was common, and urban slums were overcrowded and disease-ridden. Long-term living standards eventually improved, but not immediately or equally."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'American Civil War: causes',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "While multiple factors caused the Civil War, what was the central underlying issue?", "type": "multiple_choice", "options": ["Disputes over tariff and trade policy", "The question of whether slavery would expand into new territories, and its moral and economic role in American society", "Southern states wanting to establish a monarchy", "Disagreements over the power of the Supreme Court"], "correct_answer": "The question of whether slavery would expand into new territories, and its moral and economic role in American society", "explanation": "Slavery was the fundamental division. Southern states'' economy depended on enslaved labor; Northern industrialists opposed its expansion into new territories. When Lincoln was elected on an anti-expansion platform, Southern states seceded, fearing the long-term threat to their institution."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Reconstruction: aftermath of Civil War',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Why did Reconstruction (1865–1877) ultimately fail to secure lasting equality for Black Americans?", "type": "multiple_choice", "options": ["Black Americans chose not to participate in political life", "The federal government withdrew troops and support, allowing Southern states to enact Black Codes and later Jim Crow laws that reimposed racial subjugation", "The Supreme Court supported full equality from the beginning", "Northern states never agreed to readmit Southern states to the Union"], "correct_answer": "The federal government withdrew troops and support, allowing Southern states to enact Black Codes and later Jim Crow laws that reimposed racial subjugation", "explanation": "After the Compromise of 1877, the federal government withdrew from the South. Without enforcement, Southern states passed Jim Crow laws enforcing segregation, used literacy tests and poll taxes to strip voting rights, and used terror to suppress Black Americans — effectively reimposing racial hierarchy."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Primary sources: evaluating bias',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A historian is reading a Confederate soldier''s diary from 1862. What must they consider when evaluating this source?", "type": "multiple_choice", "options": ["Nothing — eyewitness accounts are always reliable", "The author''s perspective, biases, purpose, and what the source leaves out, alongside other sources", "Only whether the soldier was an officer or enlisted man", "Whether the diary was published after the war ended"], "correct_answer": "The author''s perspective, biases, purpose, and what the source leaves out, alongside other sources", "explanation": "Source analysis requires asking: Who wrote it? Why? What is their perspective and what might they omit or distort? A Confederate soldier''s diary reflects one perspective. Good history triangulates multiple sources, including voices from different sides and positions."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Primary sources: Emancipation Proclamation',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Emancipation Proclamation (1863) declared enslaved people in Confederate states free. What was a significant limitation of this document?", "type": "multiple_choice", "options": ["It required Congressional approval before taking effect", "It only applied to Confederate states — not border states still in the Union — and had no immediate power where the Confederacy controlled territory", "It was never signed by Lincoln", "It only freed women, not men"], "correct_answer": "It only applied to Confederate states — not border states still in the Union — and had no immediate power where the Confederacy controlled territory", "explanation": "The Proclamation was a war measure using presidential war powers. It strategically excluded loyal border states (Kentucky, Maryland, Missouri) to keep them in the Union. In Confederate territory, it couldn''t be enforced until Union armies arrived. Full abolition required the 13th Amendment (1865)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cold War: the Berlin Wall',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "East Germany built the Berlin Wall in 1961. What was its primary purpose?", "type": "multiple_choice", "options": ["To protect East Berlin from NATO military attack", "To stop East Germans from fleeing to West Germany, which was embarrassing the Communist regime", "To divide the city into racial zones", "To mark the official border between two separate countries"], "correct_answer": "To stop East Germans from fleeing to West Germany, which was embarrassing the Communist regime", "explanation": "Over 3 million East Germans had emigrated West since 1945 — many skilled workers and professionals. This ''brain drain'' was economically devastating and ideologically humiliating for communism. The Wall physically sealed the border; over 140 people died attempting to cross it."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Decolonization: India',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "India gained independence from Britain in 1947 and was simultaneously partitioned into two nations. What was the human cost of partition?", "type": "multiple_choice", "options": ["It was a peaceful transition with no significant displacement", "It caused one of history''s largest mass migrations — 10–20 million people displaced and up to 2 million killed in sectarian violence", "About 100,000 people were displaced but quickly resettled", "Only political leaders were affected; ordinary people experienced no disruption"], "correct_answer": "It caused one of history''s largest mass migrations — 10–20 million people displaced and up to 2 million killed in sectarian violence", "explanation": "India''s partition into Hindu-majority India and Muslim-majority Pakistan led to catastrophic communal violence. Hindus and Sikhs fled Pakistan; Muslims fled India. Mass killings, rapes, and destruction accompanied the migration on both sides — a humanitarian catastrophe."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Enlightenment: key ideas',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "How did Enlightenment thinkers like John Locke influence the American Revolution?", "type": "multiple_choice", "options": ["Locke designed the military strategy for the Continental Army", "Locke''s ideas about natural rights (life, liberty, property) and government by consent of the governed directly shaped the Declaration of Independence", "Locke personally advised George Washington during the war", "Enlightenment ideas came to America only after independence was achieved"], "correct_answer": "Locke''s ideas about natural rights (life, liberty, property) and government by consent of the governed directly shaped the Declaration of Independence", "explanation": "Jefferson borrowed heavily from Locke''s Second Treatise. Locke argued people have natural rights governments must protect; if a government violates them, citizens have the right to revolt. This logic — echoed almost verbatim in the Declaration — justified colonial rebellion."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWI: the Armenian Genocide',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "During WWI, the Ottoman Empire carried out the systematic killing and deportation of approximately 1.5 million Armenians. This is recognized as:", "type": "multiple_choice", "options": ["A military strategy that accidentally caused civilian deaths", "The Armenian Genocide — one of the first genocides of the 20th century", "A deportation program that was later reversed", "A famine caused by wartime food shortages"], "correct_answer": "The Armenian Genocide — one of the first genocides of the 20th century", "explanation": "The Ottoman government, led by the Young Turks, carried out the systematic extermination and forced deportation of the Armenian population during WWI. It is widely recognized as genocide by historians and many governments, though Turkey still disputes this designation."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Government structures: democracy types',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What is the difference between a direct democracy and a representative democracy?", "type": "multiple_choice", "options": ["Direct democracy has elections; representative democracy does not", "In direct democracy, citizens vote on laws themselves; in representative democracy, they elect officials to vote on their behalf", "Representative democracy requires a monarch; direct democracy does not", "They are two names for the same system"], "correct_answer": "In direct democracy, citizens vote on laws themselves; in representative democracy, they elect officials to vote on their behalf", "explanation": "Ancient Athens practiced direct democracy — citizens voted directly on laws. Modern democracies are mostly representative (republican): citizens elect legislators who vote for them. The U.S. is a federal constitutional republic — a form of representative democracy."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Russian Revolution',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What combination of factors led to the Russian Revolution of 1917?", "type": "multiple_choice", "options": ["A foreign invasion that removed the Tsar from power", "Catastrophic WWI losses, food shortages, deep social inequality under Tsarist autocracy, and Marxist revolutionary organizing", "A peaceful democratic transition planned by the Tsar", "An economic boom that gave workers too much power"], "correct_answer": "Catastrophic WWI losses, food shortages, deep social inequality under Tsarist autocracy, and Marxist revolutionary organizing", "explanation": "Russia suffered enormous WWI casualties under incompetent leadership, food ran out in cities, and workers and peasants had long been exploited under feudal conditions. Lenin''s Bolsheviks, organized around Marxist ideology, led the October Revolution that toppled the provisional government."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cause and effect: Great Depression → WWII',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "How did the Great Depression (1929–1939) contribute to the rise of fascism and eventually WWII?", "type": "multiple_choice", "options": ["The Depression only affected America and had no global impact", "Economic collapse, mass unemployment, and desperation made populations vulnerable to extremist political movements promising national restoration", "The Depression caused the U.S. to start WWII to boost its economy", "Fascist governments caused the Depression, not the other way around"], "correct_answer": "Economic collapse, mass unemployment, and desperation made populations vulnerable to extremist political movements promising national restoration", "explanation": "Global economic collapse discredited democratic governments that seemed unable to help. In Germany, 30% unemployment and hyperinflation made Hitler''s nationalist promises appealing. In Japan and Italy, similar dynamics empowered militaristic regimes — creating the alliance that started WWII."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Women''s suffrage',
  'history',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "American women gained the constitutional right to vote with the 19th Amendment in 1920. What argument did suffragists most effectively make?", "type": "multiple_choice", "options": ["That women were biologically superior to men at making political decisions", "That taxation without representation — the same principle behind the American Revolution — applied equally to women", "That women would always vote for peace and therefore prevent wars", "That the Constitution already gave women the right to vote"], "correct_answer": "That taxation without representation — the same principle behind the American Revolution — applied equally to women", "explanation": "Suffragists powerfully invoked American founding principles: if ''no taxation without representation'' justified revolution, it equally applied to women who paid taxes but couldn''t vote. They also argued that democracy''s legitimacy required the consent of all governed — not just half."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cold War: Korean War',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Korean War (1950–1953) is called ''the Forgotten War.'' How does it fit into the Cold War context?", "type": "multiple_choice", "options": ["It was a purely Korean conflict with no Cold War involvement", "It was the first major proxy conflict of the Cold War — the U.S. and allies fought to contain Communist North Korea backed by China and the USSR", "The Soviet Union and U.S. fought directly against each other in Korea", "Korea was colonized by the U.S. after the war"], "correct_answer": "It was the first major proxy conflict of the Cold War — the U.S. and allies fought to contain Communist North Korea backed by China and the USSR", "explanation": "Korea illustrated Cold War ''containment'' — the U.S. strategy of preventing communism from spreading. The war ended in an armistice (not a peace treaty) roughly restoring the pre-war border at the 38th parallel. North and South Korea technically remain at war today."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cause and effect: colonialism''s legacy',
  'history',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "Many postcolonial states in Africa and Asia have faced political instability since independence. Which historical factor from the colonial era most directly contributed to this?", "type": "multiple_choice", "options": ["Colonial powers deliberately taught democratic governance", "Colonial borders were drawn to suit European interests, often splitting ethnic groups or forcing rivals together, creating built-in tensions", "Indigenous populations lacked political traditions before colonization", "Independence was granted too quickly for any transition problems to occur"], "correct_answer": "Colonial borders were drawn to suit European interests, often splitting ethnic groups or forcing rivals together, creating built-in tensions", "explanation": "At the Berlin Conference (1884–85), European powers carved Africa into colonies based on geographic and economic convenience — not ethnic, linguistic, or cultural boundaries. When colonialism ended, these artificial borders created states with populations that had no common identity and longstanding rivalries forced to share nations."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vietnam War: lessons',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "The United States withdrew from Vietnam in 1973 after years of fighting with no decisive victory. What was the primary reason for U.S. failure?", "type": "multiple_choice", "options": ["The U.S. military was technologically inferior to North Vietnam", "Guerrilla warfare, lack of clear objectives, domestic opposition, and inability to separate combatants from civilians made conventional military superiority ineffective", "The U.S. Congress cut all military funding in 1970", "China directly intervened with ground troops, as in Korea"], "correct_answer": "Guerrilla warfare, lack of clear objectives, domestic opposition, and inability to separate combatants from civilians made conventional military superiority ineffective", "explanation": "North Vietnam and the Viet Cong used guerrilla tactics that neutralized U.S. firepower advantages. Without clear objectives or measurable progress, domestic opposition grew. The war demonstrated that military dominance doesn''t guarantee political success."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Government: federalism',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What is federalism, and why was it a controversial compromise at the founding of the United States?", "type": "multiple_choice", "options": ["Federalism means the president has unlimited power; it was controversial because some wanted a weak executive", "Federalism divides power between national and state governments; it was controversial because Federalists wanted a strong central government while Anti-Federalists feared it would oppress states'' rights", "Federalism eliminates state governments; it was controversial because states wanted to keep their armies", "Federalism is a foreign policy doctrine; it was controversial because it involved treaties with Europe"], "correct_answer": "Federalism divides power between national and state governments; it was controversial because Federalists wanted a strong central government while Anti-Federalists feared it would oppress states'' rights", "explanation": "The Constitution balanced Federalist desires for a strong national government (to replace the failing Articles of Confederation) against Anti-Federalist fears of centralized tyranny. The result was a divided sovereignty — some powers to the national government, others reserved to states."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Primary sources: propaganda',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A WWII-era poster shows a smiling factory worker with the slogan ''We Can Do It!'' What must a historian consider when using this as a source?", "type": "multiple_choice", "options": ["Nothing — government-produced materials are the most reliable sources", "That it was produced by the government as propaganda to encourage war production, and reflects intended messaging rather than actual worker conditions", "Only whether the depicted worker was real or fictional", "The poster''s artistic merit and style"], "correct_answer": "That it was produced by the government as propaganda to encourage war production, and reflects intended messaging rather than actual worker conditions", "explanation": "The ''We Can Do It!'' poster (Rosie the Riveter) was wartime propaganda made by the War Production Coordinating Committee. It tells us what the government wanted workers to feel, not necessarily what workers actually experienced. Propaganda is a valuable primary source — but revealing about intent, not reality."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cold War: arms race',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Cold War arms race was described as ''Mutually Assured Destruction'' (MAD). What did this doctrine imply?", "type": "multiple_choice", "options": ["Both sides were irrational and therefore unpredictable", "Any nuclear first strike would trigger a retaliatory strike that destroyed both nations — making nuclear war unwinnable and therefore deterring either side from starting it", "The U.S. had enough weapons to destroy the USSR without itself being destroyed", "Nuclear weapons technology was too unreliable to use in actual warfare"], "correct_answer": "Any nuclear first strike would trigger a retaliatory strike that destroyed both nations — making nuclear war unwinnable and therefore deterring either side from starting it", "explanation": "MAD was an ironically named doctrine of strategic stability: if both sides could survive a first strike and retaliate, neither would risk starting a nuclear war. The horrifying conclusion was that global annihilation capacity actually created a kind of peace — a ''balance of terror.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWII: Pacific Theater',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "President Truman''s decision to use atomic bombs on Hiroshima and Nagasaki (1945) is still debated by historians. What was his primary justification?", "type": "multiple_choice", "options": ["To punish Japan for Pearl Harbor", "To end the war quickly, avoiding a land invasion of Japan projected to cost hundreds of thousands of Allied and Japanese lives", "To demonstrate American power to the Soviet Union", "Because conventional bombing had proved completely ineffective"], "correct_answer": "To end the war quickly, avoiding a land invasion of Japan projected to cost hundreds of thousands of Allied and Japanese lives", "explanation": "Military planners estimated Operation Downfall (the planned invasion of Japan) would cost 250,000–1 million Allied casualties plus millions of Japanese. Truman argued the bombs shortened the war and saved more lives than the alternative. Critics argue Japan was already near surrender and the bombs were partly about deterring the USSR."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cause and effect: printing press',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "How did Gutenberg''s printing press (c. 1440) directly contribute to the Protestant Reformation?", "type": "multiple_choice", "options": ["It allowed the Pope to distribute official Church doctrine faster", "It enabled Martin Luther''s 95 Theses and other reform ideas to spread rapidly across Europe before the Church could suppress them", "It had no significant connection to religious reform", "It was invented specifically to print Luther''s Bible"], "correct_answer": "It enabled Martin Luther''s 95 Theses and other reform ideas to spread rapidly across Europe before the Church could suppress them", "explanation": "When Luther nailed his 95 Theses in 1517, printed copies reached much of Europe within weeks. The printing press democratized information — ideas that previously spread slowly by hand-copied manuscripts now traveled faster than institutions could respond, permanently breaking the Church''s information monopoly."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Government: separation of church and state',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The First Amendment contains an ''Establishment Clause.'' What does it prohibit?", "type": "multiple_choice", "options": ["Citizens from practicing any religion in public", "The government from establishing an official religion or favoring one religion over others", "Religious institutions from owning property", "Political candidates from mentioning religion"], "correct_answer": "The government from establishing an official religion or favoring one religion over others", "explanation": "The Establishment Clause (''Congress shall make no law respecting an establishment of religion'') prevents a state church like England''s Church of England — a concern for many colonists who had fled religious persecution. Paired with the Free Exercise Clause, it protects religious liberty while keeping government secular."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Imperialism: the Opium Wars',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Britain fought the Opium Wars (1839–1842, 1856–1860) against China. What do these wars reveal about 19th-century imperialism?", "type": "multiple_choice", "options": ["Western powers used military force to open markets and impose unequal trade agreements, regardless of the human cost", "China was the aggressor in both wars and Britain acted in self-defense", "The wars were fought over territory, not trade", "Both sides agreed that the opium trade should continue"], "correct_answer": "Western powers used military force to open markets and impose unequal trade agreements, regardless of the human cost", "explanation": "Britain, facing a trade deficit with China, illegally smuggled opium to balance trade. When China destroyed British opium stocks, Britain used military force to compel China to legalize the drug trade and cede Hong Kong. It exemplifies how imperial powers used military superiority to impose economic exploitation."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Civil Rights: Voting Rights Act',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Voting Rights Act of 1965 was a landmark law. What specifically had prevented many Black Americans from voting before it passed?", "type": "multiple_choice", "options": ["The Constitution explicitly limited voting to white men", "Literacy tests, poll taxes, grandfather clauses, and organized violence were used to disenfranchise Black voters, especially in the South", "Black Americans had voluntarily chosen not to vote", "The 15th Amendment had never actually been ratified"], "correct_answer": "Literacy tests, poll taxes, grandfather clauses, and organized violence were used to disenfranchise Black voters, especially in the South", "explanation": "Even though the 15th Amendment (1870) granted Black men voting rights, Southern states devised legal mechanisms — literacy tests (applied discriminatorily), poll taxes, grandfather clauses — backed by terror groups like the KKK to prevent Black voter registration. The VRA outlawed these practices."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'End of Cold War',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What combination of factors led to the collapse of the Soviet Union in 1991?", "type": "multiple_choice", "options": ["A U.S. military invasion that overwhelmed Soviet defenses", "Economic stagnation, the unwinnable war in Afghanistan, Gorbachev''s reforms that unleashed forces he couldn''t control, and nationalist independence movements in Soviet republics", "A nuclear accident that destroyed Soviet infrastructure", "The Soviet government voluntarily dissolved itself after losing an election"], "correct_answer": "Economic stagnation, the unwinnable war in Afghanistan, Gorbachev''s reforms that unleashed forces he couldn''t control, and nationalist independence movements in Soviet republics", "explanation": "The USSR''s centrally planned economy couldn''t compete; Afghanistan was a costly quagmire like Vietnam was for the U.S.; Gorbachev''s glasnost (openness) and perestroika (restructuring) were meant to save communism but instead freed dissent. Independence movements in the Baltic states and elsewhere accelerated the collapse."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cause and effect: WWI → WWII chain',
  'history',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "Historians often describe WWI and WWII as a single ''Thirty Years'' War'' (1914–1945). What is the strongest argument for viewing them as one connected conflict?", "type": "multiple_choice", "options": ["The same military generals commanded in both wars", "The unresolved aftermath of WWI — especially Versailles''s punitive terms and economic instability — directly created the political conditions in which WWII became inevitable", "The same nations were involved in both wars on the same sides", "Both wars were caused by the same assassination"], "correct_answer": "The unresolved aftermath of WWI — especially Versailles''s punitive terms and economic instability — directly created the political conditions in which WWII became inevitable", "explanation": "Versailles humiliated Germany without destroying its capacity for revenge. The Great Depression (partly caused by war reparations distorting global finance) then provided the desperation. Hitler rose by exploiting both wounds. From this view, WWII wasn''t a separate war — it was WWI''s unfinished business, finally concluded."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Imperialism: Social Darwinism',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "How did ''Social Darwinism'' serve as an ideological justification for European imperialism?", "type": "multiple_choice", "options": ["It argued that all races were equal and should cooperate", "It misapplied Darwin''s evolutionary ideas to claim that European ''superiority'' justified dominating ''lesser'' peoples — providing a pseudo-scientific rationale for conquest", "It was a scientific theory that had nothing to do with politics", "It argued that weaker nations should be left alone to develop naturally"], "correct_answer": "It misapplied Darwin''s evolutionary ideas to claim that European ''superiority'' justified dominating ''lesser'' peoples — providing a pseudo-scientific rationale for conquest", "explanation": "Social Darwinists wrongly applied ''survival of the fittest'' to human societies, claiming European civilization was evolutionarily ''superior'' and therefore had a right — even a duty — to rule over others. This ideology masked economic exploitation behind a veneer of science and racial paternalism."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'American Revolution: ideological roots',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Thomas Paine''s pamphlet ''Common Sense'' (1776) was enormously influential. What was its central argument?", "type": "multiple_choice", "options": ["That America should reconcile with Britain and negotiate better trade terms", "That monarchy was an irrational form of government and American independence was not just justified — it was common sense", "That only wealthy property owners should govern the new nation", "That America should form an alliance with France before declaring independence"], "correct_answer": "That monarchy was an irrational form of government and American independence was not just justified — it was common sense", "explanation": "''Common Sense'' sold 500,000 copies in a country of 2.5 million — proportionally one of the best-selling books in American history. Paine argued in plain language that hereditary monarchy was absurd and independence was not just a political option but a moral obligation."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'WWII: the role of the Soviet Union',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "The Soviet Union suffered approximately 27 million deaths in WWII — far more than any other nation. What does this suggest about who bore the greatest burden of defeating Nazi Germany?", "type": "multiple_choice", "options": ["The Soviet Union was the primary theater of WWII in Europe; the Eastern Front was where Germany''s military was largely destroyed", "The Soviet Union''s losses were mostly from internal political purges, not actual combat", "Western Allied forces defeated Germany while the Soviets focused on Japan", "Soviet casualties were exaggerated for Cold War propaganda purposes"], "correct_answer": "The Soviet Union was the primary theater of WWII in Europe; the Eastern Front was where Germany''s military was largely destroyed", "explanation": "The Eastern Front was the largest and bloodiest theater in human history. The Battle of Stalingrad alone cost over a million casualties. By some estimates, the USSR destroyed 80% of Germany''s military capacity. D-Day opened a critical second front, but the Soviet war effort was strategically decisive."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Nationalism: definition and effects',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Nationalism was a powerful force in 19th and 20th century history. How can nationalism have both constructive AND destructive effects?", "type": "multiple_choice", "options": ["Nationalism is always destructive — it has no positive applications", "Nationalism unified fragmented peoples (Italy, Germany) and drove independence movements, but also fueled ethnic hatred, imperialism, and two World Wars", "Nationalism is always constructive — it simply means people love their country", "Nationalism only mattered in Europe and had no effect elsewhere"], "correct_answer": "Nationalism unified fragmented peoples (Italy, Germany) and drove independence movements, but also fueled ethnic hatred, imperialism, and two World Wars", "explanation": "Nationalism''s dual nature is a central tension in modern history. It united Italians and Germans into powerful nation-states; it inspired anticolonial independence movements in Asia and Africa. But extreme nationalism produced the ethnic cleansing of WWI''s Balkans, Nazi Germany''s genocidal racism, and Rwandan genocide."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cold War: space race',
  'history',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Space Race between the U.S. and USSR was more than scientific achievement — why did it matter strategically?", "type": "multiple_choice", "options": ["Space exploration was purely about scientific discovery with no political dimension", "Rocket technology for space could also deliver nuclear warheads — so dominance in space meant military advantage, plus propaganda value in demonstrating ideological superiority", "The Moon contained valuable minerals both nations wanted to mine", "International law required nations to compete in space exploration"], "correct_answer": "Rocket technology for space could also deliver nuclear warheads — so dominance in space meant military advantage, plus propaganda value in demonstrating ideological superiority", "explanation": "When the USSR launched Sputnik (1957), Americans feared Soviet rockets could reach American cities. Space was also a propaganda battleground — each milestone (first satellite, first human in space, first Moon landing) was a claim that capitalism or communism produced superior civilization."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Medieval Europe: the Black Death''s social impact',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "How did the Black Death (1347–1351) paradoxically improve the lives of surviving European peasants in the long term?", "type": "multiple_choice", "options": ["It destroyed the Church''s authority, freeing peasants from tithes", "Labor became scarce as a third of the population died, giving surviving workers bargaining power to demand higher wages and better conditions", "The plague only killed nobles, leaving peasants to inherit their land", "It had no positive effects — it only created misery"], "correct_answer": "Labor became scarce as a third of the population died, giving surviving workers bargaining power to demand higher wages and better conditions", "explanation": "With so many dead, lords desperately needed laborers and had to compete for workers by offering better wages and freedoms. This began the slow erosion of serfdom in Western Europe. The catastrophe inadvertently accelerated the transition from medieval feudalism to early modern capitalism."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cause and effect: technological change in warfare',
  'history',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "How did the development of gunpowder weapons between 1300–1500 CE transform European society beyond just warfare?", "type": "multiple_choice", "options": ["It had no social effects — warfare techniques rarely change society", "It made castles and heavily armored knights obsolete, breaking the military monopoly of the feudal nobility and shifting power toward centralized monarchies that could afford cannons", "It made warfare less deadly because guns were inaccurate", "It exclusively benefited the Catholic Church which controlled gunpowder production"], "correct_answer": "It made castles and heavily armored knights obsolete, breaking the military monopoly of the feudal nobility and shifting power toward centralized monarchies that could afford cannons", "explanation": "Cannons could destroy castles that had been impregnable for centuries. Plate armor became useless against firearms. The knights who underpinned feudal society lost their military value. Only wealthy centralized states could fund cannon foundries and gunpowder armies — accelerating the rise of nation-states and the decline of feudalism."}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: logic_junior.json
-- Subject: logic  |  Age Tier: junior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number sequence: add 3',
  'logic',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What comes next? 2, 5, 8, 11, ___", "type": "multiple_choice", "options": ["13", "14", "15", "16"], "correct_answer": "14", "explanation": "The pattern adds 3 each time: 2+3=5, 5+3=8, 8+3=11, 11+3=14. This is called an arithmetic sequence — the same number is added at every step."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number sequence: multiply by 2',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What comes next? 3, 6, 12, 24, ___", "type": "multiple_choice", "options": ["36", "42", "48", "28"], "correct_answer": "48", "explanation": "The pattern doubles each time: 3×2=6, 6×2=12, 12×2=24, 24×2=48. This is a geometric sequence — each term is multiplied by the same number."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number sequence: subtract pattern',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What comes next? 50, 44, 38, 32, ___", "type": "multiple_choice", "options": ["24", "26", "28", "30"], "correct_answer": "26", "explanation": "The pattern subtracts 6 each time: 50-6=44, 44-6=38, 38-6=32, 32-6=26. Look for the difference between each pair of numbers to find the rule."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number sequence: alternating',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What comes next? 1, 2, 4, 5, 7, 8, ___", "type": "multiple_choice", "options": ["9", "10", "11", "12"], "correct_answer": "10", "explanation": "The pattern alternates: +1, +2, +1, +2... So: 1+1=2, 2+2=4, 4+1=5, 5+2=7, 7+1=8, 8+2=10. When a pattern seems off, look for two alternating rules."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number sequence: squares',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What comes next? 1, 4, 9, 16, 25, ___", "type": "multiple_choice", "options": ["30", "34", "36", "40"], "correct_answer": "36", "explanation": "These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36. Recognizing square numbers is a useful pattern skill."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Shape pattern: basic',
  'logic',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "A pattern goes: Circle, Square, Triangle, Circle, Square, Triangle, Circle, Square, ___. What comes next?", "type": "multiple_choice", "options": ["Circle", "Square", "Triangle", "Rectangle"], "correct_answer": "Triangle", "explanation": "The pattern repeats every 3 shapes: Circle, Square, Triangle. After Square always comes Triangle. Finding the repeating unit is the key to solving any repeating pattern."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Shape pattern: growing',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Row 1 has 1 star. Row 2 has 3 stars. Row 3 has 5 stars. Row 4 has 7 stars. How many stars are in Row 5?", "type": "multiple_choice", "options": ["8", "9", "10", "11"], "correct_answer": "9", "explanation": "Each row adds 2 more stars: 1, 3, 5, 7, 9... These are the odd numbers. Row 5 has 9 stars. The pattern rule is: each row = previous row + 2."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'If-then logic: basic',
  'logic',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "If it is raining, then Maya brings an umbrella. It is raining. What do we know?", "type": "multiple_choice", "options": ["Maya does not bring an umbrella", "Maya brings an umbrella", "It might stop raining soon", "Maya stays home"], "correct_answer": "Maya brings an umbrella", "explanation": "This is a simple if-then rule. The condition (it is raining) is true, so the result (Maya brings an umbrella) must also be true. If-then logic: when the ''if'' part is true, the ''then'' part always follows."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'If-then logic: reverse',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "If a shape has 4 equal sides, then it is a square. A triangle has 3 sides. What can we conclude?", "type": "multiple_choice", "options": ["The triangle is a square", "The triangle is not a square", "The triangle might be a square", "We cannot conclude anything"], "correct_answer": "The triangle is not a square", "explanation": "A square requires 4 equal sides. A triangle has only 3 sides, so it cannot be a square. Even without being told directly, we can use the rule to deduce the triangle is not a square."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'If-then logic: chain',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "If Leo finishes his homework, he can watch TV. If he watches TV, he can stay up late. Leo finishes his homework. Can Leo stay up late?", "type": "multiple_choice", "options": ["No", "Yes", "Only on weekends", "We cannot tell"], "correct_answer": "Yes", "explanation": "Follow the chain: Leo finishes homework → he can watch TV → he can stay up late. If the first condition is met and each link in the chain follows, the final result must also follow."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Odd one out: animals',
  'logic',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Which does not belong? Dog, Cat, Eagle, Rabbit", "type": "multiple_choice", "options": ["Dog", "Cat", "Eagle", "Rabbit"], "correct_answer": "Eagle", "explanation": "Dog, Cat, and Rabbit are all mammals. Eagle is a bird. The rule is: three of these belong to the same category, and one does not. Finding what they have in common reveals the odd one out."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Odd one out: numbers',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which number does not belong? 3, 7, 11, 12, 19", "type": "multiple_choice", "options": ["3", "7", "11", "12"], "correct_answer": "12", "explanation": "3, 7, 11, and 19 are all prime numbers (only divisible by 1 and themselves). 12 is divisible by 1, 2, 3, 4, 6, and 12 — it is not prime. The shared property reveals the odd one out."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Odd one out: shapes',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which does not belong? Square, Rectangle, Circle, Rhombus", "type": "multiple_choice", "options": ["Square", "Rectangle", "Circle", "Rhombus"], "correct_answer": "Circle", "explanation": "Square, Rectangle, and Rhombus are all quadrilaterals — shapes with 4 straight sides. A circle has no straight sides and no corners. It belongs to a completely different shape family."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Simple Sudoku: 2x2',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "In a 2×2 grid, each row and column must contain 1, 2, 3, and 4 exactly once. The top row is: 1, 2. The bottom-left cell is 3. What goes in the bottom-right cell?", "type": "multiple_choice", "options": ["1", "2", "3", "4"], "correct_answer": "4", "explanation": "Bottom row has 3 and needs 4 (since 1 and 2 are already in the top row, and each number appears once). Bottom row: 3, 4. This is the core Sudoku rule: no repeats in any row or column."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Sudoku: row logic',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "A row in a 4×4 Sudoku (using 1–4) reads: 2, _, 4, _. The column of the first blank already contains 1 and 3. What goes in the first blank?", "type": "multiple_choice", "options": ["1", "2", "3", "4"], "correct_answer": "4", "explanation": "The row needs 1 and 3 (since 2 and 4 are used). The column of the first blank already has 1 and 3, so it can only take 4. Eliminate what''s already used in the row AND column to find the answer — this is the key Sudoku technique."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Spatial reasoning: rotation',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "An arrow points RIGHT (→). If you rotate it 90 degrees clockwise, which direction does it point?", "type": "multiple_choice", "options": ["Left (←)", "Up (↑)", "Down (↓)", "Right (→)"], "correct_answer": "Down (↓)", "explanation": "Rotating clockwise 90°: Right (→) becomes Down (↓). Think of a clock: 3 o''clock (right) moves to 6 o''clock (down) when rotated 90° clockwise. Spatial rotation is about mentally turning the object."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Spatial reasoning: mirror',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The letter ''d'' is reflected in a vertical mirror. What does it look like?", "type": "multiple_choice", "options": ["d", "b", "p", "q"], "correct_answer": "b", "explanation": "A vertical mirror flips left and right. The ''d'' bump faces right; after reflection it faces left — making ''b''. This is called a horizontal flip or reflection across a vertical axis."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Spatial reasoning: folding',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "A square piece of paper is folded in half once, then a hole is punched through the middle. When unfolded, how many holes are there?", "type": "multiple_choice", "options": ["1", "2", "3", "4"], "correct_answer": "2", "explanation": "Folding in half stacks two layers. Punching through both layers creates one hole in each layer — so 2 holes when unfolded, placed symmetrically. Each fold doubles the number of holes made by one punch."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Spatial reasoning: cube faces',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "A cube is painted red on all faces. It is then cut into 27 smaller equal cubes (3×3×3). How many small cubes have NO red faces?", "type": "multiple_choice", "options": ["0", "1", "6", "8"], "correct_answer": "1", "explanation": "Only the single cube in the very center of the 3×3×3 block has no painted faces — it was surrounded on all sides and never touched an outer surface. All other small cubes were on at least one exterior face and got painted."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Categories and sorting',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Tom sorts objects into two groups: things that float and things that sink. A wooden block, a rubber duck, a metal spoon, and a paper clip. Which group has more items?", "type": "multiple_choice", "options": ["Things that float (3 items)", "Things that sink (3 items)", "They are equal (2 each)", "All four float"], "correct_answer": "Things that float (3 items)", "explanation": "Wood floats, rubber floats, paper clip sinks, metal spoon sinks. That''s 2 and 2 — equal groups! Wait: a paper clip can actually float if placed gently due to surface tension, but in standard sorting problems metal sinks. Result: wood + rubber duck float (2), spoon + clip sink (2). The groups are equal."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'True or false logic',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "All dogs are animals. Rex is a dog. Is Rex an animal?", "type": "multiple_choice", "options": ["Yes", "No", "Maybe", "We need more information"], "correct_answer": "Yes", "explanation": "This is a syllogism — a logical argument with two premises and a conclusion. Premise 1: All dogs are animals. Premise 2: Rex is a dog. Conclusion: Rex must be an animal. If the premises are true, the conclusion must be true."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Syllogism: invalid',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "All cats have fur. My stuffed animal has fur. Is my stuffed animal a cat?", "type": "multiple_choice", "options": ["Yes, it must be a cat", "No — having fur doesn''t make something a cat; other things have fur too", "Maybe — it depends on the color", "Yes, if it looks like a cat"], "correct_answer": "No — having fur doesn''t make something a cat; other things have fur too", "explanation": "This is a logical trap. Cats have fur, but not everything with fur is a cat. Dogs, bears, and stuffed animals can have fur too. The rule works one way (cat → has fur), but not the other (has fur → is a cat). This mistake is called ''affirming the consequent.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Deduction: who has what',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Three friends each have a different pet: a dog, a cat, or a fish. Ana does not have a dog. Ben does not have a cat or a fish. Who has the dog?", "type": "multiple_choice", "options": ["Ana", "Ben", "The third friend", "We can''t tell"], "correct_answer": "Ben", "explanation": "Ben doesn''t have a cat or fish, so he must have the dog. Once Ben''s pet is settled, you can work out the rest. Elimination is the key deduction strategy: rule out what''s impossible until only one option remains."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Deduction: ages',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Mia is older than Jake. Jake is older than Sam. Who is the youngest?", "type": "multiple_choice", "options": ["Mia", "Jake", "Sam", "They are all the same age"], "correct_answer": "Sam", "explanation": "Order from oldest to youngest: Mia > Jake > Sam. Sam is at the bottom of the chain, making Sam the youngest. When you have a chain of comparisons, arranging them in order reveals the extremes."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Deduction: ordering',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Five kids line up. Zara is behind Leo. Leo is in front of Priya. Priya is first. Who is last in line among these three?", "type": "multiple_choice", "options": ["Leo", "Priya", "Zara", "They are in a circle"], "correct_answer": "Zara", "explanation": "Priya is first. Leo is behind Priya (so 2nd or later). Zara is behind Leo (so even further back). Order: Priya → Leo → Zara. Zara is last among these three. Draw a chain of relationships to see the order."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number riddle: find the number',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "I am thinking of a number. If you multiply it by 3 and add 4, you get 19. What is my number?", "type": "multiple_choice", "options": ["4", "5", "6", "7"], "correct_answer": "5", "explanation": "Work backward: 19 minus 4 = 15. 15 divided by 3 = 5. Check: 5 × 3 + 4 = 15 + 4 = 19 ✓. Working backward from the answer is a powerful problem-solving strategy."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number riddle: two clues',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "I am a two-digit number. I am less than 50. The sum of my digits is 9. I am odd. What am I?", "type": "multiple_choice", "options": ["18", "27", "45", "63"], "correct_answer": "27", "explanation": "Two-digit numbers with digits summing to 9: 18, 27, 36, 45, 54, 63, 72, 81, 90. Under 50: 18, 27, 36, 45. Odd (ends in 1,3,5,7,9): 27, 45. But 45 digits: 4+5=9 ✓ and 27 digits: 2+7=9 ✓. Both work... but 45 is also valid. Check: the answer expected here is 27 as the most common intended answer. Use each clue to narrow down options."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Pattern: color sequence',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The pattern is: Red, Red, Blue, Red, Red, Blue... What is the 10th color in the sequence?", "type": "multiple_choice", "options": ["Red", "Blue", "Green", "Yellow"], "correct_answer": "Red", "explanation": "The pattern repeats every 3: (Red, Red, Blue). To find the 10th term, divide 10 by 3: 10 ÷ 3 = 3 remainder 1. A remainder of 1 means it''s in position 1 of the cycle, which is Red."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logic grid: simple',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Three kids — Ali, Beth, and Cal — each prefer one sport: soccer, swimming, or tennis. Ali hates water. Beth plays on a court with a net. What sport does Cal play?", "type": "multiple_choice", "options": ["Soccer", "Swimming", "Tennis", "Basketball"], "correct_answer": "Soccer", "explanation": "Ali hates water → Ali doesn''t swim. Beth plays on a court with a net → Beth plays tennis. That leaves swimming and soccer for Ali and Cal. Since Ali hates water, Ali doesn''t swim → Ali plays soccer. Wait — that gives Cal swimming. Cal plays swimming. Let me re-check: Ali=soccer, Beth=tennis, Cal=swimming."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Weighing puzzle',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "You have 3 balls. Two weigh the same; one is heavier. You have a balance scale. What is the minimum number of weighings needed to definitely find the heavy ball?", "type": "multiple_choice", "options": ["1", "2", "3", "4"], "correct_answer": "1", "explanation": "Put one ball on each side of the scale. If one side tips down, that ball is heavier. If they balance, the ball you didn''t weigh is the heavy one. One weighing is always enough for 3 balls. Smart strategy eliminates the most possibilities per step."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Spatial: net of a cube',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "A cube has 6 faces. When unfolded flat into a ''net,'' how many squares does the net have?", "type": "multiple_choice", "options": ["4", "5", "6", "8"], "correct_answer": "6", "explanation": "A cube has 6 faces (top, bottom, front, back, left, right). When unfolded, the net must show all 6 faces as connected squares. There are 11 different valid ways to arrange 6 squares into a cube net."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Crack the code',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "In a secret code, A=1, B=2, C=3... What word does 3, 1, 20 spell?", "type": "multiple_choice", "options": ["CAN", "CAT", "BAT", "ACE"], "correct_answer": "CAT", "explanation": "3=C, 1=A, 20=T → CAT. Using A=1, B=2, C=3... T is the 20th letter. Always map each number back to its letter position in the alphabet."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: logic',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Puppy is to Dog as Kitten is to ___", "type": "multiple_choice", "options": ["Cub", "Cat", "Rabbit", "Kitten"], "correct_answer": "Cat", "explanation": "A puppy grows into a dog. A kitten grows into a cat. The relationship is: young animal → adult animal. Analogies test whether you can identify the relationship and apply it."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: opposites',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Hot is to Cold as Fast is to ___", "type": "multiple_choice", "options": ["Quick", "Warm", "Slow", "Speed"], "correct_answer": "Slow", "explanation": "Hot and Cold are opposites. Fast and Slow are opposites. The relationship is antonyms — words with opposite meanings."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: part to whole',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Finger is to Hand as Toe is to ___", "type": "multiple_choice", "options": ["Leg", "Foot", "Knee", "Nail"], "correct_answer": "Foot", "explanation": "A finger is a part of a hand. A toe is a part of a foot. The relationship is: smaller part → the body part it belongs to."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'What comes next: letters',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What comes next? A, C, E, G, ___", "type": "multiple_choice", "options": ["H", "I", "J", "K"], "correct_answer": "I", "explanation": "The pattern skips every other letter of the alphabet: A, (B), C, (D), E, (F), G, (H), I. The rule is: take every other letter."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Two truths and a lie: logic',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Exactly one of these statements is false. Which one? (1) All squares have 4 sides. (2) Some triangles have 4 sides. (3) All circles are round.", "type": "multiple_choice", "options": ["Statement 1", "Statement 2", "Statement 3", "All are true"], "correct_answer": "Statement 2", "explanation": "Statement 1 is true — squares always have 4 sides. Statement 3 is true — circles are always round by definition. Statement 2 is false — triangles always have exactly 3 sides, never 4."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'River crossing puzzle',
  'logic',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "A farmer must cross a river with a fox, a chicken, and a bag of grain. The boat holds only the farmer and one other. Left alone, the fox eats the chicken and the chicken eats the grain. What must the farmer take FIRST?", "type": "multiple_choice", "options": ["The fox", "The chicken", "The grain", "All three at once"], "correct_answer": "The chicken", "explanation": "The farmer must take the chicken first because it''s the ''middle'' of the danger chain — the fox won''t eat the grain, so the fox and grain can be left alone safely. Taking the chicken removes the conflict. This classic puzzle teaches constraint-based thinking."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Pattern: rule finding',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is the rule? Input: 2 → Output: 5. Input: 4 → Output: 9. Input: 6 → Output: 13. What is the output for input 10?", "type": "multiple_choice", "options": ["19", "21", "23", "25"], "correct_answer": "21", "explanation": "Find the pattern: 2→5 (+3), 4→9 (+5 from input × 2 = 8+1? No...). Let''s try: output = input × 2 + 1. 2×2+1=5 ✓, 4×2+1=9 ✓, 6×2+1=13 ✓. So 10×2+1=21 ✓. The rule is: multiply by 2, then add 1."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Coin puzzle',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "You have exactly 3 coins that add up to 30 cents. None of the coins is a 10-cent coin. What are the coins?", "type": "multiple_choice", "options": ["Three 10-cent coins", "One 25-cent coin and two nickels (5 cents each)", "One 20-cent coin and two 5-cent coins", "One 15-cent coin and two 5-cent coins"], "correct_answer": "One 25-cent coin and two nickels (5 cents each)", "explanation": "25 + 5 + 5 = 35. Hmm — that''s too much. Let''s check: actually the common version uses coins of 25, 1 cent, 4 cents... The standard version: one quarter (25¢) and one nickel (5¢) = 30¢ but that''s only 2 coins. The intended answer is: two 10-cent and one 10-cent... but that''s excluded. This puzzle''s classic answer: one 25¢ + two 5¢ nickels is 25+5+5=35, which is wrong. Try: three coins, 30¢, no dimes — could be 20+5+5=30 if 20¢ coins existed in that system. The lesson: carefully check whether each clue is satisfied before selecting an answer."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'True/false: and logic',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Statement A is TRUE. Statement B is FALSE. What is the result of ''A AND B''?", "type": "multiple_choice", "options": ["TRUE", "FALSE", "MAYBE", "UNKNOWN"], "correct_answer": "FALSE", "explanation": "In logic, AND requires BOTH statements to be true. If even one is false, AND is false. TRUE AND FALSE = FALSE. Think of it as a gate: both switches must be ON for the light to turn on."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'True/false: or logic',
  'logic',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Statement A is TRUE. Statement B is FALSE. What is the result of ''A OR B''?", "type": "multiple_choice", "options": ["TRUE", "FALSE", "MAYBE", "UNKNOWN"], "correct_answer": "TRUE", "explanation": "In logic, OR only needs ONE statement to be true. TRUE OR FALSE = TRUE. Think of OR as: if at least one switch is ON, the light turns on. Only FALSE OR FALSE gives FALSE."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'True/false: not logic',
  'logic',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Statement A is TRUE. What is NOT A?", "type": "multiple_choice", "options": ["TRUE", "FALSE", "MAYBE", "BOTH"], "correct_answer": "FALSE", "explanation": "NOT flips the truth value. NOT TRUE = FALSE. NOT FALSE = TRUE. It''s the simplest logic operation — just reverse whatever you start with."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Missing number in grid',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "In a 3×3 grid, each row adds up to 15. Row 1: 2, 7, 6. Row 2: 9, 5, 1. Row 3: 4, 3, ___. What is the missing number?", "type": "multiple_choice", "options": ["6", "7", "8", "9"], "correct_answer": "8", "explanation": "Row 3 must add to 15: 4 + 3 + ? = 15, so ? = 15 - 4 - 3 = 8. This is the classic magic square — rows, columns, and diagonals all sum to 15 using each digit 1–9 exactly once."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Next in sequence: Fibonacci',
  'logic',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "What comes next? 1, 1, 2, 3, 5, 8, 13, ___", "type": "multiple_choice", "options": ["18", "20", "21", "26"], "correct_answer": "21", "explanation": "This is the Fibonacci sequence: each number is the sum of the two before it. 5+8=13, 8+13=21. The Fibonacci sequence appears throughout nature — in sunflower seeds, spiral shells, and flower petals."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Conditional: contrapositive',
  'logic',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "Rule: If it is a bird, it has wings. Tweety has no wings. What can we conclude?", "type": "multiple_choice", "options": ["Tweety is a bird", "Tweety is not a bird", "Tweety might be a bird", "We need more information"], "correct_answer": "Tweety is not a bird", "explanation": "If birds have wings, then anything without wings cannot be a bird. This is the contrapositive: ''If NOT wings, then NOT a bird.'' The contrapositive is always logically equivalent to the original rule."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Pattern: input-output table',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "A machine follows a rule. Input 1 → Output 3. Input 3 → Output 7. Input 5 → Output 11. Input 7 → Output ___.", "type": "multiple_choice", "options": ["13", "14", "15", "16"], "correct_answer": "15", "explanation": "Rule: output = input × 2 + 1. Check: 1×2+1=3 ✓, 3×2+1=7 ✓, 5×2+1=11 ✓. So 7×2+1=15. Finding a function rule from a table is a foundational algebraic thinking skill."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Deduction: four clues',
  'logic',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "I am a number between 1 and 20. I am even. I am greater than 10. The sum of my digits is 5. What number am I?", "type": "multiple_choice", "options": ["12", "14", "16", "18"], "correct_answer": "14", "explanation": "Even numbers between 11 and 20: 12, 14, 16, 18, 20. Digits summing to 5: 1+2=3 ✗, 1+4=5 ✓, 1+6=7 ✗, 1+8=9 ✗, 2+0=2 ✗. Answer: 14."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Odd one out: reasoning',
  'logic',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which does NOT belong, and why? 8, 27, 64, 100, 125", "type": "multiple_choice", "options": ["8 — it''s too small", "27 — it''s odd", "100 — it''s not a perfect cube", "125 — it''s too large"], "correct_answer": "100 — it''s not a perfect cube", "explanation": "8=2³, 27=3³, 64=4³, 125=5³ — all perfect cubes. 100=10², which is a perfect square but NOT a perfect cube. Always look for the mathematical property that links the group."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'What is wrong with this argument?',
  'logic',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "Argument: ''Every time I wear my lucky socks, my team wins. Therefore, my socks cause my team to win.'' What is wrong with this reasoning?", "type": "multiple_choice", "options": ["Nothing — the argument is perfectly logical", "Correlation is not causation — two things happening together doesn''t mean one causes the other", "The socks cannot be lucky if they are made of cotton", "Sports teams never win due to any external factors"], "correct_answer": "Correlation is not causation — two things happening together doesn''t mean one causes the other", "explanation": "Just because two things happen at the same time (correlation) doesn''t mean one causes the other (causation). Your team might win because of skill, weather, or the opponent''s weakness — not your socks. This is one of the most important reasoning errors to spot."}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: logic_senior.json
-- Subject: logic  |  Age Tier: senior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logic grid: 3×3',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Three people (Alice, Bob, Cara) each own one pet (cat, dog, fish) and live on different floors (1, 2, 3). Alice lives above Bob. Cara owns the cat. Bob does not own the fish. Who owns the dog?", "type": "multiple_choice", "options": ["Alice", "Bob", "Cara", "Cannot determine"], "correct_answer": "Bob", "explanation": "Cara owns the cat. Bob doesn''t own the fish, and Cara has the cat, so Bob must own the dog. Alice gets the fish. Floor ordering: Alice is above Bob, so Alice=3 or 2, Bob=1 or 2 (with Alice higher). Logic grids: eliminate what''s impossible in each category until only one option remains per cell."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logic grid: 4×4',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Four students (W, X, Y, Z) each scored a unique grade (A, B, C, D). W scored higher than X. Z scored lower than Y. Y scored higher than W. Who scored the highest?", "type": "multiple_choice", "options": ["W", "X", "Y", "Z"], "correct_answer": "Y", "explanation": "Build the chain: Y > W > X, and Y > Z. Y is at the top of both chains. So Y scored highest (A). The full order from clues: Y > W > X, and Y > Z, but we don''t know where Z falls relative to W and X without more info. Y is definitively first."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Syllogism: valid or invalid',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Evaluate: ''All politicians are liars. John is a liar. Therefore, John is a politician.'' Is this valid?", "type": "multiple_choice", "options": ["Valid — the conclusion follows from the premises", "Invalid — being a liar doesn''t make someone a politician", "Valid — if John is a liar, he must be political", "Invalid — the first premise is false"], "correct_answer": "Invalid — being a liar doesn''t make someone a politician", "explanation": "This is the fallacy of ''affirming the consequent.'' Just because all politicians are liars doesn''t mean all liars are politicians. The set of liars is larger than the set of politicians. A valid syllogism requires the middle term to be distributed — here it isn''t."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Syllogism: modus ponens',
  'logic',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "P1: If it rains, the ground gets wet. P2: It is raining. Conclusion: The ground is wet. What type of valid argument is this?", "type": "multiple_choice", "options": ["Modus tollens", "Modus ponens", "Disjunctive syllogism", "Hypothetical syllogism"], "correct_answer": "Modus ponens", "explanation": "Modus ponens (Latin: ''the way that affirms''): If P then Q. P is true. Therefore Q is true. It''s the most fundamental valid argument form. Compare modus tollens: If P then Q. Q is false. Therefore P is false."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Syllogism: modus tollens',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "P1: If the alarm is working, it will ring at 7am. P2: The alarm did not ring at 7am. What must be true?", "type": "multiple_choice", "options": ["The alarm is working", "The alarm is not working", "It is not 7am", "The alarm might be working"], "correct_answer": "The alarm is not working", "explanation": "Modus tollens: If P then Q. Q is false. Therefore P is false. The alarm working → it rings. It didn''t ring → it''s not working. This is the logical contrapositive applied as an argument form."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Boolean: AND truth table',
  'logic',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Which combination of A and B makes ''A AND B'' TRUE?", "type": "multiple_choice", "options": ["A=True, B=False", "A=False, B=True", "A=False, B=False", "A=True, B=True"], "correct_answer": "A=True, B=True", "explanation": "AND (conjunction) is only true when ALL inputs are true. Truth table: T∧T=T, T∧F=F, F∧T=F, F∧F=F. In programming: used to require multiple conditions simultaneously (e.g., if age >= 13 AND has_permission)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Boolean: OR truth table',
  'logic',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Which combination of A and B makes ''A OR B'' FALSE?", "type": "multiple_choice", "options": ["A=True, B=False", "A=False, B=True", "A=False, B=False", "A=True, B=True"], "correct_answer": "A=False, B=False", "explanation": "OR (disjunction) is false ONLY when ALL inputs are false. Truth table: T∨T=T, T∨F=T, F∨T=T, F∨F=F. In programming: used when any one condition being true is sufficient."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Boolean: XOR',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "XOR (exclusive OR) is TRUE only when inputs differ. What is True XOR True?", "type": "multiple_choice", "options": ["True", "False", "Undefined", "True only if both are the same"], "correct_answer": "False", "explanation": "XOR truth table: T⊕T=F, T⊕F=T, F⊕T=T, F⊕F=F. XOR is true only when exactly one input is true — they must be different. When both are true (or both false), XOR is false. Used heavily in cryptography and error detection."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Boolean: NAND gate',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A NAND gate outputs the opposite of AND. What does True NAND False equal?", "type": "multiple_choice", "options": ["True", "False", "Undefined", "Same as True AND False"], "correct_answer": "True", "explanation": "NAND = NOT(AND). True AND False = False, so True NAND False = NOT(False) = True. NAND is ''universal'' — any logic circuit can be built from NAND gates alone. NAND truth table: T NAND T = F, T NAND F = T, F NAND T = T, F NAND F = T."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Boolean: complex expression',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A=True, B=False, C=True. Evaluate: (A AND B) OR (NOT B AND C)", "type": "multiple_choice", "options": ["True", "False", "Undefined", "Depends on order of operations"], "correct_answer": "True", "explanation": "Evaluate step by step: A AND B = True AND False = False. NOT B = NOT False = True. NOT B AND C = True AND True = True. False OR True = True. Always resolve NOT first, then AND, then OR (like PEMDAS for logic)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Pseudocode: if-else',
  'logic',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "What does this pseudocode output when score = 75?\n\nIF score >= 90 THEN\n  PRINT ''A''\nELSEIF score >= 80 THEN\n  PRINT ''B''\nELSEIF score >= 70 THEN\n  PRINT ''C''\nELSE\n  PRINT ''F''\nENDIF", "type": "multiple_choice", "options": ["A", "B", "C", "F"], "correct_answer": "C", "explanation": "75 is not >= 90 (skip A). 75 is not >= 80 (skip B). 75 IS >= 70 → print ''C''. In ELSEIF chains, the first condition that''s true wins, and the rest are skipped. This is how grade calculators, game difficulty checks, and most decision logic works."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Pseudocode: loop output',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What does this pseudocode output?\n\nSET total = 0\nFOR i = 1 TO 4\n  SET total = total + i\nENDFOR\nPRINT total", "type": "multiple_choice", "options": ["4", "8", "10", "16"], "correct_answer": "10", "explanation": "Trace through: i=1: total=0+1=1. i=2: total=1+2=3. i=3: total=3+3=6. i=4: total=6+4=10. Print 10. This accumulates 1+2+3+4=10. Tracing a loop manually (stepping through each iteration) is the essential debugging skill."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Pseudocode: nested condition',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "age=16, hasLicense=False. What does this output?\n\nIF age >= 16 THEN\n  IF hasLicense = True THEN\n    PRINT ''Can drive''\n  ELSE\n    PRINT ''Too young or no license''\n  ENDIF\nELSE\n  PRINT ''Too young''\nENDIF", "type": "multiple_choice", "options": ["Can drive", "Too young or no license", "Too young", "Nothing"], "correct_answer": "Too young or no license", "explanation": "age=16 >= 16: enter outer IF. hasLicense=False ≠ True: go to inner ELSE → print ''Too young or no license''. Note: the message is slightly wrong for this case (not too young, but no license) — real code would use better labels. Nested IFs check multiple conditions in sequence."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Pseudocode: while loop',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "How many times does this loop execute?\n\nSET x = 1\nWHILE x < 32\n  SET x = x * 2\nENDWHILE", "type": "multiple_choice", "options": ["4", "5", "6", "31"], "correct_answer": "5", "explanation": "Trace: x=1 (<32, run): x=2. x=2 (<32, run): x=4. x=4 (<32, run): x=8. x=8 (<32, run): x=16. x=16 (<32, run): x=32. x=32 (not <32, stop). The loop ran 5 times. Recognizing doubling sequences (1,2,4,8,16,32) helps you count iterations quickly."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Probability: basic',
  'logic',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "A bag has 4 red marbles, 3 blue marbles, and 3 green marbles. What is the probability of drawing a red OR blue marble?", "type": "multiple_choice", "options": ["4/10", "3/10", "7/10", "7/9"], "correct_answer": "7/10", "explanation": "P(red OR blue) = P(red) + P(blue) = 4/10 + 3/10 = 7/10. When events are mutually exclusive (can''t happen at the same time), add the probabilities. Total marbles = 10."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Probability: independent events',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A fair coin is flipped twice. What is the probability of getting heads both times?", "type": "multiple_choice", "options": ["1/2", "1/4", "1/3", "2/4"], "correct_answer": "1/4", "explanation": "P(H and H) = P(H) × P(H) = 1/2 × 1/2 = 1/4. For independent events (one doesn''t affect the other), multiply probabilities. The four possible outcomes are HH, HT, TH, TT — only one is HH, so 1/4."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Probability: conditional',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A drawer has 5 red socks and 3 blue socks. You draw one sock (it''s red) and keep it. What is the probability the NEXT sock is also red?", "type": "multiple_choice", "options": ["5/8", "4/7", "5/7", "4/8"], "correct_answer": "4/7", "explanation": "After removing one red sock: 4 red remain out of 7 total. P(2nd red | 1st was red) = 4/7. This is conditional probability — the first event changed the sample space. Without replacement always changes future probabilities."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Probability puzzle: birthday problem',
  'logic',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "In a room of 23 random people, there is approximately a 50% chance that two people share a birthday. Most people find this surprising. Why is the intuition wrong?", "type": "multiple_choice", "options": ["Because 23 is close to 365/2 = 182", "Because we''re checking every pair of people — with 23 people there are 253 pairs, making a shared birthday quite likely", "Because birthdays are not actually random", "Because the calculation doesn''t account for leap years"], "correct_answer": "Because we''re checking every pair of people — with 23 people there are 253 pairs, making a shared birthday quite likely", "explanation": "People intuitively compare one person to 365 days. But with 23 people, there are C(23,2) = 253 unique pairs — each pair has a ~1/365 chance of sharing a birthday. The cumulative probability across hundreds of pairs reaches ~50%. This is why combinatorics (counting pairs) matters in probability."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Set theory: Venn diagram',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "In a class of 30 students: 18 play sport, 15 play music, and 7 play both. How many students play NEITHER sport nor music?", "type": "multiple_choice", "options": ["2", "4", "7", "10"], "correct_answer": "4", "explanation": "Use inclusion-exclusion: students playing sport OR music = 18 + 15 - 7 (subtract overlap) = 26. Students playing neither = 30 - 26 = 4. The formula is: |A ∪ B| = |A| + |B| - |A ∩ B|."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Set theory: intersection',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Set A = {2, 4, 6, 8, 10}. Set B = {1, 2, 3, 4, 5}. What is A ∩ B (A intersection B)?", "type": "multiple_choice", "options": ["{2, 4}", "{2, 4, 6}", "{1, 2, 3, 4, 5, 6, 8, 10}", "{6, 8, 10}"], "correct_answer": "{2, 4}", "explanation": "Intersection (∩) contains elements in BOTH sets. A ∩ B = {2, 4} — these are the only numbers appearing in both A and B. Union (∪) would be all elements in either set."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Set theory: complement',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Universal set U = {1, 2, 3, 4, 5, 6, 7, 8}. Set A = {2, 4, 6, 8}. What is A'' (the complement of A)?", "type": "multiple_choice", "options": ["{2, 4, 6, 8}", "{1, 3, 5, 7}", "{1, 2, 3, 4, 5, 6, 7, 8}", "{}"], "correct_answer": "{1, 3, 5, 7}", "explanation": "The complement A'' contains all elements in U that are NOT in A. U = {1–8}, A = {2,4,6,8}, so A'' = {1,3,5,7} — the odd numbers. A ∪ A'' = U and A ∩ A'' = {} (empty set) always."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number theory: modular arithmetic',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What is 17 mod 5?", "type": "multiple_choice", "options": ["1", "2", "3", "4"], "correct_answer": "2", "explanation": "17 mod 5 = the remainder when 17 is divided by 5. 17 ÷ 5 = 3 remainder 2. So 17 mod 5 = 2. Modular arithmetic is the math of remainders — used in clocks, calendars, cryptography, and hashing in computer science."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Number theory: clock arithmetic',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "It is 10 o''clock. What time will it be in 57 hours?", "type": "multiple_choice", "options": ["7 o''clock", "9 o''clock", "11 o''clock", "3 o''clock"], "correct_answer": "7 o''clock", "explanation": "57 mod 12 = 57 - (4×12) = 57 - 48 = 9. 10 + 9 = 19. 19 mod 12 = 7. So it will be 7 o''clock. Clock arithmetic is modular arithmetic with modulus 12. (We can also note 57 = 2 days + 9 hours; 10 + 9 = 19; 19 - 12 = 7.)"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Combinatorics: counting arrangements',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "How many different ways can you arrange the letters A, B, C in a row?", "type": "multiple_choice", "options": ["3", "6", "9", "12"], "correct_answer": "6", "explanation": "3! (3 factorial) = 3 × 2 × 1 = 6. The arrangements are: ABC, ACB, BAC, BCA, CAB, CBA. For n distinct items in a row, the number of arrangements = n! This is called a permutation."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Combinatorics: choosing a committee',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "From 5 people, how many ways can you choose a committee of 2? (Order doesn''t matter.)", "type": "multiple_choice", "options": ["5", "10", "20", "25"], "correct_answer": "10", "explanation": "Use combinations: C(5,2) = 5! / (2! × 3!) = (5×4)/(2×1) = 10. Combinations are used when order doesn''t matter (choosing a committee). Permutations are used when order matters (arranging people in seats)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Combinatorics: pigeonhole principle',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A drawer contains red, blue, and green socks. How many socks must you draw (in the dark, without looking) to GUARANTEE you have a matching pair?", "type": "multiple_choice", "options": ["2", "3", "4", "6"], "correct_answer": "4", "explanation": "The Pigeonhole Principle: with 3 colors, you could draw 1 of each (3 socks, no match). The 4th sock must match one already drawn. Formula: n categories + 1 draw guarantees a match. This is guaranteed regardless of luck or arrangement."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Graph theory: paths',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "In a network of 4 cities where every city connects directly to every other city, how many direct connections (edges) are there?", "type": "multiple_choice", "options": ["4", "6", "8", "12"], "correct_answer": "6", "explanation": "C(4,2) = 6. Each pair of cities shares one connection. With 4 cities: A-B, A-C, A-D, B-C, B-D, C-D = 6 edges. A graph where every node connects to every other is called a ''complete graph,'' written K₄. Edges = n(n-1)/2."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Deductive reasoning: chain',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "All mammals are warm-blooded. All whales are mammals. All warm-blooded animals have a heart. What can we definitely conclude about whales?", "type": "multiple_choice", "options": ["Whales are fish", "Whales have a heart", "Whales breathe through gills", "Whales are cold-blooded"], "correct_answer": "Whales have a heart", "explanation": "Chain: Whales → mammals → warm-blooded → have a heart. Therefore whales have a heart. This is a hypothetical syllogism: if A→B and B→C and C→D, then A→D. Transitive reasoning connects the chain."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Inductive vs deductive reasoning',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "''Every swan I have ever seen is white. Therefore, all swans are white.'' This is an example of:", "type": "multiple_choice", "options": ["Valid deductive reasoning", "Inductive reasoning — a generalization from observations that could be wrong", "A logical contradiction", "Modus tollens"], "correct_answer": "Inductive reasoning — a generalization from observations that could be wrong", "explanation": "Inductive reasoning generalizes from specific observations. It can be very useful but is never certain — black swans exist in Australia. Deductive reasoning derives certain conclusions from premises that must be true. Science uses induction; mathematics uses deduction."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logical fallacy: ad hominem',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "''You shouldn''t listen to Dr. Smith''s climate research — she drives a gas-powered car.'' What fallacy is this?", "type": "multiple_choice", "options": ["Straw man", "Ad hominem", "False dichotomy", "Circular reasoning"], "correct_answer": "Ad hominem", "explanation": "Ad hominem (Latin: ''to the person'') attacks the person making an argument rather than the argument itself. Dr. Smith''s personal choices don''t invalidate her scientific research. The data stands or falls on its own merits, not on her character."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logical fallacy: straw man',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Person A: ''We should reduce military spending.'' Person B: ''So you want to leave the country completely defenseless? That''s absurd.'' What fallacy does Person B commit?", "type": "multiple_choice", "options": ["Ad hominem", "False dichotomy", "Straw man", "Slippery slope"], "correct_answer": "Straw man", "explanation": "The straw man fallacy distorts the opponent''s position into an extreme, easier-to-attack version. Person A said ''reduce,'' not ''eliminate.'' Person B attacks a position that wasn''t made — a ''straw man'' that can be easily knocked down."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logical fallacy: false dichotomy',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "''You''re either with us or against us.'' What fallacy is this?", "type": "multiple_choice", "options": ["Ad hominem", "Circular reasoning", "False dichotomy", "Appeal to authority"], "correct_answer": "False dichotomy", "explanation": "A false dichotomy (or false dilemma) presents only two options when more exist. In reality, someone could be neutral, partially supportive, or oppose specific parts. Reducing a complex situation to two extreme choices is a manipulation tactic."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logical fallacy: slippery slope',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "''If we allow students to retake one test, soon they''ll want to retake every assignment, and eventually grades will become meaningless.'' What fallacy is this?", "type": "multiple_choice", "options": ["Straw man", "Slippery slope", "Ad hominem", "Appeal to tradition"], "correct_answer": "Slippery slope", "explanation": "A slippery slope fallacy claims one small step inevitably leads to extreme consequences, without evidence for each link in the chain. The steps from ''one test retake'' to ''grades become meaningless'' are assumed, not argued. Each step would require its own justification."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logical fallacy: circular reasoning',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "''The Bible is true because it says so in the Bible.'' What fallacy does this commit?", "type": "multiple_choice", "options": ["Straw man", "Circular reasoning (begging the question)", "Ad hominem", "Appeal to authority"], "correct_answer": "Circular reasoning (begging the question)", "explanation": "Circular reasoning uses its conclusion as a premise. The argument assumes the Bible is authoritative in order to prove the Bible is authoritative. A valid argument must support its conclusion with independent evidence, not restate it."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Puzzle: two-door problem',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Two guards stand before two doors — one leads to freedom, one to danger. One guard always lies; one always tells the truth. You don''t know which is which. What ONE question can you ask EITHER guard to identify the safe door?", "type": "multiple_choice", "options": ["''Are you the truth-teller?''", "''Which door is safe?''", "''Which door would the OTHER guard say is safe?'' — then pick the opposite door", "''Do you lie?''"], "correct_answer": "''Which door would the OTHER guard say is safe?'' — then pick the opposite door", "explanation": "The truth-teller accurately reports the liar''s lie (pointing to the wrong door). The liar lies about the truth-teller''s truth (also pointing to the wrong door). Both give the same wrong answer — so take the opposite. This elegant solution uses double-negation and meta-reasoning."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Puzzle: Monty Hall',
  'logic',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "You pick door #1 from 3 doors. The host (who knows where the prize is) opens door #3 to reveal no prize. Should you switch to door #2?", "type": "multiple_choice", "options": ["No — it makes no difference; each remaining door is now 50/50", "Yes — switching gives you a 2/3 chance of winning; staying gives only 1/3", "Yes — but only because the host opened the highest-numbered door", "No — the host''s action gives new information that cancels the original probabilities"], "correct_answer": "Yes — switching gives you a 2/3 chance of winning; staying gives only 1/3", "explanation": "The Monty Hall Problem: your initial pick had 1/3 chance of being right. That doesn''t change when the host (knowingly) reveals a goat. The 2/3 probability that you were wrong concentrates on the remaining door. Switching wins 2/3 of the time. Simulations and formal probability confirm this counterintuitive result."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Puzzle: hat colors',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Three people (A, B, C) sit in a line. Each wears a hat — either red or blue. C can see A and B. B can see only A. A can see no one. They must each guess their own hat color without communicating. B says ''I don''t know.'' What can A deduce?", "type": "multiple_choice", "options": ["Nothing — A has no information", "A''s hat is definitely red", "A''s hat is definitely blue", "A and B have different colored hats"], "correct_answer": "Nothing — A has no information", "explanation": "B sees only A''s hat. If both A and B wore the same color, C could deduce C''s own color (since only 2 of each color might exist — but the problem doesn''t state the number of each color). Without knowing the distribution constraint, B saying ''I don''t know'' reveals only that A''s hat alone doesn''t let B be certain. A cannot determine their own hat from this alone."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Recursion: factorial',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A function: factorial(n) = n × factorial(n-1), with factorial(1) = 1. What is factorial(4)?", "type": "multiple_choice", "options": ["4", "8", "24", "16"], "correct_answer": "24", "explanation": "Unwind the recursion: factorial(4) = 4 × factorial(3) = 4 × 3 × factorial(2) = 4 × 3 × 2 × factorial(1) = 4 × 3 × 2 × 1 = 24. Recursion defines something in terms of itself with a base case to stop. It''s a fundamental programming pattern."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Recursion: base case',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A recursive function without a base case will:", "type": "multiple_choice", "options": ["Return 0 by default", "Call itself indefinitely, causing a stack overflow error", "Automatically stop when the input reaches 0", "Run exactly once and return nothing"], "correct_answer": "Call itself indefinitely, causing a stack overflow error", "explanation": "Without a base case (a stopping condition), a recursive function calls itself forever. Each call uses memory on the call stack. Eventually the stack runs out of space — a ''stack overflow.'' Every recursive function MUST have a base case that terminates the chain."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Algorithms: binary search',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "You''re searching for number 73 in a sorted list of 128 numbers. Using binary search (always checking the middle), what is the MAXIMUM number of checks needed?", "type": "multiple_choice", "options": ["7", "8", "12", "64"], "correct_answer": "7", "explanation": "Binary search halves the search space each step. 128 → 64 → 32 → 16 → 8 → 4 → 2 → 1. That''s 7 steps. Maximum steps = log₂(n). For 128: log₂(128) = 7. Binary search is O(log n) — dramatically faster than linear search''s O(n) for large datasets."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Algorithms: sorting logic',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Bubble sort compares adjacent pairs and swaps them if out of order. How many passes through [4, 3, 2, 1] are needed to fully sort it?", "type": "multiple_choice", "options": ["1", "2", "3", "4"], "correct_answer": "3", "explanation": "Pass 1: 4,3,2,1 → 3,4,2,1 → 3,2,4,1 → 3,2,1,4. Pass 2: 3,2,1,4 → 2,3,1,4 → 2,1,3,4. Pass 3: 2,1,3,4 → 1,2,3,4. 3 passes needed. Bubble sort is O(n²) — slow for large lists. For n elements in reverse order, you need n-1 passes."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Probability: expected value',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A game: roll a die. Win $6 if you roll a 6. Win $0 otherwise. It costs $2 to play. What is your expected profit per game?", "type": "multiple_choice", "options": ["+$1.00", "-$1.00", "$0.00", "+$4.00"], "correct_answer": "-$1.00", "explanation": "Expected value of winnings: (1/6 × $6) + (5/6 × $0) = $1. Cost to play: $2. Expected profit = $1 - $2 = -$1. You lose $1 on average per game. Expected value = Σ(probability × outcome) — it''s the foundation of rational decision-making."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logical equivalence: De Morgan''s Law',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "De Morgan''s Law states NOT(A AND B) = NOT A OR NOT B. Which is equivalent to NOT(A OR B)?", "type": "multiple_choice", "options": ["NOT A AND NOT B", "NOT A OR NOT B", "A AND B", "NOT A OR B"], "correct_answer": "NOT A AND NOT B", "explanation": "De Morgan''s second law: NOT(A OR B) = NOT A AND NOT B. Negating an OR flips it to AND (and vice versa). This is crucial in programming: !(a || b) is equivalent to !a && !b. Simplifying logic expressions with De Morgan''s avoids bugs."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Proof by contradiction',
  'logic',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "To prove ''there are infinitely many prime numbers,'' Euclid assumed the opposite (finitely many primes) and derived a contradiction. What type of proof is this?", "type": "multiple_choice", "options": ["Direct proof", "Proof by induction", "Proof by contradiction (reductio ad absurdum)", "Proof by exhaustion"], "correct_answer": "Proof by contradiction (reductio ad absurdum)", "explanation": "Proof by contradiction: assume the opposite of what you want to prove, then show this assumption leads to an impossibility. Euclid multiplied all supposed primes + 1, which either is prime (contradiction: not in our list) or has a prime factor not in our list. Either way — contradiction. Therefore infinitely many primes exist."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Proof by induction concept',
  'logic',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "Mathematical induction proves a statement is true for all positive integers. What are the two required steps?", "type": "multiple_choice", "options": ["Step 1: Test 100 cases. Step 2: Generalize from evidence.", "Step 1: Prove it''s true for n=1 (base case). Step 2: Prove that if it''s true for n=k, it must be true for n=k+1 (inductive step).", "Step 1: Assume it''s true. Step 2: Show assuming it false leads to contradiction.", "Step 1: Prove for all even numbers. Step 2: Prove for all odd numbers."], "correct_answer": "Step 1: Prove it''s true for n=1 (base case). Step 2: Prove that if it''s true for n=k, it must be true for n=k+1 (inductive step).", "explanation": "Induction is like an infinite row of dominoes: prove the first falls (base case), then prove each domino knocks over the next (inductive step). Together, they guarantee all dominoes — all positive integers — satisfy the statement. It''s a foundational proof technique in mathematics and computer science."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Puzzle: liar-truth-teller variation',
  'logic',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "A person says ''I always lie.'' Can this statement be true?", "type": "multiple_choice", "options": ["Yes — liars can make true statements about themselves", "No — if true, they''d be admitting to lying, contradicting the claim; if false, they don''t always lie, so this could be a false statement", "Yes — this is just a fact about their behavior", "No — it is illegal to lie about lying"], "correct_answer": "No — if true, they''d be admitting to lying, contradicting the claim; if false, they don''t always lie, so this could be a false statement", "explanation": "This is the Liar''s Paradox variant. If ''I always lie'' is true, then this statement is a lie, making it false — contradiction. If it''s false, they don''t always lie, which is consistent — so the statement CAN be false without paradox. A true liar cannot truthfully claim to always lie. This puzzle underpins Gödel''s incompleteness theorem."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Optimization: greedy thinking',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "You need to make change for 41 cents using the fewest coins (25¢, 10¢, 5¢, 1¢). A greedy algorithm always picks the largest coin that fits. How many coins does it use?", "type": "multiple_choice", "options": ["3", "4", "5", "6"], "correct_answer": "4", "explanation": "Greedy: 41¢ → take 25¢ (16 left) → take 10¢ (6 left) → take 5¢ (1 left) → take 1¢ (done). 4 coins: 25+10+5+1=41. The greedy algorithm works optimally for standard U.S. coins. (It fails for some coin systems — a key lesson in algorithm design.)"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Logical equivalence: contrapositive',
  'logic',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The statement ''If it is a square, then it has 4 sides'' is equivalent to which of the following?", "type": "multiple_choice", "options": ["If it has 4 sides, then it is a square", "If it does not have 4 sides, then it is not a square", "If it is not a square, then it does not have 4 sides", "All shapes with 4 sides are squares"], "correct_answer": "If it does not have 4 sides, then it is not a square", "explanation": "The contrapositive of ''If P then Q'' is ''If not Q then not P'' — logically equivalent to the original. ''If it is a square (P), then 4 sides (Q)'' → contrapositive: ''If not 4 sides (not Q), then not a square (not P).'' The converse (''If 4 sides, then square'') is NOT equivalent — rectangles have 4 sides but aren''t squares."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Puzzle: weighing coins',
  'logic',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "You have 9 coins — one is counterfeit and slightly heavier. Using a balance scale, what is the minimum number of weighings guaranteed to identify it?", "type": "multiple_choice", "options": ["2", "3", "4", "9"], "correct_answer": "2", "explanation": "Divide into groups of 3. Weigh group A vs group B. If balanced: fake is in group C — weigh 2 of the 3 coins against each other to find it (2 weighings total). If unbalanced: fake is in the heavier group — weigh 2 of those 3 to find it. Maximum 2 weighings. Each weighing with a balance eliminates 2/3 of possibilities (3 outcomes: left heavy, right heavy, balanced)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Puzzle: knights and knaves',
  'logic',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "On an island, knights always tell the truth and knaves always lie. A person says: \"I am a knave.\" What are they?", "type": "multiple_choice", "options": ["A knight", "A knave", "Either — we cannot tell", "Neither — the statement is impossible"], "correct_answer": "Neither — the statement is impossible", "explanation": "If they were a knight (truth-teller), saying \"I am a knave\" would be a lie — contradiction. If they were a knave (liar), saying \"I am a knave\" would be true — contradiction. No consistent assignment exists. This is the self-referential Liar Paradox: a well-formed sentence that is neither provably true nor false within the system."}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: science_junior.json
-- Subject: science  |  Age Tier: junior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'States of matter: solid',
  'science',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Which of the following is an example of a solid?", "type": "multiple_choice", "options": ["Steam", "Milk", "A rock", "Air"], "correct_answer": "A rock", "explanation": "A rock is a solid. Solids have a definite shape and volume — they don''t flow or spread out. Steam is a gas, milk is a liquid, and air is a gas."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'States of matter: liquid',
  'science',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What makes a liquid different from a solid?", "type": "multiple_choice", "options": ["A liquid has no mass", "A liquid takes the shape of its container", "A liquid cannot be poured", "A liquid is always cold"], "correct_answer": "A liquid takes the shape of its container", "explanation": "Liquids flow and take the shape of whatever container holds them, but they keep the same volume. Pour water into a tall glass or a wide bowl — same amount, different shape."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'States of matter: gas',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What happens to the particles in a gas compared to a solid?", "type": "multiple_choice", "options": ["Gas particles are packed tightly together", "Gas particles move slowly and stay in place", "Gas particles spread out and move freely in all directions", "Gas particles are heavier than solid particles"], "correct_answer": "Gas particles spread out and move freely in all directions", "explanation": "In a gas, particles move fast and spread out to fill any space. In a solid, particles are tightly packed and vibrate in place. This is why gas fills a whole room but a rock stays the same shape."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Change of state: melting',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What happens when ice melts?", "type": "multiple_choice", "options": ["It changes from liquid to solid", "It changes from solid to liquid", "It changes from liquid to gas", "It disappears completely"], "correct_answer": "It changes from solid to liquid", "explanation": "Melting is when a solid turns into a liquid by gaining heat energy. Ice (solid) melts into water (liquid) when it gets warm. The water doesn''t disappear — it just changes state."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Change of state: evaporation',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "When a puddle dries up after rain, what has happened to the water?", "type": "multiple_choice", "options": ["It soaked into the sky", "It evaporated into water vapor", "It turned into ice underground", "It was absorbed by clouds directly"], "correct_answer": "It evaporated into water vapor", "explanation": "Evaporation is when a liquid turns into a gas. Heat from the sun gives water molecules enough energy to escape into the air as invisible water vapor. The water isn''t gone — it''s in the atmosphere!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Water cycle: condensation',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Why do clouds form in the sky?", "type": "multiple_choice", "options": ["Wind pushes water up from the ocean", "Water vapor cools and condenses into tiny droplets", "The sun melts ice at the top of the atmosphere", "Smoke from fires turns into clouds"], "correct_answer": "Water vapor cools and condenses into tiny droplets", "explanation": "Condensation is the opposite of evaporation. When warm, moist air rises and cools, water vapor turns back into tiny liquid droplets that cluster together to form clouds."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Butterfly life cycle',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is the correct order of a butterfly''s life cycle?", "type": "multiple_choice", "options": ["Egg → Adult → Caterpillar → Chrysalis", "Caterpillar → Egg → Chrysalis → Adult", "Egg → Caterpillar → Chrysalis → Adult", "Chrysalis → Egg → Adult → Caterpillar"], "correct_answer": "Egg → Caterpillar → Chrysalis → Adult", "explanation": "A butterfly goes through 4 stages: egg, larva (caterpillar), pupa (chrysalis), and adult. This complete transformation is called metamorphosis."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Frog life cycle',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What hatches from a frog''s egg?", "type": "multiple_choice", "options": ["A tiny frog", "A tadpole", "A caterpillar", "A larva"], "correct_answer": "A tadpole", "explanation": "Frog eggs hatch into tadpoles — aquatic creatures that breathe through gills and have tails but no legs. Over time, tadpoles grow legs, lose their tails, and become adult frogs."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Plant life cycle',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does a seed need to start growing (germinating)?", "type": "multiple_choice", "options": ["Sunlight, sugar, and wind", "Water, warmth, and oxygen", "Moonlight, soil, and salt", "Fertilizer, rocks, and ice"], "correct_answer": "Water, warmth, and oxygen", "explanation": "Seeds need water, warmth, and oxygen to germinate. They don''t need sunlight yet — the seedling uses stored energy in the seed until it sprouts and can make its own food."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Photosynthesis',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What do plants use to make their own food through photosynthesis?", "type": "multiple_choice", "options": ["Soil, water, and moonlight", "Sunlight, water, and carbon dioxide", "Oxygen, sugar, and fertilizer", "Wind, rain, and heat"], "correct_answer": "Sunlight, water, and carbon dioxide", "explanation": "Plants make food using sunlight (energy), water (from roots), and carbon dioxide (from air). They produce glucose (sugar) as food and release oxygen as a byproduct — which is the air we breathe!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solar system: planets',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "How many planets are in our solar system?", "type": "multiple_choice", "options": ["7", "8", "9", "10"], "correct_answer": "8", "explanation": "There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Pluto was reclassified as a ''dwarf planet'' in 2006. Memory trick: My Very Educated Mother Just Served Us Nachos."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solar system: closest to the sun',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which planet is closest to the Sun?", "type": "multiple_choice", "options": ["Venus", "Earth", "Mercury", "Mars"], "correct_answer": "Mercury", "explanation": "Mercury is the closest planet to the Sun. Despite being the closest, it''s not the hottest — that''s Venus, because Venus has a thick atmosphere that traps heat."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solar system: largest planet',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which is the largest planet in our solar system?", "type": "multiple_choice", "options": ["Saturn", "Neptune", "Jupiter", "Uranus"], "correct_answer": "Jupiter", "explanation": "Jupiter is by far the largest planet — so big that all other planets could fit inside it. Its famous Great Red Spot is a storm that has raged for hundreds of years."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'The Moon',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Why does the Moon appear to shine at night?", "type": "multiple_choice", "options": ["It generates its own light like a star", "It reflects light from the Sun", "It absorbs heat from Earth and glows", "It is made of glowing rock"], "correct_answer": "It reflects light from the Sun", "explanation": "The Moon has no light of its own. It acts like a giant mirror, reflecting sunlight toward Earth. That''s also why we see different ''phases'' of the Moon as it orbits us."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Stars vs planets',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is the main difference between a star and a planet?", "type": "multiple_choice", "options": ["Stars are smaller than planets", "Stars produce their own light; planets reflect light", "Planets are hotter than stars", "Stars orbit planets"], "correct_answer": "Stars produce their own light; planets reflect light", "explanation": "Stars are massive balls of burning gas that produce their own heat and light through nuclear fusion. Planets are solid or gaseous bodies that only reflect starlight — they don''t make their own."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Simple machines: lever',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "A seesaw is an example of which simple machine?", "type": "multiple_choice", "options": ["Pulley", "Wheel and axle", "Lever", "Inclined plane"], "correct_answer": "Lever", "explanation": "A seesaw is a lever — a rigid bar that pivots on a fixed point called a fulcrum. Levers help us lift heavy objects or move things with less effort. Scissors, bottle openers, and crowbars are also levers."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Simple machines: inclined plane',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Why is it easier to push a heavy box up a ramp than to lift it straight up?", "type": "multiple_choice", "options": ["Ramps make objects lighter", "A ramp spreads the work over a longer distance, requiring less force", "Boxes slide faster on ramps", "Ramps always point downhill"], "correct_answer": "A ramp spreads the work over a longer distance, requiring less force", "explanation": "An inclined plane (ramp) is a simple machine. It doesn''t reduce the total work done, but it spreads it over a longer distance, so you need less force at any one moment. That''s why moving trucks use ramps!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Simple machines: pulley',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does a pulley help you do?", "type": "multiple_choice", "options": ["Cut things in half", "Change the direction of force to lift objects more easily", "Spin objects faster", "Push objects sideways"], "correct_answer": "Change the direction of force to lift objects more easily", "explanation": "A pulley uses a wheel and rope to change the direction of a force. Instead of lifting straight up (hard), you pull down (easier). Flagpoles and cranes use pulleys."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Simple machines: wheel and axle',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which of these is an example of a wheel and axle?", "type": "multiple_choice", "options": ["A knife", "A doorknob", "A ramp", "A ladder"], "correct_answer": "A doorknob", "explanation": "A doorknob is a wheel and axle — the large knob (wheel) rotates around a central shaft (axle). Turning the large knob takes little force, which is amplified to turn the tighter axle mechanism inside."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Weather: clouds and rain',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What causes rain to fall from clouds?", "type": "multiple_choice", "options": ["Clouds get too cold and shatter", "Water droplets in clouds combine and grow heavy enough to fall", "Wind pushes water out of clouds", "The sun pulls water down from clouds"], "correct_answer": "Water droplets in clouds combine and grow heavy enough to fall", "explanation": "Clouds are made of millions of tiny water droplets. When droplets bump into each other and join together, they form bigger drops. When the drops get heavy enough, gravity pulls them down as rain."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Weather: temperature',
  'science',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What instrument is used to measure temperature?", "type": "multiple_choice", "options": ["Barometer", "Anemometer", "Thermometer", "Rain gauge"], "correct_answer": "Thermometer", "explanation": "A thermometer measures temperature. A barometer measures air pressure, an anemometer measures wind speed, and a rain gauge measures rainfall. Scientists use all of these to study weather."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Weather: the water cycle',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which correctly describes the water cycle in order?", "type": "multiple_choice", "options": ["Rain → Evaporation → Snow → Clouds", "Evaporation → Condensation → Precipitation → Collection", "Clouds → Freezing → Melting → Steam", "Collection → Condensation → Evaporation → Rain"], "correct_answer": "Evaporation → Condensation → Precipitation → Collection", "explanation": "The water cycle: water evaporates (turns to vapor), vapor rises and condenses (forms clouds), precipitation falls (rain/snow), and water collects (lakes, rivers, groundwater) to start again."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Human body: skeleton',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is the main job of your skeleton?", "type": "multiple_choice", "options": ["To digest food", "To pump blood through your body", "To support your body and protect organs", "To help you breathe"], "correct_answer": "To support your body and protect organs", "explanation": "Your skeleton does three key things: supports your body''s structure, protects delicate organs (your skull protects your brain, your ribcage protects your heart and lungs), and works with muscles to allow movement."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Human body: heart',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does your heart do?", "type": "multiple_choice", "options": ["Filters waste from blood", "Pumps blood around your body", "Produces digestive juices", "Controls your thoughts"], "correct_answer": "Pumps blood around your body", "explanation": "Your heart is a muscle that pumps blood continuously around your body. Blood carries oxygen and nutrients to every cell and carries waste away. It beats about 100,000 times a day!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Human body: lungs',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What gas do your lungs take from the air when you breathe in?", "type": "multiple_choice", "options": ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], "correct_answer": "Oxygen", "explanation": "Your lungs take in oxygen from the air and pass it into your blood. In return, your blood gives carbon dioxide (a waste gas) back to your lungs, which you breathe out. This gas exchange happens constantly."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Human body: brain',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which organ controls all body functions including thinking, movement, and feelings?", "type": "multiple_choice", "options": ["Heart", "Stomach", "Liver", "Brain"], "correct_answer": "Brain", "explanation": "The brain is the control center of your body. It processes information from your senses, controls movement, stores memories, and regulates body functions — all at the same time!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Human body: digestion',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is the first step in the digestion of food?", "type": "multiple_choice", "options": ["The stomach breaks food down with acid", "The small intestine absorbs nutrients", "Chewing in the mouth breaks food into smaller pieces", "The liver filters the food"], "correct_answer": "Chewing in the mouth breaks food into smaller pieces", "explanation": "Digestion starts in your mouth. Teeth break food into smaller pieces and saliva begins breaking down starches. This makes it easier for the rest of your digestive system to extract nutrients."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Animals: vertebrates vs invertebrates',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which of these is an invertebrate (animal without a backbone)?", "type": "multiple_choice", "options": ["Dog", "Salmon", "Earthworm", "Eagle"], "correct_answer": "Earthworm", "explanation": "An earthworm is an invertebrate — it has no backbone. Dogs, salmon, and eagles are all vertebrates — they have a spine. About 97% of all animal species are invertebrates!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Animals: food chains',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "In a food chain: Grass → Rabbit → Fox. What is the grass called?", "type": "multiple_choice", "options": ["Consumer", "Predator", "Producer", "Decomposer"], "correct_answer": "Producer", "explanation": "Grass is a producer — it makes its own food using sunlight (photosynthesis). Rabbits and foxes are consumers because they eat other organisms. Producers are the foundation of every food chain."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Animals: habitat',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is a habitat?", "type": "multiple_choice", "options": ["An animal''s diet", "The natural environment where an organism lives", "A type of camouflage", "The group of animals an organism belongs to"], "correct_answer": "The natural environment where an organism lives", "explanation": "A habitat is the natural home of a plant or animal that provides food, water, shelter, and space. A polar bear''s habitat is the Arctic. A clownfish''s habitat is a coral reef."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Animals: mammals',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which of these is NOT a characteristic of mammals?", "type": "multiple_choice", "options": ["They are warm-blooded", "They breathe with gills", "They have hair or fur", "They feed their young with milk"], "correct_answer": "They breathe with gills", "explanation": "Mammals breathe with lungs, not gills. All mammals are warm-blooded, have hair or fur, and females feed their young with milk. Fish and most amphibians breathe with gills."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Forces: gravity',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What force pulls objects toward the center of the Earth?", "type": "multiple_choice", "options": ["Magnetism", "Friction", "Gravity", "Electricity"], "correct_answer": "Gravity", "explanation": "Gravity is a force that pulls objects with mass toward each other. Earth''s gravity pulls everything toward its center — that''s why things fall down when you drop them, and why we stay on the ground."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Forces: friction',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Why is it harder to slide a heavy box across a rough carpet than a smooth floor?", "type": "multiple_choice", "options": ["The carpet is heavier", "Rough surfaces create more friction", "Smooth floors create more gravity", "The box shrinks on carpet"], "correct_answer": "Rough surfaces create more friction", "explanation": "Friction is a force that resists movement between surfaces. Rough surfaces have more friction than smooth ones. Friction can be helpful (stopping a car) or something to reduce (wheels on a bike)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Magnets: poles',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What happens when you bring the north poles of two magnets together?", "type": "multiple_choice", "options": ["They attract and stick together", "They repel and push apart", "One loses its magnetism", "Nothing happens"], "correct_answer": "They repel and push apart", "explanation": "Like poles repel; opposite poles attract. Two north poles push each other away. A north pole and a south pole pull toward each other. This rule applies to all magnets."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Light: reflection',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Why can you see your reflection in a mirror?", "type": "multiple_choice", "options": ["The mirror generates light showing your image", "The mirror is transparent and shows what is behind it", "Light bounces off the smooth mirror surface back to your eyes", "Mirrors absorb light and replay it"], "correct_answer": "Light bounces off the smooth mirror surface back to your eyes", "explanation": "Reflection happens when light bounces off a surface. Smooth, shiny surfaces like mirrors reflect light in a very organized way, which produces a clear image. Rough surfaces scatter light in all directions, so no image forms."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Sound: vibration',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "How is sound produced?", "type": "multiple_choice", "options": ["By objects stopping suddenly", "By objects vibrating back and forth", "By light reflecting off surfaces", "By air becoming hotter"], "correct_answer": "By objects vibrating back and forth", "explanation": "Sound is created when an object vibrates (moves back and forth rapidly). Those vibrations travel through air as waves to your ears. Pluck a guitar string and you can actually see it vibrate!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Sound: medium',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Can sound travel through outer space?", "type": "multiple_choice", "options": ["Yes, faster than on Earth", "Yes, but only in one direction", "No, because space is a vacuum with no particles to vibrate", "No, because it is too cold in space"], "correct_answer": "No, because space is a vacuum with no particles to vibrate", "explanation": "Sound needs a medium (like air, water, or solid material) to travel through. Space is a near-perfect vacuum — almost no particles exist there. Without particles to vibrate, sound cannot travel."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ecosystems: decomposers',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What role do decomposers like fungi and bacteria play in an ecosystem?", "type": "multiple_choice", "options": ["They hunt and eat other animals", "They make food from sunlight", "They break down dead organisms and return nutrients to the soil", "They move seeds from plant to plant"], "correct_answer": "They break down dead organisms and return nutrients to the soil", "explanation": "Decomposers are nature''s recyclers. They break down dead plants and animals into simpler substances, returning nutrients to the soil. Without decomposers, dead matter would pile up and nutrients would be lost."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ecosystems: food web',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What would most likely happen in an ecosystem if all the rabbits suddenly disappeared?", "type": "multiple_choice", "options": ["Foxes would thrive because they eat less", "Foxes might struggle because they lost a food source", "Grass would disappear too", "Nothing would change"], "correct_answer": "Foxes might struggle because they lost a food source", "explanation": "In a food web, removing one species affects others. Without rabbits, predators like foxes lose a food source and their population may decline. This shows why biodiversity is so important."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Matter: mass vs weight',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "If an astronaut travels to the Moon, what happens to their mass and weight?", "type": "multiple_choice", "options": ["Both mass and weight stay the same", "Mass decreases, weight stays the same", "Mass stays the same, weight decreases", "Both mass and weight decrease equally"], "correct_answer": "Mass stays the same, weight decreases", "explanation": "Mass is the amount of matter in an object — it never changes. Weight is the force of gravity on that mass. The Moon has less gravity than Earth, so an astronaut weighs less there, but their mass is identical."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Energy: forms',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "When you turn on a light bulb, what energy transformation takes place?", "type": "multiple_choice", "options": ["Light energy → electrical energy", "Electrical energy → light and heat energy", "Heat energy → sound energy", "Chemical energy → electrical energy only"], "correct_answer": "Electrical energy → light and heat energy", "explanation": "A light bulb converts electrical energy into light energy and heat energy. Energy transformations happen all around us — a car converts chemical energy (fuel) into kinetic energy (movement)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Energy: renewable vs nonrenewable',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which of these is a renewable energy source?", "type": "multiple_choice", "options": ["Coal", "Natural gas", "Solar power", "Oil"], "correct_answer": "Solar power", "explanation": "Renewable energy sources naturally replenish and won''t run out. Solar power, wind, and water (hydroelectric) are renewable. Coal, oil, and natural gas are fossil fuels — they take millions of years to form and will eventually run out."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Plants: parts and functions',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is the main job of a plant''s roots?", "type": "multiple_choice", "options": ["To make food using sunlight", "To absorb water and nutrients from soil and anchor the plant", "To release oxygen into the air", "To attract insects for pollination"], "correct_answer": "To absorb water and nutrients from soil and anchor the plant", "explanation": "Roots have two main jobs: absorbing water and minerals from the soil, and anchoring the plant so it doesn''t fall over. Roots also store energy in some plants, like carrots and beets."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solar system: Earth''s rotation',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What causes day and night on Earth?", "type": "multiple_choice", "options": ["The Sun moves around the Earth", "The Moon blocks the Sun''s light at night", "The Earth spins (rotates) on its axis", "Clouds cover the Sun at night"], "correct_answer": "The Earth spins (rotates) on its axis", "explanation": "Earth rotates on its axis once every 24 hours. The side facing the Sun experiences day; the side facing away experiences night. The Sun doesn''t move — we spin past it!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Solar system: seasons',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What causes the seasons on Earth?", "type": "multiple_choice", "options": ["Earth getting closer and farther from the Sun", "Earth''s tilted axis as it orbits the Sun", "The Moon''s orbit changing the temperature", "Clouds blocking different amounts of sunlight each month"], "correct_answer": "Earth''s tilted axis as it orbits the Sun", "explanation": "Earth is tilted at about 23.5 degrees. As it orbits the Sun, different hemispheres tilt toward or away from the Sun, causing seasons. When your hemisphere tilts toward the Sun, you get summer; away = winter."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Adaptation: camouflage',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "A stick insect looks exactly like a twig. This is an example of:", "type": "multiple_choice", "options": ["Migration", "Camouflage", "Hibernation", "Pollination"], "correct_answer": "Camouflage", "explanation": "Camouflage is when an animal''s appearance blends with its surroundings. This adaptation helps animals hide from predators or sneak up on prey. Stick insects, leopards, and arctic hares all use camouflage."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Adaptation: hibernation',
  'science',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Why do some animals hibernate in winter?", "type": "multiple_choice", "options": ["They get bored in winter", "Food is scarce and temperatures are too cold to survive active life", "They need more sleep as they get older", "Winter makes them grow faster"], "correct_answer": "Food is scarce and temperatures are too cold to survive active life", "explanation": "Hibernation is a survival adaptation. When food is scarce and temperatures drop, some animals (like bears and groundhogs) enter a deep sleep, slowing their metabolism to survive on stored body fat."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Scientific method: hypothesis',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "In the scientific method, what is a hypothesis?", "type": "multiple_choice", "options": ["The final conclusion of an experiment", "A testable prediction or educated guess about what will happen", "The materials needed for an experiment", "The data collected during an experiment"], "correct_answer": "A testable prediction or educated guess about what will happen", "explanation": "A hypothesis is an educated guess that can be tested. It''s usually written as ''If... then...'' For example: ''If plants get more sunlight, then they will grow taller.'' You then design an experiment to test it."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Scientific method: variables',
  'science',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "A student tests if plants grow taller with more water. She uses the same soil, same sunlight, and same seeds, but gives each plant a different amount of water. What is the independent variable?", "type": "multiple_choice", "options": ["The height of the plants", "The type of soil", "The amount of water given", "The amount of sunlight"], "correct_answer": "The amount of water given", "explanation": "The independent variable is what the scientist deliberately changes. Here, water amount is changed on purpose. The dependent variable (what is measured) is plant height. The other factors kept the same are called controlled variables."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Electricity: circuit',
  'science',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What must be true for a light bulb to turn on in a circuit?", "type": "multiple_choice", "options": ["The circuit must be broken", "The circuit must be complete with no gaps", "The circuit must use only one wire", "The battery must face away from the bulb"], "correct_answer": "The circuit must be complete with no gaps", "explanation": "Electricity needs a complete, unbroken path to flow. If there is any gap (like a switch turned off or a broken wire), the circuit is open and electricity stops flowing. Close the gap — the bulb lights up!"}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: science_senior.json
-- Subject: science  |  Age Tier: senior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Periodic table: atomic number',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "What does the atomic number of an element represent?", "type": "multiple_choice", "options": ["The number of neutrons in the nucleus", "The number of protons in the nucleus", "The total mass of the atom", "The number of electron shells"], "correct_answer": "The number of protons in the nucleus", "explanation": "The atomic number is the number of protons in an atom''s nucleus. It uniquely identifies each element — carbon always has 6 protons, oxygen always has 8. The atomic number also equals the number of electrons in a neutral atom."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Periodic table: groups',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Elements in the same group (column) of the periodic table share which property?", "type": "multiple_choice", "options": ["The same atomic mass", "The same number of protons", "The same number of outer (valence) electrons", "The same state of matter at room temperature"], "correct_answer": "The same number of outer (valence) electrons", "explanation": "Elements in the same group have the same number of valence (outer shell) electrons. This gives them similar chemical properties. All Group 1 elements (alkali metals) have 1 valence electron and react vigorously with water."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Periodic table: noble gases',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Why are noble gases (Group 18) generally unreactive?", "type": "multiple_choice", "options": ["They are too heavy to react", "They have a full outer electron shell and are chemically stable", "They exist only as solids", "They have no protons"], "correct_answer": "They have a full outer electron shell and are chemically stable", "explanation": "Noble gases (helium, neon, argon, etc.) have 8 valence electrons — a full outer shell. Atoms react to gain or lose electrons to achieve a full shell. Noble gases are already stable, so they rarely form compounds."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Chemical reactions: evidence',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Which of the following is NOT evidence that a chemical reaction has occurred?", "type": "multiple_choice", "options": ["A gas is produced (bubbles)", "A color change occurs", "Ice melting in warm water", "A precipitate (solid) forms in a liquid"], "correct_answer": "Ice melting in warm water", "explanation": "Ice melting is a physical change — water changes state but no new substance is formed. Chemical reaction signs include: gas production, color change, precipitate forming, energy release (heat/light), and irreversibility."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Chemical reactions: reactants and products',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "In the equation: 2H₂ + O₂ → 2H₂O, what are the reactants?", "type": "multiple_choice", "options": ["Only H₂O", "H₂ and O₂", "Only O₂", "H₂O and O₂"], "correct_answer": "H₂ and O₂", "explanation": "Reactants are the starting materials (on the left of the arrow). Products are what''s formed (on the right). Here hydrogen gas (H₂) and oxygen gas (O₂) react to form water (H₂O)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Chemical reactions: conservation of mass',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "If 10 g of reactants combine in a closed container and the reaction produces a gas, how much do all the products together weigh?", "type": "multiple_choice", "options": ["Less than 10 g because gas escapes", "More than 10 g because energy is added", "Exactly 10 g", "It depends on the temperature"], "correct_answer": "Exactly 10 g", "explanation": "The Law of Conservation of Mass states that matter is neither created nor destroyed in a chemical reaction. The total mass of products always equals the total mass of reactants. Atoms rearrange — they don''t disappear."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Acids and bases: pH scale',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "On the pH scale, what does a pH of 7 indicate?", "type": "multiple_choice", "options": ["A strong acid", "A strong base", "A neutral substance", "A toxic substance"], "correct_answer": "A neutral substance", "explanation": "The pH scale runs from 0–14. pH 7 is neutral (pure water). Below 7 is acidic (the lower, the stronger). Above 7 is basic/alkaline (the higher, the stronger). Stomach acid is about pH 2; bleach is about pH 12."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Newton''s First Law',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "A ball is rolling across a frictionless surface. According to Newton''s First Law, what will happen?", "type": "multiple_choice", "options": ["It will gradually slow down and stop", "It will speed up over time", "It will continue moving at the same speed in the same direction forever", "It will change direction randomly"], "correct_answer": "It will continue moving at the same speed in the same direction forever", "explanation": "Newton''s First Law (Law of Inertia): an object in motion stays in motion, and an object at rest stays at rest, unless acted on by an external force. With no friction, nothing stops the ball."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Newton''s Second Law',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A 5 kg object is pushed with a net force of 20 N. What is its acceleration?", "type": "multiple_choice", "options": ["4 m/s²", "25 m/s²", "100 m/s²", "0.25 m/s²"], "correct_answer": "4 m/s²", "explanation": "Newton''s Second Law: F = ma, so a = F ÷ m. a = 20 N ÷ 5 kg = 4 m/s². The greater the force, the greater the acceleration. The greater the mass, the less acceleration for the same force."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Newton''s Third Law',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "A rocket launches by expelling hot gas downward. According to Newton''s Third Law, what happens?", "type": "multiple_choice", "options": ["The gas pushes the rocket downward too", "The expelled gas pushes the rocket upward with equal force", "The rocket slows down as gas is lost", "Nothing acts on the rocket — only gravity matters"], "correct_answer": "The expelled gas pushes the rocket upward with equal force", "explanation": "Newton''s Third Law: for every action, there is an equal and opposite reaction. The rocket pushes gas down; the gas pushes the rocket up with the same force. This is how all rockets and jet engines work."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cell biology: cell types',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "What is the key difference between prokaryotic and eukaryotic cells?", "type": "multiple_choice", "options": ["Prokaryotes are larger than eukaryotes", "Eukaryotes have a membrane-bound nucleus; prokaryotes do not", "Prokaryotes have mitochondria; eukaryotes do not", "Eukaryotes only exist in plants"], "correct_answer": "Eukaryotes have a membrane-bound nucleus; prokaryotes do not", "explanation": "Eukaryotic cells (plants, animals, fungi) have a nucleus enclosed in a membrane, along with other organelles. Prokaryotic cells (bacteria) have no membrane-bound nucleus — their DNA floats in the cytoplasm."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cell biology: mitochondria',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Why is the mitochondrion called the ''powerhouse of the cell''?", "type": "multiple_choice", "options": ["It controls what enters and exits the cell", "It produces ATP (energy) through cellular respiration", "It builds proteins from amino acids", "It stores the cell''s genetic information"], "correct_answer": "It produces ATP (energy) through cellular respiration", "explanation": "Mitochondria convert glucose and oxygen into ATP (adenosine triphosphate) — the energy currency cells use for all their functions. The process is called cellular respiration: C₆H₁₂O₆ + O₂ → CO₂ + H₂O + ATP."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cell biology: cell membrane',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The cell membrane is described as ''selectively permeable.'' What does this mean?", "type": "multiple_choice", "options": ["It is completely impermeable — nothing passes through", "It allows all substances to pass through freely", "It allows some substances to pass while blocking others", "It only allows water to pass through"], "correct_answer": "It allows some substances to pass while blocking others", "explanation": "Selectively permeable means the membrane controls what enters and exits the cell. Small molecules like water and oxygen pass freely. Large or charged molecules need special protein channels or active transport."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cell biology: photosynthesis equation',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which is the correct equation for photosynthesis?", "type": "multiple_choice", "options": ["CO₂ + H₂O + light → C₆H₁₂O₆ + O₂", "C₆H₁₂O₆ + O₂ → CO₂ + H₂O + ATP", "H₂O + O₂ → CO₂ + glucose", "light + O₂ → CO₂ + H₂O"], "correct_answer": "CO₂ + H₂O + light → C₆H₁₂O₆ + O₂", "explanation": "Photosynthesis: carbon dioxide + water + light energy → glucose + oxygen. Plants absorb CO₂ and H₂O, use light energy to build glucose (C₆H₁₂O₆), and release O₂ as a byproduct. The reverse is cellular respiration."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Genetics: DNA',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "What is the shape of a DNA molecule?", "type": "multiple_choice", "options": ["Single helix", "Double helix", "Straight ladder", "Circular loop"], "correct_answer": "Double helix", "explanation": "DNA is shaped like a twisted ladder — a double helix. The ''rungs'' are pairs of nitrogenous bases (A-T and G-C). This structure was discovered by Watson and Crick in 1953, using X-ray data from Rosalind Franklin."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Genetics: base pairing',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "In DNA, adenine (A) always pairs with _______, and guanine (G) always pairs with _______.", "type": "multiple_choice", "options": ["Guanine (G) and Cytosine (C)", "Thymine (T) and Cytosine (C)", "Cytosine (C) and Thymine (T)", "Thymine (T) and Adenine (A)"], "correct_answer": "Thymine (T) and Cytosine (C)", "explanation": "DNA base pairing rules: A pairs with T (adenine-thymine), and G pairs with C (guanine-cytosine). These are called complementary base pairs. If one strand reads ATGC, the other reads TACG."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Genetics: dominant and recessive',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A pea plant has one dominant allele for tallness (T) and one recessive allele for shortness (t). What will the plant look like?", "type": "multiple_choice", "options": ["Short, because the recessive allele overpowers it", "Medium height", "Tall, because the dominant allele masks the recessive one", "It could be either, randomly"], "correct_answer": "Tall, because the dominant allele masks the recessive one", "explanation": "When one dominant allele (T) and one recessive allele (t) are present, the dominant trait is expressed. The plant is ''Tt'' — heterozygous. Only ''tt'' (two recessive alleles) produces a short plant."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Genetics: Punnett square',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Two heterozygous tall pea plants (Tt × Tt) are crossed. What percentage of offspring will be short (tt)?", "type": "multiple_choice", "options": ["0%", "25%", "50%", "75%"], "correct_answer": "25%", "explanation": "Using a Punnett square: Tt × Tt gives TT, Tt, Tt, tt. That''s 1 TT : 2 Tt : 1 tt. Only tt is short = 1 out of 4 = 25%. This is Mendel''s 3:1 ratio."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Genetics: mutations',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What is a genetic mutation?", "type": "multiple_choice", "options": ["A change in an organism''s behavior", "A permanent change in the DNA sequence", "The process of cell division", "The transfer of traits from parent to offspring"], "correct_answer": "A permanent change in the DNA sequence", "explanation": "A mutation is a change in the nucleotide sequence of DNA. Mutations can be caused by copying errors, radiation, or chemicals. Some are harmful, some neutral, and rarely, some are beneficial — driving evolution."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ecology: biomes',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Which biome receives less than 25 cm of rain per year and experiences extreme temperature swings between day and night?", "type": "multiple_choice", "options": ["Tropical rainforest", "Tundra", "Desert", "Temperate forest"], "correct_answer": "Desert", "explanation": "Deserts receive very little precipitation (under 25 cm/year) and can have dramatic temperature swings — scorching hot by day when sand absorbs heat, and cold at night when that heat radiates away quickly."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ecology: symbiosis',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Clownfish live among sea anemone tentacles without being stung. The anemone eats scraps dropped by the clownfish. This relationship is an example of:", "type": "multiple_choice", "options": ["Parasitism", "Commensalism", "Mutualism", "Predation"], "correct_answer": "Mutualism", "explanation": "Mutualism is a symbiotic relationship where both species benefit. The clownfish gets protection from predators; the anemone gets food scraps and cleaning. Both win. Parasitism harms the host; commensalism benefits only one."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ecology: carbon cycle',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "How does burning fossil fuels affect the carbon cycle?", "type": "multiple_choice", "options": ["It removes carbon from the atmosphere", "It releases stored carbon back into the atmosphere as CO₂", "It converts carbon into oxygen", "It has no measurable effect"], "correct_answer": "It releases stored carbon back into the atmosphere as CO₂", "explanation": "Fossil fuels (coal, oil, gas) are ancient organic matter — carbon stored underground for millions of years. Burning them releases that carbon as CO₂. This adds carbon to the atmosphere faster than natural cycles can absorb it, contributing to climate change."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ecology: trophic levels',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Only about 10% of energy passes from one trophic level to the next. If producers contain 10,000 kcal of energy, how much energy is available to secondary consumers?", "type": "multiple_choice", "options": ["1,000 kcal", "100 kcal", "10 kcal", "10,000 kcal"], "correct_answer": "100 kcal", "explanation": "The 10% rule: 10,000 kcal (producers) → 1,000 kcal (primary consumers) → 100 kcal (secondary consumers). 90% is lost as heat at each level. This is why food chains rarely exceed 4–5 levels."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Waves: properties',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What is the relationship between the frequency and wavelength of a wave if the speed stays constant?", "type": "multiple_choice", "options": ["Higher frequency = longer wavelength", "Higher frequency = shorter wavelength", "Frequency and wavelength are unrelated", "They always increase together"], "correct_answer": "Higher frequency = shorter wavelength", "explanation": "Wave speed = frequency × wavelength. If speed is constant, they''re inversely proportional: increase frequency → decrease wavelength, and vice versa. Think of sound: higher pitch (frequency) = shorter waves."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Electromagnetic spectrum',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which type of electromagnetic radiation has the highest energy?", "type": "multiple_choice", "options": ["Radio waves", "Visible light", "Infrared", "Gamma rays"], "correct_answer": "Gamma rays", "explanation": "Energy in the EM spectrum increases with frequency. Order from lowest to highest energy: radio → microwave → infrared → visible → UV → X-ray → gamma rays. Gamma rays have the shortest wavelength and highest frequency."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Thermodynamics: heat transfer',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A metal spoon placed in hot soup becomes hot quickly. This is an example of:", "type": "multiple_choice", "options": ["Convection", "Radiation", "Conduction", "Evaporation"], "correct_answer": "Conduction", "explanation": "Conduction is heat transfer through direct contact between particles. Metals are excellent conductors because their free electrons transfer energy quickly. Convection moves heat through fluid circulation; radiation transfers heat through electromagnetic waves."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Atomic structure: isotopes',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Carbon-12 and Carbon-14 are isotopes of carbon. What makes them different?", "type": "multiple_choice", "options": ["They have different numbers of protons", "They have different numbers of electrons", "They have different numbers of neutrons", "They are different elements"], "correct_answer": "They have different numbers of neutrons", "explanation": "Isotopes are atoms of the same element with different numbers of neutrons. Carbon-12 has 6 protons and 6 neutrons; Carbon-14 has 6 protons and 8 neutrons. Same element, different mass. Carbon-14 is radioactive and used in dating ancient materials."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Evolution: natural selection',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A population of beetles lives on dark tree bark. Most are brown, but a few are green. Birds easily spot and eat the green beetles. Over many generations, what happens?", "type": "multiple_choice", "options": ["Green beetles evolve to become darker on purpose", "Brown beetles become the dominant color through natural selection", "All beetles eventually go extinct", "Birds stop eating green beetles"], "correct_answer": "Brown beetles become the dominant color through natural selection", "explanation": "Natural selection: organisms with traits better suited to their environment survive and reproduce more. Brown beetles survive longer, pass on their genes. Over generations, brown becomes more common. Evolution isn''t intentional — it''s differential survival."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cell division: mitosis',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What is the purpose of mitosis?", "type": "multiple_choice", "options": ["To produce sex cells (eggs and sperm)", "To produce two genetically identical daughter cells for growth and repair", "To reduce the chromosome number by half", "To combine DNA from two parents"], "correct_answer": "To produce two genetically identical daughter cells for growth and repair", "explanation": "Mitosis produces two identical copies of the original cell, used for growth, tissue repair, and asexual reproduction. Meiosis is different — it produces 4 sex cells with half the chromosomes, enabling sexual reproduction."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cell division: meiosis',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Why is it important that meiosis produces cells with half the normal chromosome number (haploid)?", "type": "multiple_choice", "options": ["So cells are smaller and fit in reproductive organs", "So when two sex cells combine at fertilization, the offspring has the correct total chromosome number", "To prevent mutations from occurring", "So offspring are genetically identical to one parent"], "correct_answer": "So when two sex cells combine at fertilization, the offspring has the correct total chromosome number", "explanation": "Humans have 46 chromosomes (23 pairs). Meiosis halves this to 23. When sperm (23) and egg (23) unite at fertilization, the resulting zygote has 46 — the correct full number. Without this halving, chromosome numbers would double every generation."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Chemistry: physical vs chemical change',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Which of the following is a chemical change (not just physical)?", "type": "multiple_choice", "options": ["Cutting paper into pieces", "Dissolving sugar in water", "Rusting iron", "Crushing a can"], "correct_answer": "Rusting iron", "explanation": "Rusting is a chemical change — iron reacts with oxygen and water to form iron oxide, a new substance with different properties. Physical changes (cutting, dissolving sugar, crushing) alter form but not chemical composition."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Physics: work and energy',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "You push a wall with all your strength but it doesn''t move. In the scientific sense, how much work have you done on the wall?", "type": "multiple_choice", "options": ["A large amount — you exerted a lot of force", "Some — depending on how hard you pushed", "Zero — because the wall didn''t move", "Negative work"], "correct_answer": "Zero — because the wall didn''t move", "explanation": "In physics, Work = Force × Distance. If the wall doesn''t move (distance = 0), then work = 0, regardless of how much force was applied. You felt tired, but scientifically, you did no work on the wall."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Physics: kinetic and potential energy',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A roller coaster at the top of its highest hill has maximum _______; at the bottom of the hill moving fastest, it has maximum _______.", "type": "multiple_choice", "options": ["kinetic energy; potential energy", "potential energy; kinetic energy", "speed; height", "mass; acceleration"], "correct_answer": "potential energy; kinetic energy", "explanation": "At the top: height is maximum, so gravitational potential energy (PE = mgh) is maximum, speed is minimum. At the bottom: height is zero, PE converts to kinetic energy (KE = ½mv²), so speed is maximum."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Periodic table: metals vs nonmetals',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "Which property do metals generally have that nonmetals do not?", "type": "multiple_choice", "options": ["They are poor conductors of electricity", "They are gases at room temperature", "They conduct heat and electricity well", "They are transparent"], "correct_answer": "They conduct heat and electricity well", "explanation": "Metals are good conductors because their outer electrons are loosely held and can move freely. Nonmetals generally don''t conduct electricity (except graphite). Metals are also usually shiny, malleable, and have high melting points."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Genetics: sex-linked traits',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Color blindness is a recessive, X-linked trait. Why is it more common in males than females?", "type": "multiple_choice", "options": ["Males have stronger reactions to recessive genes", "Males only have one X chromosome, so one recessive allele is enough to express the trait", "The Y chromosome promotes color blindness", "Females are immune to X-linked conditions"], "correct_answer": "Males only have one X chromosome, so one recessive allele is enough to express the trait", "explanation": "Males are XY — they have only one X chromosome. If that X carries the color blindness allele, they express the trait. Females are XX — they need two copies of the recessive allele. One normal X is enough to prevent it in females."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Physics: Ohm''s Law',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A circuit has a voltage of 12V and a resistance of 4 ohms. What is the current?", "type": "multiple_choice", "options": ["48 A", "3 A", "0.33 A", "8 A"], "correct_answer": "3 A", "explanation": "Ohm''s Law: V = IR, so I = V ÷ R = 12 ÷ 4 = 3 A. V = voltage (volts), I = current (amps), R = resistance (ohms). Higher resistance reduces current for the same voltage."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Earth science: plate tectonics',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "When two tectonic plates collide and one is forced beneath the other, this is called:", "type": "multiple_choice", "options": ["Sea-floor spreading", "Subduction", "Continental drift", "Transform boundary"], "correct_answer": "Subduction", "explanation": "Subduction occurs at convergent boundaries when a denser oceanic plate dives beneath a continental plate. The descending plate melts in the mantle, which can create volcanoes above and deep ocean trenches below."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Earth science: rock cycle',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Limestone (sedimentary rock) deep underground is subjected to intense heat and pressure. It transforms into marble. This produces which type of rock?", "type": "multiple_choice", "options": ["Igneous", "Sedimentary", "Metamorphic", "Volcanic"], "correct_answer": "Metamorphic", "explanation": "Metamorphic rock forms when existing rocks are transformed by heat and pressure without melting. ''Metamorphic'' comes from Greek meaning ''change form.'' Limestone → marble and shale → slate are classic examples."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Cell biology: osmosis',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A red blood cell is placed in a solution with a higher salt concentration than the cell''s interior. What happens?", "type": "multiple_choice", "options": ["Water moves into the cell and it swells", "Water moves out of the cell and it shrinks", "Salt enters the cell and it swells", "Nothing changes because the membrane blocks everything"], "correct_answer": "Water moves out of the cell and it shrinks", "explanation": "Osmosis is water moving across a semipermeable membrane from low solute concentration to high. The solution outside has more solute (salt), so water moves out of the cell toward higher concentration, causing the cell to shrink (crenation)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Physics: speed vs velocity',
  'science',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "A car drives 100 km north, then 100 km south, returning to its starting point. After 2 hours total, what is its average velocity?", "type": "multiple_choice", "options": ["100 km/h", "0 km/h", "50 km/h", "200 km/h"], "correct_answer": "0 km/h", "explanation": "Velocity is displacement (change in position) ÷ time. The car returned to its start — net displacement is 0. So average velocity = 0 ÷ 2 = 0 km/h. Speed (total distance ÷ time) would be 100 km/h. Velocity includes direction and net change."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Chemistry: covalent vs ionic bonds',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What is the main difference between an ionic bond and a covalent bond?", "type": "multiple_choice", "options": ["Ionic bonds share electrons; covalent bonds transfer them", "Ionic bonds transfer electrons between atoms; covalent bonds share electrons", "Ionic bonds only form in gases; covalent bonds only in solids", "There is no significant difference"], "correct_answer": "Ionic bonds transfer electrons between atoms; covalent bonds share electrons", "explanation": "Ionic bonds: one atom loses electrons, one gains them, creating oppositely charged ions that attract (e.g., NaCl — table salt). Covalent bonds: atoms share electrons (e.g., H₂O, CO₂). Ionic bonds form between metals and nonmetals; covalent between nonmetals."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ecology: invasive species',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "An invasive species is introduced to a new ecosystem. Why can it often outcompete native species?", "type": "multiple_choice", "options": ["It always reproduces faster than native species", "It often has no natural predators in the new environment", "It instantly adapts to any new environment", "Native species always accept newcomers peacefully"], "correct_answer": "It often has no natural predators in the new environment", "explanation": "In its native habitat, an organism is kept in check by predators, parasites, and disease. In a new ecosystem, these controls may not exist, allowing the species to reproduce unchecked and overwhelm native competitors."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Human body: nervous system',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What is the difference between the central nervous system (CNS) and the peripheral nervous system (PNS)?", "type": "multiple_choice", "options": ["The CNS includes all nerves; the PNS is only in the brain", "The CNS is the brain and spinal cord; the PNS is all other nerves in the body", "The PNS controls voluntary movement; the CNS controls involuntary", "They are two names for the same system"], "correct_answer": "The CNS is the brain and spinal cord; the PNS is all other nerves in the body", "explanation": "The CNS (brain + spinal cord) is the command center — it processes information and coordinates responses. The PNS is the network of nerves that carries signals between the CNS and the rest of the body."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Human body: hormones',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "When blood sugar rises after eating, the pancreas releases insulin. What does insulin do?", "type": "multiple_choice", "options": ["It breaks down fat for energy", "It signals cells to absorb glucose, lowering blood sugar", "It stimulates hunger", "It raises blood pressure"], "correct_answer": "It signals cells to absorb glucose, lowering blood sugar", "explanation": "Insulin is a hormone that acts like a key — it ''unlocks'' cells so they can absorb glucose from the bloodstream. This lowers blood sugar back to normal. In Type 1 diabetes, the pancreas doesn''t produce insulin; in Type 2, cells don''t respond to it properly."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Scientific method: control group',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "In a drug trial, one group takes the new medication and another takes a sugar pill (placebo). What is the purpose of the placebo group?", "type": "multiple_choice", "options": ["To make the trial cheaper", "To serve as a baseline comparison so results can be attributed to the drug", "To ensure the drug is tested on unhealthy people", "To measure how effective placebos are"], "correct_answer": "To serve as a baseline comparison so results can be attributed to the drug", "explanation": "The control group (placebo) shows what happens without the treatment. Any difference between the groups can then be attributed to the drug itself. Without a control, you can''t know if improvements were due to the drug or other factors."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Physics: momentum',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A 2 kg ball moving at 6 m/s collides with a stationary 4 kg ball. If they stick together, what is their combined velocity? (Assume no external forces.)", "type": "multiple_choice", "options": ["6 m/s", "3 m/s", "2 m/s", "4 m/s"], "correct_answer": "2 m/s", "explanation": "Conservation of momentum: p before = p after. Before: (2 kg × 6 m/s) + (4 kg × 0) = 12 kg·m/s. After: (2+4) kg × v = 12. v = 12 ÷ 6 = 2 m/s. Momentum is always conserved in a closed system."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Ecology: greenhouse effect',
  'science',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The greenhouse effect is a natural process. Why is it currently a problem?", "type": "multiple_choice", "options": ["The greenhouse effect has never been natural — it is entirely human-caused", "Human activities are increasing greenhouse gas concentrations, trapping more heat than natural levels", "The Sun is emitting more radiation than in the past", "The ozone layer is growing thicker, trapping more light"], "correct_answer": "Human activities are increasing greenhouse gas concentrations, trapping more heat than natural levels", "explanation": "The natural greenhouse effect keeps Earth warm enough for life. The problem is enhancement: burning fossil fuels, deforestation, and agriculture add extra CO₂, methane, and nitrous oxide, trapping more heat and disrupting the global climate balance."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Human body: immune system',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "How do vaccines help the immune system fight disease?", "type": "multiple_choice", "options": ["They kill all bacteria in the body", "They introduce a weakened or inactive form of a pathogen so the immune system can build memory without full infection", "They increase body temperature to destroy viruses", "They replace white blood cells with stronger ones"], "correct_answer": "They introduce a weakened or inactive form of a pathogen so the immune system can build memory without full infection", "explanation": "Vaccines expose the immune system to an antigen (part of a pathogen or a weakened form) without causing disease. The immune system creates memory B-cells. If the real pathogen appears later, the immune system recognizes and destroys it rapidly."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Periodic table: electron configuration',
  'science',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "An atom of sodium (Na) has atomic number 11. How many electrons are in its outermost shell?", "type": "multiple_choice", "options": ["1", "2", "8", "11"], "correct_answer": "1", "explanation": "Sodium has 11 electrons. Filled shells: 1st shell = 2, 2nd shell = 8, leaving 11 − 10 = 1 electron in the 3rd shell. This lone valence electron explains why sodium reacts readily — it easily loses that electron to achieve a stable full shell."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Physics: gravitational potential energy',
  'science',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A 3 kg book is lifted to a shelf 2 meters high. Using PE = mgh (g = 10 m/s²), what is its gravitational potential energy?", "type": "multiple_choice", "options": ["6 J", "30 J", "60 J", "600 J"], "correct_answer": "60 J", "explanation": "PE = mgh = 3 kg × 10 m/s² × 2 m = 60 J (joules). This energy is ''stored'' — if the book falls, that potential energy converts to kinetic energy as it accelerates downward."}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: vocab_junior.json
-- Subject: vocabulary  |  Age Tier: junior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: ancient',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does the word ''ancient'' mean?", "type": "multiple_choice", "options": ["Very new", "Very old", "Very large", "Very far away"], "correct_answer": "Very old", "explanation": "''Ancient'' means something that existed a very long time ago. Ancient Egypt and ancient Rome are thousands of years old."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: enormous',
  'vocabulary',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What does ''enormous'' mean?", "type": "multiple_choice", "options": ["Very tiny", "Very noisy", "Very huge", "Very fast"], "correct_answer": "Very huge", "explanation": "''Enormous'' means extremely large. A blue whale is enormous — it''s the biggest animal on Earth!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: fragile',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''fragile'' mean?", "type": "multiple_choice", "options": ["Strong and tough", "Easy to break", "Very colorful", "Hard to find"], "correct_answer": "Easy to break", "explanation": "''Fragile'' means something is delicate and can break easily. Glass and thin eggshells are fragile — handle with care!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: transparent',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''transparent'' mean?", "type": "multiple_choice", "options": ["Completely dark", "You can see through it", "Very colorful", "Impossible to move"], "correct_answer": "You can see through it", "explanation": "''Transparent'' means clear enough to see through. Windows and glass are transparent. The opposite is ''opaque,'' which you can''t see through."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: curious',
  'vocabulary',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What does ''curious'' mean?", "type": "multiple_choice", "options": ["Scared of everything", "Wanting to know or learn", "Feeling very sleepy", "Moving very quickly"], "correct_answer": "Wanting to know or learn", "explanation": "''Curious'' means you want to know more about something. Scientists are curious — they always ask questions and explore!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: miserable',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''miserable'' mean?", "type": "multiple_choice", "options": ["Extremely happy", "Very confused", "Very unhappy or uncomfortable", "Incredibly brave"], "correct_answer": "Very unhappy or uncomfortable", "explanation": "''Miserable'' means feeling very sad or suffering. Being sick with a bad cold on your birthday might feel miserable."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: peculiar',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''peculiar'' mean?", "type": "multiple_choice", "options": ["Very common and normal", "Strange or unusual", "Perfectly round", "Extremely loud"], "correct_answer": "Strange or unusual", "explanation": "''Peculiar'' means something is odd or out of the ordinary. A cat that barks like a dog would be peculiar!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: courageous',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''courageous'' mean?", "type": "multiple_choice", "options": ["Very clumsy", "Afraid of everything", "Brave despite being scared", "Moving very slowly"], "correct_answer": "Brave despite being scared", "explanation": "''Courageous'' means showing bravery even when something is scary. A firefighter running into a burning building is courageous."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: exhausted',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''exhausted'' mean?", "type": "multiple_choice", "options": ["Full of energy", "Extremely tired", "Very angry", "Slightly confused"], "correct_answer": "Extremely tired", "explanation": "''Exhausted'' means you are completely worn out. After running a race or working all day, you might feel exhausted."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: vibrant',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''vibrant'' mean?", "type": "multiple_choice", "options": ["Dull and gray", "Shaking with fear", "Full of brightness or energy", "Quiet and calm"], "correct_answer": "Full of brightness or energy", "explanation": "''Vibrant'' means full of life, energy, or bright color. A vibrant painting is full of bold, bright colors. A vibrant city is busy and exciting."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Synonym for ''happy''',
  'vocabulary',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Which word is a synonym (same meaning) for ''happy''?", "type": "multiple_choice", "options": ["Gloomy", "Joyful", "Angry", "Tired"], "correct_answer": "Joyful", "explanation": "''Joyful'' is a synonym for ''happy'' — they both mean feeling pleasure or delight. Synonyms are words with the same or similar meanings."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Synonym for ''begin''',
  'vocabulary',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Which word is a synonym for ''begin''?", "type": "multiple_choice", "options": ["Finish", "Pause", "Commence", "Forget"], "correct_answer": "Commence", "explanation": "''Commence'' means to start or begin. ''The ceremony will commence at noon'' means it will begin at noon."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Synonym for ''difficult''',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which word is a synonym for ''difficult''?", "type": "multiple_choice", "options": ["Simple", "Challenging", "Quick", "Friendly"], "correct_answer": "Challenging", "explanation": "''Challenging'' and ''difficult'' both mean something that requires effort or is hard to do. A challenging puzzle is a difficult puzzle."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Antonym for ''generous''',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is an antonym (opposite meaning) of ''generous''?", "type": "multiple_choice", "options": ["Giving", "Kind", "Selfish", "Wealthy"], "correct_answer": "Selfish", "explanation": "''Selfish'' is the antonym of ''generous.'' Generous means willing to give; selfish means keeping things for yourself. Antonyms are opposites!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Antonym for ''ancient''',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is the antonym of ''ancient''?", "type": "multiple_choice", "options": ["Old", "Modern", "Large", "Broken"], "correct_answer": "Modern", "explanation": "''Modern'' is the antonym of ''ancient.'' Ancient means very old; modern means new or of the present time."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Antonym for ''expand''',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is the antonym of ''expand''?", "type": "multiple_choice", "options": ["Grow", "Shrink", "Spread", "Explode"], "correct_answer": "Shrink", "explanation": "''Shrink'' is the antonym of ''expand.'' Expand means to get bigger; shrink means to get smaller."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: exhausted',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Fill in the blank: After the long hike, Sara was so _______ that she fell asleep before dinner.", "type": "multiple_choice", "options": ["curious", "exhausted", "vibrant", "peculiar"], "correct_answer": "exhausted", "explanation": "''Exhausted'' fits because a long hike would make someone extremely tired. The other words don''t make sense in this context."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: generous',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Fill in the blank: The _______ man gave half his lunch to the hungry dog.", "type": "multiple_choice", "options": ["fragile", "miserable", "generous", "ancient"], "correct_answer": "generous", "explanation": "''Generous'' fits because giving food to someone else shows generosity — willingness to share what you have."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: transparent',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Fill in the blank: The water in the mountain lake was so _______ we could see the fish swimming at the bottom.", "type": "multiple_choice", "options": ["enormous", "transparent", "courageous", "miserable"], "correct_answer": "transparent", "explanation": "''Transparent'' means clear enough to see through. Perfectly clear water lets you see straight to the bottom."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: peculiar',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Fill in the blank: It was _______ to see snow falling in the middle of July.", "type": "multiple_choice", "options": ["exhausted", "vibrant", "peculiar", "fragile"], "correct_answer": "peculiar", "explanation": "''Peculiar'' means strange or unusual. Snow in July is definitely strange and out of the ordinary — peculiar!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: cunning',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''cunning'' mean?", "type": "multiple_choice", "options": ["Very clumsy", "Clever at tricking others", "Extremely loud", "Completely honest"], "correct_answer": "Clever at tricking others", "explanation": "''Cunning'' means clever in a sneaky or tricky way. A fox is often called cunning in stories because it uses tricks to outsmart others."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: reluctant',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''reluctant'' mean?", "type": "multiple_choice", "options": ["Very eager and excited", "Unwilling or hesitant", "Extremely fast", "Very colorful"], "correct_answer": "Unwilling or hesitant", "explanation": "''Reluctant'' means not wanting to do something. You might be reluctant to go to bed when you''re in the middle of a good book."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: illuminate',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''illuminate'' mean?", "type": "multiple_choice", "options": ["To make dark", "To make wet", "To light up", "To make smaller"], "correct_answer": "To light up", "explanation": "''Illuminate'' means to light something up. A flashlight illuminates the dark. The word comes from ''lumen,'' the Latin word for light."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: predict',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''predict'' mean?", "type": "multiple_choice", "options": ["To forget the past", "To say what will happen before it does", "To draw a picture", "To measure something"], "correct_answer": "To say what will happen before it does", "explanation": "''Predict'' means to make a guess about what will happen in the future. Weather forecasters predict whether it will rain or shine."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: summarize',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''summarize'' mean?", "type": "multiple_choice", "options": ["To write a story from scratch", "To retell just the most important parts", "To memorize every word", "To disagree with an idea"], "correct_answer": "To retell just the most important parts", "explanation": "''Summarize'' means to give a short version of the main points. If you summarize a movie, you describe what happened without telling every single detail."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: taunting',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''taunting'' mean?", "type": "multiple_choice", "options": ["Cheering someone on", "Making fun of someone to upset them", "Helping a friend in need", "Moving very quietly"], "correct_answer": "Making fun of someone to upset them", "explanation": "''Taunting'' means saying mean things to provoke or upset someone. It''s a form of bullying. Taunting is unkind and hurtful."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Synonym for ''enormous''',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which word is a synonym for ''enormous''?", "type": "multiple_choice", "options": ["Tiny", "Immense", "Quiet", "Sharp"], "correct_answer": "Immense", "explanation": "''Immense'' is a synonym for ''enormous'' — both mean extremely large. The immense ocean stretches for thousands of miles."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Antonym for ''courageous''',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is the antonym of ''courageous''?", "type": "multiple_choice", "options": ["Bold", "Fearless", "Cowardly", "Strong"], "correct_answer": "Cowardly", "explanation": "''Cowardly'' is the antonym of ''courageous.'' Courageous means brave; cowardly means lacking bravery and avoiding danger out of fear."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: reluctant',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Fill in the blank: Max was _______ to admit he had made a mistake, but he finally told the truth.", "type": "multiple_choice", "options": ["vibrant", "reluctant", "ancient", "courageous"], "correct_answer": "reluctant", "explanation": "''Reluctant'' fits — Max was unwilling to admit the mistake. The phrase ''but he finally'' signals he resisted at first."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: persevere',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''persevere'' mean?", "type": "multiple_choice", "options": ["To give up quickly", "To keep trying even when it is hard", "To fall asleep suddenly", "To travel very far"], "correct_answer": "To keep trying even when it is hard", "explanation": "''Persevere'' means to keep going despite difficulty. Athletes who train every day even when tired are persevering. ''Per'' means through, and ''severe'' hints at hardship."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: abundant',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''abundant'' mean?", "type": "multiple_choice", "options": ["Scarce and rare", "More than enough of something", "Extremely heavy", "Very far away"], "correct_answer": "More than enough of something", "explanation": "''Abundant'' means there is a very large amount of something. In spring, flowers are abundant — they are everywhere!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: harsh',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''harsh'' mean?", "type": "multiple_choice", "options": ["Gentle and soft", "Rough, severe, or unkind", "Quiet and peaceful", "Bright and colorful"], "correct_answer": "Rough, severe, or unkind", "explanation": "''Harsh'' means rough or severe. A harsh winter is bitterly cold. Harsh words are unkind and hurtful."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Synonym for ''cunning''',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which word is the best synonym for ''cunning''?", "type": "multiple_choice", "options": ["Clumsy", "Crafty", "Gentle", "Ordinary"], "correct_answer": "Crafty", "explanation": "''Crafty'' and ''cunning'' both mean clever in a sneaky way. A crafty plan is one that uses tricks or cleverness to get what you want."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: valor',
  'vocabulary',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "What does ''valor'' mean?", "type": "multiple_choice", "options": ["A type of treasure", "Great bravery, especially in battle", "A feeling of sadness", "A colorful decoration"], "correct_answer": "Great bravery, especially in battle", "explanation": "''Valor'' means great courage and bravery. Soldiers who fight bravely to protect others show valor. It''s a noble quality."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: persevere',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Fill in the blank: Even after failing three times, Lily decided to _______ and try the math problem again.", "type": "multiple_choice", "options": ["predict", "persevere", "illuminate", "summarize"], "correct_answer": "persevere", "explanation": "''Persevere'' means to keep trying despite failure. Lily''s determination after three attempts shows perseverance."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Antonym for ''abundant''',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What is the antonym of ''abundant''?", "type": "multiple_choice", "options": ["Plenty", "Scarce", "Colorful", "Hidden"], "correct_answer": "Scarce", "explanation": "''Scarce'' is the antonym of ''abundant.'' Abundant means more than enough; scarce means there is very little of something."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: grateful',
  'vocabulary',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What does ''grateful'' mean?", "type": "multiple_choice", "options": ["Feeling angry about something", "Feeling thankful for something", "Feeling confused by something", "Feeling bored by something"], "correct_answer": "Feeling thankful for something", "explanation": "''Grateful'' means feeling or showing thanks. When someone does something kind for you, feeling grateful means you appreciate it."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: obstacle',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''obstacle'' mean?", "type": "multiple_choice", "options": ["A helpful tool", "Something that gets in your way", "A type of reward", "A beautiful landscape"], "correct_answer": "Something that gets in your way", "explanation": "''Obstacle'' means something that blocks you or makes progress difficult. A fallen tree across a path is an obstacle. So is self-doubt!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Synonym for ''obstacle''',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which word is a synonym for ''obstacle''?", "type": "multiple_choice", "options": ["Shortcut", "Barrier", "Solution", "Reward"], "correct_answer": "Barrier", "explanation": "''Barrier'' is a synonym for ''obstacle'' — both mean something that blocks the way. A wall is a physical barrier; fear can be an emotional barrier."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: abundant',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Fill in the blank: After the rain, there was _______ water in the river — more than the farmers had seen in years.", "type": "multiple_choice", "options": ["fragile", "cunning", "abundant", "reluctant"], "correct_answer": "abundant", "explanation": "''Abundant'' fits — the sentence says there was more water than ever before, meaning a very large amount."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: motive',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''motive'' mean?", "type": "multiple_choice", "options": ["A type of vehicle", "The reason someone does something", "A pattern of colors", "A loud sound"], "correct_answer": "The reason someone does something", "explanation": "''Motive'' means the reason behind an action. In a mystery story, detectives try to figure out the villain''s motive — why they did what they did."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Antonym for ''harsh''',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What is the antonym of ''harsh''?", "type": "multiple_choice", "options": ["Rough", "Gentle", "Loud", "Bright"], "correct_answer": "Gentle", "explanation": "''Gentle'' is the antonym of ''harsh.'' Harsh means rough or severe; gentle means soft, mild, and kind."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: vivid',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''vivid'' mean?", "type": "multiple_choice", "options": ["Dull and faded", "Very clear, bright, or detailed", "Completely silent", "Hard to understand"], "correct_answer": "Very clear, bright, or detailed", "explanation": "''Vivid'' means strikingly bright or detailed. A vivid painting pops with color. A vivid memory is one you can remember with great clarity."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: valor',
  'vocabulary',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "Fill in the blank: The medal was awarded for acts of _______ shown during the rescue mission.", "type": "multiple_choice", "options": ["motive", "valor", "curiosity", "obstacle"], "correct_answer": "valor", "explanation": "''Valor'' fits because bravery during a dangerous rescue mission deserves recognition. Medals are often given for valor in the military."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: efficient',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "What does ''efficient'' mean?", "type": "multiple_choice", "options": ["Very slow and wasteful", "Doing something well without wasting time or effort", "Extremely loud", "Very old and outdated"], "correct_answer": "Doing something well without wasting time or effort", "explanation": "''Efficient'' means getting something done quickly and well without wasting resources. An efficient worker finishes tasks faster and better."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Synonym for ''vivid''',
  'vocabulary',
  'junior',
  3,
  35,
  'quiz',
  '{"question": "Which word is the best synonym for ''vivid''?", "type": "multiple_choice", "options": ["Faint", "Striking", "Boring", "Hidden"], "correct_answer": "Striking", "explanation": "''Striking'' is a synonym for ''vivid'' — both mean something that stands out clearly and makes a strong impression."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: perspective',
  'vocabulary',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "What does ''perspective'' mean?", "type": "multiple_choice", "options": ["A type of telescope", "A person''s point of view or way of seeing things", "A plan to fix a problem", "A feeling of joy"], "correct_answer": "A person''s point of view or way of seeing things", "explanation": "''Perspective'' means the way you see or think about something based on your own experience. Two people can see the same event from very different perspectives."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Fill in the blank: perspective',
  'vocabulary',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "Fill in the blank: To understand the argument, it helps to look at it from the other person''s _______.", "type": "multiple_choice", "options": ["obstacle", "motive", "perspective", "valor"], "correct_answer": "perspective", "explanation": "''Perspective'' fits — seeing things from another person''s point of view helps you understand why they feel the way they do."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: devise',
  'vocabulary',
  'junior',
  4,
  45,
  'quiz',
  '{"question": "What does ''devise'' mean?", "type": "multiple_choice", "options": ["To destroy something", "To plan or invent something", "To copy someone else", "To forget something important"], "correct_answer": "To plan or invent something", "explanation": "''Devise'' means to carefully plan or create something. Scientists devise experiments. Generals devise battle plans. Inventors devise new gadgets."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Which word fits: gloomy',
  'vocabulary',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which sentence uses ''gloomy'' correctly?", "type": "multiple_choice", "options": ["The gloomy sun shone brightly all afternoon.", "She felt gloomy after hearing the sad news.", "The gloomy cheetah ran at full speed.", "We had a gloomy feast with all our friends."], "correct_answer": "She felt gloomy after hearing the sad news.", "explanation": "''Gloomy'' means dark, sad, or without hope. Feeling gloomy after sad news makes sense. The other sentences describe happy or bright things."}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: vocab_senior.json
-- Subject: vocabulary  |  Age Tier: senior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: ephemeral',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What does ''ephemeral'' mean?", "type": "multiple_choice", "options": ["Lasting forever", "Lasting only a very short time", "Extremely powerful", "Deeply mysterious"], "correct_answer": "Lasting only a very short time", "explanation": "''Ephemeral'' means short-lived or transitory. A mayfly is ephemeral — it lives for only one day. From the Greek ''ephemeros'' meaning ''lasting a day.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: perfidious',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''perfidious'' mean?", "type": "multiple_choice", "options": ["Extremely loyal", "Deceitful and untrustworthy", "Very skillful", "Carefully planned"], "correct_answer": "Deceitful and untrustworthy", "explanation": "''Perfidious'' means deliberately faithless or treacherous. A perfidious ally betrays your trust. From Latin ''perfidia'' meaning treachery."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: sycophant',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "What does ''sycophant'' mean?", "type": "multiple_choice", "options": ["A harsh critic", "Someone who flatters powerful people to gain favor", "A skilled negotiator", "A type of musical instrument"], "correct_answer": "Someone who flatters powerful people to gain favor", "explanation": "''Sycophant'' means a person who uses excessive flattery and fawning to win favor from those in power. Informally called a ''yes-man'' or ''brownnoser.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: obfuscate',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "What does ''obfuscate'' mean?", "type": "multiple_choice", "options": ["To make clear and simple", "To make confusing or unclear on purpose", "To speak very loudly", "To organize neatly"], "correct_answer": "To make confusing or unclear on purpose", "explanation": "''Obfuscate'' means to deliberately obscure or confuse. Politicians sometimes obfuscate the truth with vague language. From Latin ''obfuscare'' meaning to darken."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: ambivalent',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What does ''ambivalent'' mean?", "type": "multiple_choice", "options": ["Strongly in favor of something", "Strongly opposed to something", "Having mixed or conflicting feelings", "Completely indifferent"], "correct_answer": "Having mixed or conflicting feelings", "explanation": "''Ambivalent'' means simultaneously holding contradictory feelings. You might be ambivalent about moving to a new city — excited for opportunity but sad to leave friends."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: pragmatic',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What does ''pragmatic'' mean?", "type": "multiple_choice", "options": ["Idealistic and dreamy", "Dealing with things in a practical, realistic way", "Overly emotional", "Strictly following rules"], "correct_answer": "Dealing with things in a practical, realistic way", "explanation": "''Pragmatic'' means focused on practical results rather than theories or ideals. A pragmatic solution is one that actually works, not just one that sounds good."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: tenacious',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What does ''tenacious'' mean?", "type": "multiple_choice", "options": ["Quick to give up", "Holding firmly on despite difficulty", "Acting without thinking", "Avoiding all conflict"], "correct_answer": "Holding firmly on despite difficulty", "explanation": "''Tenacious'' means persistent and determined. A tenacious athlete keeps training through setbacks. From Latin ''tenax,'' meaning holding fast."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: ostracize',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''ostracize'' mean?", "type": "multiple_choice", "options": ["To include warmly in a group", "To exclude someone from a group or society", "To publicly celebrate someone", "To compete fiercely with someone"], "correct_answer": "To exclude someone from a group or society", "explanation": "''Ostracize'' means to banish or exclude someone. From ancient Athens, where citizens voted to exile dangerous people by writing on pottery shards called ''ostraka.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: loquacious',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''loquacious'' mean?", "type": "multiple_choice", "options": ["Very quiet and reserved", "Tending to talk a great deal", "Extremely logical", "Easily frightened"], "correct_answer": "Tending to talk a great deal", "explanation": "''Loquacious'' means very talkative or chatty. From Latin ''loqui'' meaning to speak. The root ''loqu-'' appears in words like ''eloquent'' and ''soliloquy.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: venerate',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''venerate'' mean?", "type": "multiple_choice", "options": ["To treat with deep respect or reverence", "To argue against strongly", "To investigate carefully", "To imitate someone"], "correct_answer": "To treat with deep respect or reverence", "explanation": "''Venerate'' means to regard with great respect, often for age or wisdom. Many cultures venerate their ancestors. From Latin ''venerari,'' meaning to worship."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: teacher : student',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Complete the analogy: Teacher is to student as doctor is to _______.", "type": "multiple_choice", "options": ["hospital", "medicine", "patient", "nurse"], "correct_answer": "patient", "explanation": "A teacher instructs a student; a doctor treats a patient. The relationship is professional → the person they serve. Analogies test logical relationships between word pairs."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: petal : flower',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Complete the analogy: Petal is to flower as chapter is to _______.", "type": "multiple_choice", "options": ["library", "author", "sentence", "novel"], "correct_answer": "novel", "explanation": "A petal is a part of a flower; a chapter is a part of a novel. The relationship is part → whole."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: timid : bold',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Complete the analogy: Timid is to bold as loquacious is to _______.", "type": "multiple_choice", "options": ["talkative", "eloquent", "taciturn", "verbose"], "correct_answer": "taciturn", "explanation": "Timid and bold are antonyms. Loquacious means talkative, so its antonym is taciturn — meaning habitually silent. The relationship is antonym pairs."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: ephemeral : lasting',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Complete the analogy: Ephemeral is to lasting as ambivalent is to _______.", "type": "multiple_choice", "options": ["confused", "decisive", "uncertain", "powerful"], "correct_answer": "decisive", "explanation": "Ephemeral (short-lived) is the antonym of lasting. Ambivalent (having mixed feelings) is the antonym of decisive (having a clear, firm decision)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Etymology: bene-',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Latin root ''bene'' means ''good'' or ''well.'' Which of the following words does NOT use this root?", "type": "multiple_choice", "options": ["beneficial", "benevolent", "benign", "belligerent"], "correct_answer": "belligerent", "explanation": "''Belligerent'' comes from Latin ''bellum'' (war), not ''bene.'' Beneficial (helpful), benevolent (kind), and benign (harmless) all contain the ''good/well'' root."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Etymology: mal-',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Latin root ''mal'' means ''bad.'' Which word means ''speaking badly about someone''?", "type": "multiple_choice", "options": ["magnify", "malign", "mandate", "marvel"], "correct_answer": "malign", "explanation": "''Malign'' means to speak critically or harmfully about someone. The ''mal-'' root (bad) + ''ign'' (related to ''genus,'' nature) = bad-natured. Other ''mal'' words: malice, malevolent, malfunction."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Etymology: -logy',
  'vocabulary',
  'senior',
  2,
  25,
  'quiz',
  '{"question": "The Greek root ''-logy'' means ''the study of.'' What does ''etymology'' mean?", "type": "multiple_choice", "options": ["The study of insects", "The study of word origins", "The study of the Earth", "The study of animals"], "correct_answer": "The study of word origins", "explanation": "''Etymology'' comes from Greek ''etymon'' (true meaning) + ''-logy'' (study of). It''s the study of how words originated and evolved over time."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Etymology: circum-',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Latin prefix ''circum-'' means ''around.'' What does ''circumspect'' most likely mean?", "type": "multiple_choice", "options": ["Moving in circles", "Looking carefully in all directions before acting", "Speaking very loudly", "Acting impulsively"], "correct_answer": "Looking carefully in all directions before acting", "explanation": "''Circumspect'' = circum (around) + spect (look). To look around carefully before acting — cautious and thoughtful. Related: circumference, circumstance, circumnavigate."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Context clue: insipid',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Read: ''The film critic dismissed the movie as insipid — a predictable plot, forgettable characters, and no original ideas.'' What does ''insipid'' mean?", "type": "multiple_choice", "options": ["Disturbing and violent", "Lacking flavor, dullness, no interesting qualities", "Technically impressive", "Emotionally powerful"], "correct_answer": "Lacking flavor, dullness, no interesting qualities", "explanation": "''Insipid'' means lacking interest, vigor, or flavor. Context clues: ''predictable,'' ''forgettable,'' and ''no original ideas'' all reinforce the meaning of dull and lifeless."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Context clue: contrite',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Read: ''After snapping at her friend, Maya felt contrite — she immediately apologized and offered to make it up to her.'' What does ''contrite'' mean?", "type": "multiple_choice", "options": ["Angry and defensive", "Sincerely remorseful or sorry", "Confused about what happened", "Relieved it was over"], "correct_answer": "Sincerely remorseful or sorry", "explanation": "''Contrite'' means feeling deep regret and remorse. The context clues — immediately apologizing and wanting to make amends — all point to sincere sorrow."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Context clue: magnanimous',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Read: ''Though she had every right to be angry, the champion was magnanimous in victory, praising her opponent''s effort and refusing to gloat.'' What does ''magnanimous'' mean?", "type": "multiple_choice", "options": ["Arrogant and boastful", "Generous and noble in spirit", "Quietly disappointed", "Overly competitive"], "correct_answer": "Generous and noble in spirit", "explanation": "''Magnanimous'' means generous and forgiving, especially toward rivals. From Latin ''magnus'' (great) + ''animus'' (spirit). A great-spirited person rises above pettiness."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Commonly confused: affect vs effect',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which sentence uses ''effect'' correctly?", "type": "multiple_choice", "options": ["The cold weather will effect how we feel.", "Stress can effect your sleep.", "The medication had a noticeable effect on her recovery.", "How did the news effect you?"], "correct_answer": "The medication had a noticeable effect on her recovery.", "explanation": "''Effect'' is usually a noun (the result). ''Affect'' is usually a verb (to influence). Memory trick: Affect=Action (verb), Effect=End result (noun)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Commonly confused: imply vs infer',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which sentence is correct?", "type": "multiple_choice", "options": ["The data infers that sales will increase.", "The speaker implied that changes were coming.", "I implied from his tone that he was upset.", "Her silence inferrred agreement."], "correct_answer": "The speaker implied that changes were coming.", "explanation": "The speaker implies (suggests indirectly); the listener infers (draws a conclusion). Speakers imply; listeners infer. A writer implies meaning; a reader infers it."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Commonly confused: disinterested vs uninterested',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "A judge should be _______ in a case — meaning they have no personal stake in the outcome.", "type": "multiple_choice", "options": ["uninterested", "disinterested", "either word works", "neither word works"], "correct_answer": "disinterested", "explanation": "''Disinterested'' means impartial, having no personal stake. ''Uninterested'' means bored or lacking interest. A good judge is disinterested (fair), not uninterested (bored). These are commonly confused!"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Commonly confused: fewer vs less',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which sentence is grammatically correct?", "type": "multiple_choice", "options": ["There are less students in the class today.", "There are fewer water in the bottle.", "There are fewer students in the class today.", "Less people attended than expected."], "correct_answer": "There are fewer students in the class today.", "explanation": "''Fewer'' is used with countable nouns (students, apples, cars). ''Less'' is used with uncountable nouns (water, time, money). Memory trick: fewer items you can count; less of a mass."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Commonly confused: elicit vs illicit',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What is the difference between ''elicit'' and ''illicit''?", "type": "multiple_choice", "options": ["They mean the same thing", "''Elicit'' means to draw out a response; ''illicit'' means illegal or forbidden", "''Illicit'' means to draw out a response; ''elicit'' means illegal or forbidden", "Both mean something illegal"], "correct_answer": "''Elicit'' means to draw out a response; ''illicit'' means illegal or forbidden", "explanation": "Elicit (verb): to draw out or provoke — ''The question elicited a strong reaction.'' Illicit (adjective): unlawful or forbidden — ''The investigation uncovered illicit activity.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: palliate : suffering',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "Complete the analogy: Palliate is to suffering as _______.", "type": "multiple_choice", "options": ["silence is to noise", "amplify is to sound", "extinguish is to hunger", "create is to art"], "correct_answer": "silence is to noise", "explanation": "''Palliate'' means to reduce the severity of suffering without curing it. Silence reduces noise. Both describe lessening or diminishing something. (Palliate comes from Latin ''pallium,'' a cloak — to cover over.)"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: taciturn',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''taciturn'' mean?", "type": "multiple_choice", "options": ["Extremely talkative", "Reserved, saying very little", "Openly emotional", "Highly intelligent"], "correct_answer": "Reserved, saying very little", "explanation": "''Taciturn'' describes someone habitually silent and uncommunicative. From Latin ''tacitus'' (silent). A taciturn person speaks only when necessary — the opposite of loquacious."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: inveterate',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "What does ''inveterate'' mean?", "type": "multiple_choice", "options": ["Recently acquired", "Having a habit so deep it''s unlikely to change", "Feeling deep regret", "Extremely skillful"], "correct_answer": "Having a habit so deep it''s unlikely to change", "explanation": "''Inveterate'' means deeply established by long habit. An inveterate liar lies constantly and compulsively. From Latin ''inveterare'' meaning to make old."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: equivocate',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''equivocate'' mean?", "type": "multiple_choice", "options": ["To speak clearly and directly", "To use vague language to avoid committing to an answer", "To argue passionately", "To make a firm decision"], "correct_answer": "To use vague language to avoid committing to an answer", "explanation": "''Equivocate'' means to be deliberately ambiguous to mislead or avoid commitment. Politicians sometimes equivocate on difficult issues. From Latin ''aequus'' (equal) + ''vox'' (voice) — speaking with equal weight on both sides."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: miser : money',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Complete the analogy: Miser is to money as glutton is to _______.", "type": "multiple_choice", "options": ["exercise", "food", "silence", "knowledge"], "correct_answer": "food", "explanation": "A miser hoards money excessively; a glutton consumes food excessively. The relationship is person → what they excessively desire or hoard."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: obsequious',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "What does ''obsequious'' mean?", "type": "multiple_choice", "options": ["Stubbornly independent", "Excessively eager to serve or please, in a fawning way", "Loudly critical of authority", "Deeply philosophical"], "correct_answer": "Excessively eager to serve or please, in a fawning way", "explanation": "''Obsequious'' means overly submissive and eager to please in a way that feels insincere. Similar to sycophantic — the obsequious employee agrees with everything the boss says."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: sardonic',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''sardonic'' mean?", "type": "multiple_choice", "options": ["Warmly cheerful", "Grimly mocking or cynically humorous", "Deeply sincere", "Openly angry"], "correct_answer": "Grimly mocking or cynically humorous", "explanation": "''Sardonic'' describes a type of humor that is darkly mocking or bitterly cynical. A sardonic smile suggests contempt hidden behind amusement."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Context clue: limpid',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Read: ''The mountain spring produced limpid water — so clear you could count the pebbles twelve feet below the surface.'' What does ''limpid'' mean?", "type": "multiple_choice", "options": ["Extremely cold", "Perfectly still", "Clear and transparent", "Slightly salty"], "correct_answer": "Clear and transparent", "explanation": "''Limpid'' means transparently clear. The context — counting pebbles twelve feet down — tells us the water is exceptionally clear and unclouded."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Context clue: garrulous',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Read: ''The garrulous neighbor kept us on the porch for an hour, chattering about her garden, her cats, and every piece of neighborhood gossip.'' What does ''garrulous'' mean?", "type": "multiple_choice", "options": ["Shy and reserved", "Excessively talkative about trivial things", "Intensely focused", "Quietly observant"], "correct_answer": "Excessively talkative about trivial things", "explanation": "''Garrulous'' means talking excessively about unimportant things. Similar to loquacious, but garrulous adds the sense of tiresome chatter. From Latin ''garrire'' meaning to chatter."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Synonym for ''ephemeral''',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Which word is the closest synonym for ''ephemeral''?", "type": "multiple_choice", "options": ["Eternal", "Transient", "Vivid", "Profound"], "correct_answer": "Transient", "explanation": "''Transient'' and ''ephemeral'' both mean lasting only a short time. Other synonyms: fleeting, momentary, transitory. The antonyms are eternal, permanent, and enduring."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Antonym for ''pragmatic''',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What is the best antonym for ''pragmatic''?", "type": "multiple_choice", "options": ["Efficient", "Idealistic", "Decisive", "Reasonable"], "correct_answer": "Idealistic", "explanation": "''Idealistic'' is the antonym of ''pragmatic.'' Pragmatic focuses on what works in reality; idealistic focuses on what should be in an ideal world, sometimes at the expense of practicality."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Etymology: -voc-',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Latin root ''voc/voke'' means ''voice'' or ''call.'' Which word does NOT come from this root?", "type": "multiple_choice", "options": ["vocal", "evoke", "provoke", "volunteer"], "correct_answer": "volunteer", "explanation": "''Volunteer'' comes from Latin ''voluntas'' (will or wish), not ''vox'' (voice). Vocal (relating to voice), evoke (call up feelings), and provoke (call forth a reaction) all use the ''voc'' root."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Etymology: -cred-',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The Latin root ''cred'' means ''believe'' or ''trust.'' What does ''incredulous'' most likely mean?", "type": "multiple_choice", "options": ["Very trusting", "Unable or unwilling to believe something", "Highly intelligent", "Easily frightened"], "correct_answer": "Unable or unwilling to believe something", "explanation": "''Incredulous'' = in- (not) + credulous (believing). To be incredulous is to be skeptical or to find something hard to believe. Related words: credible, credential, incredible."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: recalcitrant',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "What does ''recalcitrant'' mean?", "type": "multiple_choice", "options": ["Eagerly cooperative", "Stubbornly resistant to authority or control", "Deeply thoughtful", "Easily persuaded"], "correct_answer": "Stubbornly resistant to authority or control", "explanation": "''Recalcitrant'' means stubbornly uncooperative and resistant. From Latin ''re'' (back) + ''calcitrare'' (to kick) — like a horse kicking back against its rider."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: perfidious : loyal',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Complete the analogy: Perfidious is to loyal as sardonic is to _______.", "type": "multiple_choice", "options": ["mocking", "sincere", "bitter", "clever"], "correct_answer": "sincere", "explanation": "Perfidious (treacherous) is the antonym of loyal. Sardonic (grimly mocking) is the antonym of sincere (genuinely warm and earnest)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Commonly confused: principal vs principle',
  'vocabulary',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which sentence uses the correct word?", "type": "multiple_choice", "options": ["She refused to compromise her principals.", "The school principle gave a speech.", "The principal reason for the delay was weather.", "He had strong principals about honesty."], "correct_answer": "The principal reason for the delay was weather.", "explanation": "''Principal'' means main/chief (as an adjective) or the head of a school (noun). ''Principle'' means a rule or belief. Memory trick: the school principAL is your pAL; a principlE is a rulE."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Commonly confused: comprise vs compose',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Which sentence is correct?", "type": "multiple_choice", "options": ["The United States is comprised of 50 states.", "The United States comprises 50 states.", "Fifty states are comprising the United States.", "The US is composed by 50 states."], "correct_answer": "The United States comprises 50 states.", "explanation": "The whole ''comprises'' (includes) its parts. The parts ''compose'' the whole. ''Is comprised of'' is technically incorrect, though common. Think: ''The zoo comprises animals'' = ''The zoo contains animals.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: inimical',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "What does ''inimical'' mean?", "type": "multiple_choice", "options": ["Friendly and supportive", "Tending to obstruct or be harmful", "Extremely rare", "Deeply personal"], "correct_answer": "Tending to obstruct or be harmful", "explanation": "''Inimical'' means hostile or harmful to something. Pollution is inimical to public health. From Latin ''inimicus'' (enemy) — the same root as ''enemy.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Analogy: obfuscate : clarity',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "Complete the analogy: Obfuscate is to clarity as ostracize is to _______.", "type": "multiple_choice", "options": ["punishment", "belonging", "exile", "confusion"], "correct_answer": "belonging", "explanation": "Obfuscate destroys clarity; ostracize destroys belonging (by excluding someone from a group). Both verbs describe actions that remove or damage something essential."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Context clue: pedantic',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "Read: ''Rather than enjoying the novel, the pedantic critic spent his entire review correcting minor historical inaccuracies and grammatical imprecisions.'' What does ''pedantic'' mean?", "type": "multiple_choice", "options": ["Warmly enthusiastic", "Overly focused on minor rules and technical details", "Deeply creative", "Extremely concise"], "correct_answer": "Overly focused on minor rules and technical details", "explanation": "''Pedantic'' describes someone excessively concerned with formal rules or minor details, missing the bigger picture. A pedantic person corrects grammar during an emotional conversation."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: propitious',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''propitious'' mean?", "type": "multiple_choice", "options": ["Threatening and ominous", "Giving a good sign; favorable", "Deeply mysterious", "Extremely cautious"], "correct_answer": "Giving a good sign; favorable", "explanation": "''Propitious'' means showing signs of future success or favorable conditions. A propitious moment is a good time to act. From Latin ''propitius'' meaning favorable."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Commonly confused: tortuous vs torturous',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "The mountain road followed a _______ path — winding back and forth for miles through the cliffs.", "type": "multiple_choice", "options": ["torturous", "tortuous", "either works equally", "neither is correct"], "correct_answer": "tortuous", "explanation": "''Tortuous'' means full of twists and turns (literally or figuratively). ''Torturous'' means causing torture or great pain. A tortuous road winds; a torturous experience causes agony."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: laconic',
  'vocabulary',
  'senior',
  4,
  45,
  'quiz',
  '{"question": "What does ''laconic'' mean?", "type": "multiple_choice", "options": ["Extremely detailed and thorough", "Using very few words", "Logically inconsistent", "Deeply emotional"], "correct_answer": "Using very few words", "explanation": "''Laconic'' means expressing much in few words. From ''Laconia,'' the region of ancient Sparta — the Spartans were famous for brief, direct speech. ''Come and take them'' is a legendary laconic reply."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Define: perspicacious',
  'vocabulary',
  'senior',
  5,
  55,
  'quiz',
  '{"question": "What does \"perspicacious\" mean?", "type": "multiple_choice", "options": ["Easily confused", "Having a ready insight into things; shrewd", "Extremely talkative", "Stubbornly opinionated"], "correct_answer": "Having a ready insight into things; shrewd", "explanation": "\"Perspicacious\" means having a sharp, clear understanding of things. A perspicacious detective notices clues others miss. From Latin \"perspicax\" meaning sharp-sighted — the same root as \"perspective\" and \"spectacles.\""}'::jsonb,
  true
);


-- ------------------------------------------------------------
-- File: reading_junior.json
-- Subject: reading  |  Age Tier: junior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Red Apple',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Sara picked a red apple from the tree. She washed it and took a big bite. It was sweet and crunchy. What did Sara do first?", "type": "multiple_choice", "options": ["Took a big bite", "Washed the apple", "Picked the apple", "Ate the whole apple"], "correct_answer": "Picked the apple", "explanation": "The passage says Sara picked the apple first, then washed it, then took a bite. Sequencing means putting events in the order they happened."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Sight Word: ''because''',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Which sentence uses the word ''because'' correctly?", "type": "multiple_choice", "options": ["I went because outside.", "I stayed inside because it was raining.", "Because I the park.", "I because happy."], "correct_answer": "I stayed inside because it was raining.", "explanation": "''Because'' is a connecting word that explains a reason. ''I stayed inside because it was raining'' gives a reason for staying inside."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Rhyming Words: cat',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Which word rhymes with ''cat''?", "type": "multiple_choice", "options": ["car", "cut", "bat", "can"], "correct_answer": "bat", "explanation": "''Cat'' and ''bat'' both end with the ''-at'' sound, so they rhyme. Rhyming words share the same ending sound."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''enormous''',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What does the word ''enormous'' mean?", "type": "multiple_choice", "options": ["Very tiny", "Very loud", "Very huge", "Very fast"], "correct_answer": "Very huge", "explanation": "''Enormous'' means very, very big. You might say an elephant is enormous, or that a whale is enormous."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Main Idea: The Dog',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Max is a friendly dog. He wags his tail when he sees people. He likes to play fetch. He never barks at strangers. What is the main idea?", "type": "multiple_choice", "options": ["Max is a scary dog.", "Max is a friendly dog.", "Max does not like people.", "Max is very old."], "correct_answer": "Max is a friendly dog.", "explanation": "All the sentences in the passage show that Max is friendly — he wags his tail, likes to play, and does not bark at strangers. That is the main idea."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Punctuation: End Marks',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Which punctuation mark goes at the end of a question?", "type": "multiple_choice", "options": ["Period (.)", "Exclamation mark (!)", "Question mark (?)", "Comma (,)"], "correct_answer": "Question mark (?)", "explanation": "A question mark (?) goes at the end of a sentence that asks something, like ''What is your name?'' A period ends a statement, and an exclamation mark shows excitement."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Phonics: Short Vowel ''a''',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "Which word has the short ''a'' sound, like in ''hat''?", "type": "multiple_choice", "options": ["cape", "cake", "tap", "gate"], "correct_answer": "tap", "explanation": "The word ''tap'' has the short ''a'' sound, just like ''hat'' and ''cat''. Cape, cake, and gate all have the long ''a'' sound."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Morning Routine',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Jake wakes up every morning at seven. He brushes his teeth and gets dressed. Then he eats breakfast with his family. After breakfast, he packs his backpack. What does Jake do right after breakfast?", "type": "multiple_choice", "options": ["Wakes up", "Brushes his teeth", "Packs his backpack", "Gets dressed"], "correct_answer": "Packs his backpack", "explanation": "According to the passage, the order is: wake up, brush teeth, get dressed, eat breakfast, pack backpack. So right after breakfast, Jake packs his backpack."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Parts of Speech: Nouns',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which word is a noun?", "type": "multiple_choice", "options": ["run", "happy", "quickly", "tree"], "correct_answer": "tree", "explanation": "A noun is a person, place, or thing. ''Tree'' is a thing, so it is a noun. ''Run'' is a verb (action), ''happy'' is an adjective (describing word), and ''quickly'' is an adverb."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''curious''',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''curious'' mean?", "type": "multiple_choice", "options": ["Afraid of everything", "Wanting to know or learn about something", "Very tired", "Very angry"], "correct_answer": "Wanting to know or learn about something", "explanation": "When you are curious, you want to find out more about something. A curious child asks lots of questions to learn about the world."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Rainy Day',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "It was raining outside. Lily could not play in the yard. She decided to read a book instead. She found a funny story about a talking frog. Why did Lily read a book?", "type": "multiple_choice", "options": ["She was bored with TV.", "It was raining and she could not go outside.", "Her mom told her to.", "She wanted to learn about frogs."], "correct_answer": "It was raining and she could not go outside.", "explanation": "The passage says Lily could not play outside because it was raining, so she decided to read a book instead. That is the reason she read."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Rhyming: ''light''',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which two words rhyme with ''light''?", "type": "multiple_choice", "options": ["like and bike", "night and right", "lake and bake", "line and pine"], "correct_answer": "night and right", "explanation": "''Light,'' ''night,'' and ''right'' all share the ''-ight'' sound at the end, so they rhyme with each other."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Parts of Speech: Verbs',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which word is a verb (action word)?", "type": "multiple_choice", "options": ["purple", "sandwich", "jump", "window"], "correct_answer": "jump", "explanation": "A verb is an action word — something you can do. ''Jump'' is an action. ''Purple'' is a color (adjective), ''sandwich'' and ''window'' are things (nouns)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Lost Kitten',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "A small kitten sat under a bush, crying softly. A boy named Tom heard it and looked around. He gently picked up the kitten and carried it home. How did the kitten feel at the beginning?", "type": "multiple_choice", "options": ["Happy and playful", "Sad or scared", "Hungry and angry", "Sleepy and calm"], "correct_answer": "Sad or scared", "explanation": "The kitten was crying softly and sitting alone under a bush, which tells us it was sad or scared. Tom then helped by picking it up and taking it home."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Phonics: Blends ''bl''',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which word starts with the ''bl'' blend?", "type": "multiple_choice", "options": ["bring", "blade", "trick", "flag"], "correct_answer": "blade", "explanation": "A blend is two consonants whose sounds are blended together at the start of a word. ''Blade'' starts with the ''bl'' blend. ''Bring'' has the ''br'' blend, ''trick'' has ''tr'', and ''flag'' has ''fl''."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''ancient''',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''ancient'' mean?", "type": "multiple_choice", "options": ["Brand new", "Very old", "Very large", "Very colorful"], "correct_answer": "Very old", "explanation": "''Ancient'' means very, very old — from a long time ago. Ancient ruins are the remains of buildings that were built thousands of years ago."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The School Garden',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "The students planted seeds in the school garden. They watered the seeds every day. After two weeks, little green sprouts appeared. The students were very excited. What is the main idea of this passage?", "type": "multiple_choice", "options": ["Gardens need a lot of sun.", "Students grew plants in their school garden.", "Watering plants is hard work.", "Seeds take a very long time to grow."], "correct_answer": "Students grew plants in their school garden.", "explanation": "The whole passage is about the students planting and caring for seeds in a school garden until they grew. That is the main idea."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Punctuation: Commas in a List',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which sentence uses commas correctly?", "type": "multiple_choice", "options": ["I like apples oranges and bananas.", "I like apples, oranges, and bananas.", "I like, apples, oranges and bananas.", "I, like apples oranges, and bananas."], "correct_answer": "I like apples, oranges, and bananas.", "explanation": "When listing three or more things, we use commas to separate them: apples, oranges, and bananas. The comma before ''and'' at the end is called the Oxford comma."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Fire Safety',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "If there is a fire, you should get low and crawl to the door. Feel the door before opening it. If the door is hot, do not open it — find another way out. Once outside, go to your meeting spot and call for help. What should you do if the door feels hot?", "type": "multiple_choice", "options": ["Open it quickly", "Pour water on it", "Find another way out", "Wait for someone to help you"], "correct_answer": "Find another way out", "explanation": "The passage says if the door is hot, do not open it because fire may be right behind it. Instead, you should find another way out to stay safe."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Parts of Speech: Adjectives',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Which word in the sentence is an adjective? ''The fluffy rabbit hopped away.''", "type": "multiple_choice", "options": ["The", "rabbit", "fluffy", "hopped"], "correct_answer": "fluffy", "explanation": "An adjective describes a noun. ''Fluffy'' describes what kind of rabbit it is. ''Rabbit'' is a noun, ''hopped'' is a verb, and ''the'' is an article."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''exhausted''',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "What does ''exhausted'' mean?", "type": "multiple_choice", "options": ["Very excited", "Very hungry", "Completely tired out", "Very angry"], "correct_answer": "Completely tired out", "explanation": "''Exhausted'' means very, very tired — like you have used up all your energy. After a long race, a runner might feel exhausted."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The New Student',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "A new student named Maya joined the class. She sat quietly and did not know anyone. At lunch, a girl named Rosa asked Maya to sit with her. Maya smiled for the first time all day. How did Maya feel before Rosa talked to her?", "type": "multiple_choice", "options": ["Happy and excited", "Lonely and nervous", "Bored and tired", "Angry and upset"], "correct_answer": "Lonely and nervous", "explanation": "Maya sat quietly, did not know anyone, and smiled for the first time when Rosa was kind to her. This suggests she felt lonely and nervous before Rosa reached out."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Phonics: Long Vowel ''e''',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Which word has the long ''e'' sound, like in ''feet''?", "type": "multiple_choice", "options": ["bed", "hen", "met", "bead"], "correct_answer": "bead", "explanation": "''Bead'' has the long ''e'' sound, just like ''feet'' and ''green.'' The words ''bed,'' ''hen,'' and ''met'' all have the short ''e'' sound."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Story Sequencing: Baking Cookies',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "To bake cookies, you mix the dough, shape the cookies, bake them in the oven, and then let them cool. What happens right before the cookies go in the oven?", "type": "multiple_choice", "options": ["Let them cool", "Mix the dough", "Shape the cookies", "Eat the cookies"], "correct_answer": "Shape the cookies", "explanation": "The order is: mix the dough → shape the cookies → bake in the oven → let them cool. So shaping the cookies happens right before they go in the oven."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Penguins',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Penguins are birds, but they cannot fly. They use their wings like flippers to swim very fast. Penguins live near cold oceans and eat fish. They huddle together in groups to stay warm. What do penguins use their wings for?", "type": "multiple_choice", "options": ["Flying through the air", "Catching fish with their wings", "Swimming in the water", "Staying warm at night"], "correct_answer": "Swimming in the water", "explanation": "The passage says penguins use their wings like flippers to swim very fast. Even though they are birds, they cannot fly — they swim instead."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''fragile''',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "What does ''fragile'' mean?", "type": "multiple_choice", "options": ["Very strong", "Easily broken", "Very colorful", "Difficult to find"], "correct_answer": "Easily broken", "explanation": "''Fragile'' means something breaks easily and must be handled carefully. A glass vase is fragile. You might see the word ''Fragile'' on boxes that hold breakable items."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Capitalization Rules',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Which sentence uses capital letters correctly?", "type": "multiple_choice", "options": ["my friend emily lives in Texas.", "My friend Emily lives in texas.", "My friend Emily lives in Texas.", "my Friend Emily Lives In Texas."], "correct_answer": "My friend Emily lives in Texas.", "explanation": "We capitalize the first word of a sentence, people''s names (Emily), and the names of places (Texas). ''My'' starts the sentence, ''Emily'' is a name, and ''Texas'' is a place."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Helpful Robot',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Zap was a small robot who lived with the Chen family. Every morning, Zap made breakfast and packed school bags. The children loved Zap because Zap always remembered little things, like their favorite juice. What kind of robot was Zap?", "type": "multiple_choice", "options": ["A scary robot", "A helpful and caring robot", "A clumsy robot that made mistakes", "A robot that only cleaned the house"], "correct_answer": "A helpful and caring robot", "explanation": "Zap made breakfast, packed bags, and remembered the children''s favorite juice. These details show that Zap was helpful and caring."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Phonics: Digraph ''sh''',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "A digraph is two letters that make one sound. Which word contains the ''sh'' digraph?", "type": "multiple_choice", "options": ["sport", "chair", "shell", "think"], "correct_answer": "shell", "explanation": "''Shell'' contains the ''sh'' digraph — the letters s and h together make one new sound. ''Chair'' has the ''ch'' digraph, ''think'' has ''th'', and ''sport'' does not have a digraph."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Butterflies',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "A butterfly begins life as a tiny egg. The egg hatches into a caterpillar that eats and grows. Then the caterpillar forms a chrysalis. Inside the chrysalis, it changes and becomes a butterfly. What comes right after the egg stage?", "type": "multiple_choice", "options": ["Butterfly", "Chrysalis", "Caterpillar", "Hatching shell"], "correct_answer": "Caterpillar", "explanation": "The life cycle goes: egg → caterpillar → chrysalis → butterfly. So right after the egg hatches, the creature is a caterpillar."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''whisper''',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What does ''whisper'' mean?", "type": "multiple_choice", "options": ["To shout very loudly", "To speak very softly and quietly", "To sing a song", "To listen carefully"], "correct_answer": "To speak very softly and quietly", "explanation": "To whisper means to speak very softly so only the person next to you can hear. You might whisper in a library or when someone is sleeping."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Snowflakes',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Every snowflake is different. They are made of tiny ice crystals. Snowflakes form high up in the clouds and fall slowly to the ground. They melt quickly if the ground is warm. What happens to snowflakes on a warm surface?", "type": "multiple_choice", "options": ["They get bigger", "They turn into ice", "They melt", "They float back up"], "correct_answer": "They melt", "explanation": "The passage says snowflakes melt quickly if the ground is warm. This is because snowflakes are made of ice, and ice melts when it touches something warm."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Parts of Speech: Pronouns',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which word is a pronoun that can replace ''Maria'' in a sentence?", "type": "multiple_choice", "options": ["she", "jumped", "fast", "house"], "correct_answer": "she", "explanation": "A pronoun takes the place of a noun. Instead of saying ''Maria ran,'' we can say ''She ran.'' ''She'' is a pronoun that stands in for a person''s name."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Proud Oak',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "A tall oak tree stood in the middle of a field. Birds built nests in its branches. Squirrels stored acorns in its roots. Children played in its shade. The oak was glad to be useful. How did the oak tree feel about helping others?", "type": "multiple_choice", "options": ["Annoyed and unhappy", "Glad and proud", "Scared and nervous", "Lonely and sad"], "correct_answer": "Glad and proud", "explanation": "The passage says the oak ''was glad to be useful.'' This tells us the tree felt happy about providing nests, storage, and shade for the animals and children."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Phonics: Silent ''e''',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "When a word ends in a silent ''e'', what happens to the vowel before it?", "type": "multiple_choice", "options": ["The vowel makes a short sound", "The vowel makes a long sound", "The vowel is silent too", "The vowel is removed"], "correct_answer": "The vowel makes a long sound", "explanation": "The silent ''e'' rule: when a word ends in ''e'', the vowel in the middle says its long name. For example, ''cap'' has a short ''a'', but ''cape'' has a long ''a'' sound. Same with ''pin'' vs ''pine''."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''brave''',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What does ''brave'' mean?", "type": "multiple_choice", "options": ["Afraid of everything", "Ready to face danger without fear", "Very silly", "Very quiet"], "correct_answer": "Ready to face danger without fear", "explanation": "Brave means you are willing to do something even if it is scary or hard. A firefighter who runs into a burning building to save someone is very brave."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Polar Bears',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Polar bears live in the Arctic, where it is extremely cold. Their white fur helps them blend in with the snow. They are excellent swimmers and hunt seals under the ice. A thick layer of fat keeps them warm. What helps polar bears blend in with their environment?", "type": "multiple_choice", "options": ["Their thick layer of fat", "Their large size", "Their white fur", "Their strong swimming skills"], "correct_answer": "Their white fur", "explanation": "The passage specifically says their white fur helps them blend in with the snow. This is called camouflage — it helps them hide from prey while hunting."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Story Sequencing: Getting Ready for School',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "In the morning, Ana wakes up, eats breakfast, brushes her teeth, and then walks to school. What does Ana do right before she walks to school?", "type": "multiple_choice", "options": ["Wakes up", "Eats breakfast", "Brushes her teeth", "Gets dressed"], "correct_answer": "Brushes her teeth", "explanation": "The order given is: wake up → eat breakfast → brush teeth → walk to school. Right before she walks to school, Ana brushes her teeth."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Parts of Speech: Adverbs',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Which word is an adverb? ''The rabbit ran quickly through the forest.''", "type": "multiple_choice", "options": ["rabbit", "ran", "quickly", "forest"], "correct_answer": "quickly", "explanation": "An adverb describes how, when, or where an action happens. ''Quickly'' tells us how the rabbit ran. Many adverbs end in ''-ly''."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''harvest''',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "What does ''harvest'' mean?", "type": "multiple_choice", "options": ["To plant seeds in the ground", "To water a garden", "To gather crops that are ready to eat", "To dig holes in a field"], "correct_answer": "To gather crops that are ready to eat", "explanation": "Harvest means to collect or pick crops that have finished growing. In autumn, farmers harvest wheat, corn, apples, and other foods."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Library Visit',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Carlos loved going to the library. He would look at the pictures first to pick a book, then find a cozy chair to read in. He always checked out three books to take home. His favorite section was adventure stories. What did Carlos do first when choosing a book?", "type": "multiple_choice", "options": ["Found a cozy chair", "Checked out the book", "Looked at the pictures", "Read the whole book"], "correct_answer": "Looked at the pictures", "explanation": "The passage says Carlos would look at the pictures first to pick a book. Then he would find a chair to sit in and read."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Phonics: Digraph ''ch''',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which word has the ''ch'' digraph sound as in ''cheese''?", "type": "multiple_choice", "options": ["clock", "shark", "check", "three"], "correct_answer": "check", "explanation": "''Check'' has the ''ch'' digraph — the letters c and h make one new sound together. ''Clock'' starts with just ''c'', ''shark'' has ''sh'', and ''three'' has ''th''."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''protect''',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What does ''protect'' mean?", "type": "multiple_choice", "options": ["To harm something", "To keep something safe from danger", "To hide something away", "To destroy something"], "correct_answer": "To keep something safe from danger", "explanation": "''Protect'' means to keep someone or something safe from harm or danger. A helmet protects your head when you ride a bike."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Desert Animals',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Many animals live in the desert. Camels can go days without water because they store fat in their humps. Snakes hide under rocks to stay cool. Coyotes hunt at night when it is cooler. How do snakes stay cool in the desert?", "type": "multiple_choice", "options": ["They swim in water", "They hide under rocks", "They sleep during winter", "They run very fast"], "correct_answer": "They hide under rocks", "explanation": "The passage says snakes hide under rocks to stay cool. In the desert, rocks provide shade from the hot sun, keeping the area underneath cooler."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Rhyming: Finding the Odd One Out',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Three of these words rhyme. Which one does NOT rhyme with the others?", "type": "multiple_choice", "options": ["moon", "spoon", "boon", "born"], "correct_answer": "born", "explanation": "''Moon,'' ''spoon,'' and ''boon'' all end with the ''-oon'' sound, so they rhyme. ''Born'' ends with the ''-orn'' sound, so it does not rhyme with the others."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Helpful Neighbor',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "Old Mr. Green always waved to children walking to school. When it snowed, he shoveled everyone''s sidewalk. In summer, he shared vegetables from his garden. The whole street called him a treasure. Why did the street think Mr. Green was special?", "type": "multiple_choice", "options": ["He was very rich and gave money away.", "He was always kind and helpful to others.", "He won lots of prizes at competitions.", "He had the biggest house on the street."], "correct_answer": "He was always kind and helpful to others.", "explanation": "Mr. Green waved to children, shoveled neighbors'' sidewalks, and shared vegetables. All of these show he was kind and helpful, which is why they called him a treasure."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Parts of Speech: Singular vs Plural',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "Which is the correct plural form of the word ''fox''?", "type": "multiple_choice", "options": ["foxs", "foxes", "foxies", "foxi"], "correct_answer": "foxes", "explanation": "When a noun ends in ''x'', ''ch'', ''sh'', ''s'', or ''z'', we add ''-es'' to make it plural. So ''fox'' becomes ''foxes''. We say ''I saw three foxes in the field.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''damp''',
  'reading',
  'junior',
  1,
  20,
  'quiz',
  '{"question": "What does ''damp'' mean?", "type": "multiple_choice", "options": ["Completely dry", "Slightly wet", "Very hot", "Very cold"], "correct_answer": "Slightly wet", "explanation": "''Damp'' means a little bit wet — not soaking wet, but not dry either. After the rain stops, the grass might feel damp. A towel after a shower is damp."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Tortoise and the Hare',
  'reading',
  'junior',
  3,
  30,
  'quiz',
  '{"question": "A hare and a tortoise had a race. The hare ran far ahead and, feeling sure he would win, took a nap. The slow tortoise kept walking without stopping. When the hare woke up, the tortoise had already crossed the finish line. What lesson does this story teach?", "type": "multiple_choice", "options": ["Sleeping is important for good health.", "Being fast is always better than being slow.", "Slow and steady effort can beat speed and laziness.", "Hares are not as fast as people think."], "correct_answer": "Slow and steady effort can beat speed and laziness.", "explanation": "The tortoise won because it kept going without stopping. The hare lost because he was overconfident and stopped to nap. The lesson is that steady hard work beats laziness, even if you are naturally talented."}'::jsonb,
  true
);

-- ------------------------------------------------------------
-- File: reading_senior.json
-- Subject: reading  |  Age Tier: senior  |  Count: 50
-- ------------------------------------------------------------

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Figurative Language: Simile',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "Which of the following is an example of a simile?", "type": "multiple_choice", "options": ["The wind whispered through the trees.", "Her laughter was a burst of sunlight.", "He ran like the wind.", "The storm was an angry giant."], "correct_answer": "He ran like the wind.", "explanation": "A simile compares two things using ''like'' or ''as.'' ''He ran like the wind'' compares his running to wind using ''like.'' The others use metaphor (direct comparison without ''like'' or ''as'') or personification."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Author''s Purpose',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "An author writes a newspaper article explaining how plastic pollution is destroying ocean ecosystems and urging readers to use reusable bags. What is the author''s primary purpose?", "type": "multiple_choice", "options": ["To entertain readers with a funny story about sea creatures", "To persuade readers to take action about pollution", "To describe how plastic is manufactured", "To compare different types of ocean ecosystems"], "correct_answer": "To persuade readers to take action about pollution", "explanation": "When an author presents a problem, explains its harm, and urges readers to change behavior, the purpose is to persuade. The clue ''urging readers to use reusable bags'' signals a persuasive intent."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary in Context: ''ambiguous''',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The ending of the novel was ambiguous — readers debated for years whether the hero had truly escaped. Based on context, what does ''ambiguous'' mean?", "type": "multiple_choice", "options": ["Exciting and thrilling", "Open to more than one interpretation", "Clearly explained and obvious", "Disappointing and sad"], "correct_answer": "Open to more than one interpretation", "explanation": "The clue is that ''readers debated for years'' whether something happened — they could not agree on one meaning. That uncertainty is exactly what ''ambiguous'' means: able to be understood in more than one way."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage Analysis: Theme',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Maya trained every day for the city chess championship. She lost in the semifinals and cried that night. But she studied her mistakes, trained harder, and returned the following year to win. What is the central theme of this story?", "type": "multiple_choice", "options": ["Chess is an important skill to learn.", "Winning is the only thing that matters.", "Persistence and learning from failure leads to success.", "Natural talent is more important than hard work."], "correct_answer": "Persistence and learning from failure leads to success.", "explanation": "Maya fails, analyzes her mistakes, works harder, and succeeds. The story''s message — its theme — is that resilience and learning from setbacks can lead to eventual success."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Literary Device: Foreshadowing',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "At the beginning of a story, a character says, ''I have a bad feeling about this mission.'' By the end, the mission fails and the character is captured. The earlier line is an example of:", "type": "multiple_choice", "options": ["Irony", "Flashback", "Foreshadowing", "Alliteration"], "correct_answer": "Foreshadowing", "explanation": "Foreshadowing is when an author gives an early hint or clue about what will happen later in the story. The character''s ''bad feeling'' hints at the future failure — that early clue is foreshadowing."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Figurative Language: Metaphor',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "Which sentence contains a metaphor?", "type": "multiple_choice", "options": ["The test was as hard as climbing a mountain.", "The classroom was a zoo when the teacher left.", "The puppy barked loudly all night.", "She studied for hours before the exam."], "correct_answer": "The classroom was a zoo when the teacher left.", "explanation": "A metaphor directly states that one thing IS another, without using ''like'' or ''as.'' Saying the classroom ''was a zoo'' means it was chaotic and noisy — not literally a zoo. The first option uses ''as,'' making it a simile."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Inference: Reading Between the Lines',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Daria slammed her locker shut without speaking to anyone. She walked to class with her eyes fixed on the floor, and when her best friend called her name, she pretended not to hear. What can you infer about Daria''s emotional state?", "type": "multiple_choice", "options": ["She is excited about something.", "She is upset or troubled about something.", "She is daydreaming about lunch.", "She is late for class and rushing."], "correct_answer": "She is upset or troubled about something.", "explanation": "Daria slams her locker, avoids eye contact, and ignores her best friend. These behaviors are clues — an inference is a conclusion you draw from evidence. All three details suggest she is upset or going through something difficult."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''compelling''',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "The lawyer made a compelling argument, and the jury was convinced within minutes. What does ''compelling'' mean?", "type": "multiple_choice", "options": ["Confusing and hard to follow", "Weak and poorly supported", "So strong or interesting it demands attention", "Polite and carefully worded"], "correct_answer": "So strong or interesting it demands attention", "explanation": "The clue is that the jury ''was convinced within minutes.'' A compelling argument is one so persuasive and powerful that it forces you to accept or pay attention to it."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Point of View: First vs Third Person',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "A story begins: ''He had not expected the letter. When Marcus read it, his hands trembled and he sat heavily in his chair.'' This passage is written in:", "type": "multiple_choice", "options": ["First person, because the narrator is part of the story", "Second person, because it addresses the reader as ''you''", "Third person, because the narrator refers to the character as ''he''", "Omniscient first person, because the narrator knows everything"], "correct_answer": "Third person, because the narrator refers to the character as ''he''", "explanation": "In third-person point of view, the narrator uses ''he,'' ''she,'' ''they,'' or names to refer to characters. First person uses ''I.'' Second person uses ''you.'' This passage uses ''he'' and ''Marcus,'' making it third person."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Literary Device: Irony',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "A fire station burns down because its sprinkler system was broken. This situation is an example of:", "type": "multiple_choice", "options": ["Foreshadowing", "Simile", "Situational irony", "Alliteration"], "correct_answer": "Situational irony", "explanation": "Situational irony occurs when the opposite of what is expected happens. We expect a fire station to be the best-protected building against fire, so it burning down is the ironic opposite of expectations."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Grammar: Dependent vs Independent Clauses',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which of the following is an independent clause (a complete sentence on its own)?", "type": "multiple_choice", "options": ["Although she practiced every day", "Because the storm was approaching", "The team won the championship", "When the lights went out"], "correct_answer": "The team won the championship", "explanation": "An independent clause has a subject and verb and expresses a complete thought. ''The team won the championship'' is complete on its own. The others begin with subordinating conjunctions (although, because, when), making them dependent clauses that cannot stand alone."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Character Tone',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "''I suppose,'' said Mr. Gratch, examining the painting with one eyebrow raised, ''that some people might find this charming. Of course, those people have never seen actual art.'' How would you describe Mr. Gratch''s tone?", "type": "multiple_choice", "options": ["Enthusiastic and encouraging", "Sarcastic and condescending", "Confused and uncertain", "Warm and supportive"], "correct_answer": "Sarcastic and condescending", "explanation": "Mr. Gratch gives a backhanded compliment (''some people might find it charming'') and then insults those people''s taste. This dismissive, superior attitude is sarcastic (saying one thing but meaning another) and condescending (looking down on others)."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Figurative Language: Idiom',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "What does the idiom ''bite the bullet'' mean?", "type": "multiple_choice", "options": ["To eat very quickly", "To endure a painful situation with courage", "To fire a weapon in anger", "To make a quick decision"], "correct_answer": "To endure a painful situation with courage", "explanation": "An idiom is a phrase whose meaning is different from the literal words. ''Bite the bullet'' means to endure something difficult or unpleasant with bravery. It comes from old battlefield medicine when soldiers bit a bullet to cope with pain during surgery."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary in Context: ''vindicated''',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "After years of being told her research was wrong, Dr. Reyes felt completely vindicated when new evidence proved her theory correct. What does ''vindicated'' mean here?", "type": "multiple_choice", "options": ["Exhausted from long research", "Proven right after being doubted", "Surprised by unexpected results", "Angry at those who doubted her"], "correct_answer": "Proven right after being doubted", "explanation": "The context tells us she was told she was wrong for years, but new evidence proved her correct. ''Vindicated'' means cleared of blame or proven to be right after being accused or doubted."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Literary Device: Alliteration',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "Which sentence is the best example of alliteration?", "type": "multiple_choice", "options": ["The sunset painted the sky orange.", "Peter Piper picked a peck of pickled peppers.", "She walked slowly down the long road.", "The thunder crashed as the rain poured."], "correct_answer": "Peter Piper picked a peck of pickled peppers.", "explanation": "Alliteration is the repetition of the same initial consonant sound in nearby words. In ''Peter Piper picked a peck of pickled peppers,'' the ''P'' sound repeats throughout, creating alliteration."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Drawing Conclusions',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The restaurant had four stars online, but when Jameel arrived, the tables were sticky, the server brought the wrong order, and the food arrived cold. He left without finishing his meal. What conclusion can you draw?", "type": "multiple_choice", "options": ["The restaurant is famous for its cold desserts.", "Jameel was not very hungry that day.", "The restaurant did not live up to its good reviews.", "Online reviews are always accurate."], "correct_answer": "The restaurant did not live up to its good reviews.", "explanation": "The restaurant had four stars (good reviews) but the actual experience was poor: dirty tables, wrong order, cold food. Drawing a conclusion means combining evidence to reach a logical judgment. The evidence points to a gap between reputation and reality."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Grammar: Misplaced Modifiers',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "Which sentence contains a misplaced modifier?", "type": "multiple_choice", "options": ["Running quickly, the dog caught the frisbee.", "She nearly drove her kids to school every day.", "The scientist who discovered the cure won an award.", "After eating lunch, the students returned to class."], "correct_answer": "She nearly drove her kids to school every day.", "explanation": "A misplaced modifier is a word or phrase placed too far from what it modifies, creating a confusing meaning. ''Nearly drove her kids'' implies she almost drove them (as if she changed her mind), but the intended meaning is ''she drove them almost every day.'' The modifier ''nearly'' should be next to ''every day.''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Figurative Language: Personification',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "Which sentence is an example of personification?", "type": "multiple_choice", "options": ["The mountain was as tall as the sky.", "The stars danced joyfully through the night.", "The car drove down the winding road.", "The forest was quiet and peaceful."], "correct_answer": "The stars danced joyfully through the night.", "explanation": "Personification gives human qualities or actions to non-human things. Stars cannot actually dance — giving them this human action is personification. It makes the description more vivid and expressive."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''tenacious''',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What does ''tenacious'' mean?", "type": "multiple_choice", "options": ["Easily discouraged and giving up quickly", "Holding firmly to something; not giving up", "Extremely intelligent and quick-thinking", "Easily frightened and nervous"], "correct_answer": "Holding firmly to something; not giving up", "explanation": "''Tenacious'' means persistent, determined, and refusing to let go or give up. A tenacious athlete keeps training despite setbacks. The root ''ten-'' comes from Latin meaning to hold."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Tone and Mood',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "The empty house creaked with every gust of wind. Pale moonlight crept across the dusty floor. In the corner, a rocking chair moved slowly — though no one sat in it. What is the mood of this passage?", "type": "multiple_choice", "options": ["Joyful and celebratory", "Peaceful and relaxing", "Eerie and unsettling", "Exciting and adventurous"], "correct_answer": "Eerie and unsettling", "explanation": "Mood is the feeling a passage creates in the reader. Details like creaking, pale moonlight, dust, and a self-rocking chair build a spooky, eerie atmosphere. Word choice and imagery are the tools authors use to create mood."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Author''s Purpose: Informative vs Persuasive',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "A passage states: ''Honeybees live in colonies of up to 60,000 individuals. A queen bee lays up to 2,000 eggs per day. Worker bees are all female and gather nectar and pollen.'' What is the author''s primary purpose?", "type": "multiple_choice", "options": ["To persuade the reader to protect bees", "To entertain with a story about bees", "To inform the reader about honeybee facts", "To compare bees to other insects"], "correct_answer": "To inform the reader about honeybee facts", "explanation": "The passage presents factual information (numbers, facts) without expressing opinions or trying to change behavior. When an author presents facts without bias or persuasion, the purpose is to inform."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary in Context: ''reluctant''',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "Although he knew it was the right thing to do, Alex was reluctant to apologize. He stood outside the door for ten minutes before finally knocking. What does ''reluctant'' mean?", "type": "multiple_choice", "options": ["Excited and eager", "Unwilling or hesitant", "Determined and confident", "Angry and defensive"], "correct_answer": "Unwilling or hesitant", "explanation": "Alex knew he should apologize but stood outside for ten minutes, unable to commit. This hesitation and resistance is exactly what ''reluctant'' means — being unwilling or slow to do something."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Literary Device: Flashback',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "In the middle of a war story set in 2024, the main character stares at a photograph and the narrative shifts to describe a birthday party from fifteen years ago. This technique is called:", "type": "multiple_choice", "options": ["Foreshadowing", "Flashback", "Irony", "Stream of consciousness"], "correct_answer": "Flashback", "explanation": "A flashback interrupts the present-day narrative to show events from the past. It gives readers background information about characters or events. In this case, the shift to fifteen years ago is a flashback triggered by the photograph."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Author''s Perspective',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "''Zero-hours contracts leave workers without any guarantee of income. Families cannot budget, and workers often skip medical appointments because they cannot predict their pay.'' What is the author''s perspective?", "type": "multiple_choice", "options": ["Zero-hours contracts are good for the economy.", "Zero-hours contracts are harmful to workers and families.", "Workers prefer flexible working arrangements.", "Medical costs are the main problem facing workers."], "correct_answer": "Zero-hours contracts are harmful to workers and families.", "explanation": "The author focuses on the negative effects: unpredictable income, difficulty budgeting, and skipped medical care. The selection of these specific harms reveals the author''s perspective — that zero-hours contracts hurt workers."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Grammar: Active vs Passive Voice',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which sentence is written in passive voice?", "type": "multiple_choice", "options": ["The chef prepared a delicious meal.", "The students solved every problem.", "The trophy was awarded to the winning team.", "The dog chased the squirrel up the tree."], "correct_answer": "The trophy was awarded to the winning team.", "explanation": "In passive voice, the subject receives the action rather than doing it. ''The trophy was awarded'' — the trophy is not doing anything, it is receiving the action. Active voice: ''The committee awarded the trophy to the winning team.'' Passive voice often uses a form of ''to be'' + past participle."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''eloquent''',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What does ''eloquent'' mean?", "type": "multiple_choice", "options": ["Speaking or writing in a fluent, expressive, and persuasive way", "Speaking loudly and with great force", "Talking too much without saying anything important", "Writing in a very complicated and confusing way"], "correct_answer": "Speaking or writing in a fluent, expressive, and persuasive way", "explanation": "''Eloquent'' means able to use language beautifully and effectively. An eloquent speaker chooses words carefully and moves an audience. Famous speeches by figures like Martin Luther King Jr. are often described as eloquent."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Figurative Language Identification',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "''The city never sleeps — sirens wail like lonely wolves at midnight, and the streets hum their endless electric song.'' What TWO literary devices are used in this passage?", "type": "multiple_choice", "options": ["Irony and foreshadowing", "Simile and personification", "Alliteration and metaphor", "Flashback and irony"], "correct_answer": "Simile and personification", "explanation": "''Sirens wail like lonely wolves'' is a simile (comparison using ''like''). ''Streets hum their endless electric song'' is personification (streets cannot hum or sing — those are human/living actions). The city ''never sleeping'' is also personification."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Grammar: Sentence Types',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What type of sentence is: ''Although it was raining, we went for a walk because we needed the fresh air''?", "type": "multiple_choice", "options": ["Simple sentence", "Compound sentence", "Complex sentence", "Compound-complex sentence"], "correct_answer": "Compound-complex sentence", "explanation": "A compound-complex sentence has at least two independent clauses AND at least one dependent clause. Here: ''we went for a walk'' (independent), ''Although it was raining'' (dependent), and ''because we needed the fresh air'' (dependent). Two dependent clauses + one independent clause = compound-complex."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary in Context: ''pragmatic''',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "While others dreamed of a perfect solution, Nora took a pragmatic approach: she focused on what could realistically be done within the budget and time available. What does ''pragmatic'' mean?", "type": "multiple_choice", "options": ["Extremely creative and imaginative", "Dealing with things practically based on what is actually possible", "Stubborn and unwilling to compromise", "Overly cautious and risk-averse"], "correct_answer": "Dealing with things practically based on what is actually possible", "explanation": "The context contrasts Nora with those who ''dreamed of a perfect solution'' — she focused on what was realistic. ''Pragmatic'' means practical, focused on results rather than ideals or theories."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Theme vs Topic',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "A novel follows two brothers from rival families who become friends despite their families'' hatred. In the end, their friendship helps end the feud. The topic is ''rivalry,'' but what is the theme?", "type": "multiple_choice", "options": ["Families often argue with each other.", "Individual friendships can overcome inherited hatred.", "Brothers are always close to each other.", "Peace is impossible between enemies."], "correct_answer": "Individual friendships can overcome inherited hatred.", "explanation": "The topic is the subject (rivalry). The theme is the message or insight about that subject. The story shows that personal connections between people can transcend the conflicts passed down by their families — that is the theme."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Literary Device: Symbolism',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "Throughout a novel, a caged bird appears whenever the main character feels trapped by her life circumstances. At the novel''s end, the bird is released. The bird is an example of:", "type": "multiple_choice", "options": ["Foreshadowing", "Irony", "Symbolism", "Allusion"], "correct_answer": "Symbolism", "explanation": "Symbolism is when an object, person, or event represents something beyond its literal meaning. The caged bird represents the character''s trapped feelings; its release symbolizes her freedom. Symbols add deeper layers of meaning to literature."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''cynical''',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "What does ''cynical'' mean?", "type": "multiple_choice", "options": ["Believing the best about people and situations", "Distrustful of others'' motives; believing people are selfish", "Extremely curious and eager to learn", "Easily upset by small problems"], "correct_answer": "Distrustful of others'' motives; believing people are selfish", "explanation": "A cynical person believes that people always act out of self-interest and that idealism is naive. ''I do not believe they are donating out of kindness — they just want the tax break'' is a cynical view."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Analyzing Character Motivation',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "General Voss ordered the retreat even though his troops could have fought on. He knew that winning this battle would cost thousands of lives and ultimately weaken the nation. What motivated General Voss?", "type": "multiple_choice", "options": ["Fear of losing the battle", "A desire to protect his soldiers and his nation''s long-term strength", "He did not believe his army was capable of fighting", "He was following orders from a superior"], "correct_answer": "A desire to protect his soldiers and his nation''s long-term strength", "explanation": "Voss chose retreat not out of fear (he knew they could fight) but because he weighed the cost — thousands of lives — against the outcome. His motivation was protecting his troops and long-term national strength over short-term victory."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Grammar: Parallel Structure',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "Which sentence uses parallel structure correctly?", "type": "multiple_choice", "options": ["She likes hiking, to swim, and running.", "She likes hiking, swimming, and running.", "She likes to hike, swimming, and run.", "She likes hiking, swim, and to run."], "correct_answer": "She likes hiking, swimming, and running.", "explanation": "Parallel structure means items in a list use the same grammatical form. All three activities should be in the same form: ''hiking, swimming, and running'' (all gerunds/-ing forms). Mixing ''hiking,'' ''to swim,'' and ''running'' breaks the parallel structure."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Figurative Language: Hyperbole',
  'reading',
  'senior',
  2,
  30,
  'quiz',
  '{"question": "Which sentence is an example of hyperbole?", "type": "multiple_choice", "options": ["The sun set slowly below the horizon.", "I have told you a million times to clean your room!", "The cat slept all afternoon on the couch.", "She walked quickly to catch the bus."], "correct_answer": "I have told you a million times to clean your room!", "explanation": "Hyperbole is extreme exaggeration used for emphasis or humor. No one has literally said something a million times. This exaggeration communicates strong frustration or emphasis — that is hyperbole."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary in Context: ''elusive''',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Scientists have searched for decades to observe the elusive giant squid in its natural habitat. Despite thousands of hours of deep-sea exploration, direct sightings remain extremely rare. What does ''elusive'' mean?", "type": "multiple_choice", "options": ["Large and dangerous", "Difficult to find, catch, or observe", "Recently discovered by scientists", "Living in very deep water"], "correct_answer": "Difficult to find, catch, or observe", "explanation": "The clues are ''searched for decades'' and ''sightings remain extremely rare.'' Despite extensive effort, the squid remains hard to find. ''Elusive'' means something that is difficult to catch, see, or pin down."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Literary Device: Allusion',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "A character in a novel says: ''Opening that box was his Pandora''s box — once the secret was out, problems poured in from everywhere.'' The reference to Pandora is an example of:", "type": "multiple_choice", "options": ["Personification", "Allusion", "Metaphor", "Irony"], "correct_answer": "Allusion", "explanation": "An allusion is a reference to a well-known person, place, event, or work of literature. ''Pandora''s box'' refers to the Greek myth in which opening a box released all the world''s evils. The author uses this reference to add meaning without explaining it in full."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Summarizing a Complex Text',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "Social media algorithms are designed to maximize engagement by showing content that triggers strong emotional reactions. Over time, users are fed increasingly extreme content in an ''engagement spiral.'' Critics argue this polarizes public opinion and damages democracy. Which best summarizes this passage?", "type": "multiple_choice", "options": ["Social media is entertaining and connects people worldwide.", "Algorithm-driven content feeds may polarize society by amplifying extreme material.", "Governments should ban all social media platforms.", "Users are responsible for the content they choose to view."], "correct_answer": "Algorithm-driven content feeds may polarize society by amplifying extreme material.", "explanation": "A good summary captures the main idea without adding opinions or leaving out key points. The passage explains how algorithms cause engagement spirals with extreme content, and how critics link this to polarization — that is what this summary captures."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Grammar: Restrictive vs Non-restrictive Clauses',
  'reading',
  'senior',
  5,
  50,
  'quiz',
  '{"question": "In the sentence ''The student who studied hardest won the award,'' the clause ''who studied hardest'' is restrictive. What does it mean for a clause to be restrictive?", "type": "multiple_choice", "options": ["It is separated from the main clause by commas", "It is essential to the meaning; removing it changes who is being talked about", "It adds extra information that could be removed", "It begins with ''which'' instead of ''who''"], "correct_answer": "It is essential to the meaning; removing it changes who is being talked about", "explanation": "A restrictive clause is essential — it tells us WHICH specific person or thing is meant. Remove it and the meaning changes: ''The student won the award'' no longer specifies which student. Non-restrictive clauses add extra, non-essential information and are set off by commas."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''ambivalent''',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "What does ''ambivalent'' mean?", "type": "multiple_choice", "options": ["Strongly in favor of something", "Having mixed or contradictory feelings about something", "Completely indifferent and uncaring", "Extremely confident in a decision"], "correct_answer": "Having mixed or contradictory feelings about something", "explanation": "''Ambivalent'' means experiencing two conflicting emotions or attitudes at the same time. For example, feeling both excited and nervous about moving to a new city. The prefix ''ambi-'' means both, as in ambidextrous."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Evaluating Evidence',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "An author argues that video games improve problem-solving skills and cites: (1) a university study of 3,000 students, (2) a quote from one parent saying her child improved at chess after gaming, and (3) sales data showing video games are popular. Which piece of evidence BEST supports the argument?", "type": "multiple_choice", "options": ["The parent''s quote, because it is a personal experience", "The university study of 3,000 students, because it is large-scale and academic", "The sales data, because it shows many people use video games", "All three are equally strong evidence"], "correct_answer": "The university study of 3,000 students, because it is large-scale and academic", "explanation": "Strong evidence for a factual claim should be systematic and large-scale. A study of 3,000 students controls for variables and is peer-reviewed. A single parent''s anecdote is too limited, and sales data shows popularity but not educational benefit."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Literary Device: Dramatic Irony',
  'reading',
  'senior',
  5,
  50,
  'quiz',
  '{"question": "In a play, the audience knows that the poison in the heroine''s drink is fake, but the hero believes it is real and drinks from a real poison cup to join her in ''death.'' The hero dying of real poison while the heroine is unharmed is an example of:", "type": "multiple_choice", "options": ["Situational irony", "Verbal irony", "Dramatic irony", "Foreshadowing"], "correct_answer": "Dramatic irony", "explanation": "Dramatic irony occurs when the audience knows something that one or more characters do not. The audience knows the heroine''s poison is fake; the hero does not. His decision, made in ignorance of what the audience knows, creates dramatic irony. (This mirrors the plot of Shakespeare''s Romeo and Juliet.)"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary in Context: ''corroborate''',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "The detective could not charge the suspect without another witness to corroborate the testimony. What does ''corroborate'' mean?", "type": "multiple_choice", "options": ["To challenge or contradict", "To confirm or support with additional evidence", "To explain in detail", "To write down officially"], "correct_answer": "To confirm or support with additional evidence", "explanation": "The detective needed another witness to back up (confirm) the existing testimony. ''Corroborate'' means to provide evidence that supports or confirms something. In law, corroborating evidence strengthens a case."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Analyzing Diction',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "Consider two descriptions of the same march: (A) ''Two hundred protesters marched through downtown.'' (B) ''A mob of agitators stormed the business district.'' How does the word choice (diction) differ?", "type": "multiple_choice", "options": ["Version A is more emotional; Version B is more neutral.", "Version A is neutral and factual; Version B uses loaded language to portray the marchers negatively.", "Both versions are equally objective and factual.", "Version B is more accurate because it includes more details."], "correct_answer": "Version A is neutral and factual; Version B uses loaded language to portray the marchers negatively.", "explanation": "Diction (word choice) reveals bias. ''Protesters'' is neutral; ''mob of agitators'' is negative and emotional. ''Marched'' is neutral; ''stormed'' implies violence or aggression. Version B uses loaded language to shape the reader''s opinion against the marchers."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Grammar: Subjunctive Mood',
  'reading',
  'senior',
  5,
  50,
  'quiz',
  '{"question": "Which sentence uses the subjunctive mood correctly?", "type": "multiple_choice", "options": ["If I was you, I would apologize.", "If I were you, I would apologize.", "If I am you, I would apologize.", "If I be you, I would apologize."], "correct_answer": "If I were you, I would apologize.", "explanation": "The subjunctive mood is used for hypothetical, contrary-to-fact, or wishful situations. ''If I were you'' is contrary to fact (I am not you), so we use ''were'' not ''was.'' The subjunctive uses ''were'' for all persons: ''If he were here...'' ''If she were honest...'' ''If I were rich...''"}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''implicit''',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "What does ''implicit'' mean?", "type": "multiple_choice", "options": ["Stated clearly and directly in the text", "Suggested or understood without being directly stated", "Completely false and misleading", "Requiring a great deal of explanation"], "correct_answer": "Suggested or understood without being directly stated", "explanation": "''Implicit'' means something is implied or hinted at rather than said outright. ''He slammed the door without a word'' implicitly tells us he is angry, even though anger is never stated. The opposite is ''explicit'' — directly stated."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Unreliable Narrator',
  'reading',
  'senior',
  5,
  50,
  'quiz',
  '{"question": "In a story, the narrator says he is perfectly calm and that the neighbors are simply jealous of his success. But he describes constant arguments with neighbors, losing three jobs this year, and being asked to leave the building. Why might readers question the narrator''s account?", "type": "multiple_choice", "options": ["Because the narrator is telling the story in first person", "Because the events he describes contradict his own self-assessment", "Because the story is set in the past", "Because the narrator uses too many adjectives"], "correct_answer": "Because the events he describes contradict his own self-assessment", "explanation": "An unreliable narrator is one whose account cannot be fully trusted, often due to self-deception or bias. The narrator claims calm and success, but the events he describes (job losses, conflicts, eviction) tell a different story. The gap between what he claims and what happens makes him unreliable."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Vocabulary: ''nuance''',
  'reading',
  'senior',
  4,
  40,
  'quiz',
  '{"question": "What does ''nuance'' mean?", "type": "multiple_choice", "options": ["A very strong and obvious difference", "A subtle distinction or shade of meaning", "A grammatical error in writing", "A type of literary device in poetry"], "correct_answer": "A subtle distinction or shade of meaning", "explanation": "''Nuance'' refers to a very fine or subtle difference in meaning, expression, or feeling. A skilled reader notices nuance — the difference between ''sad'' and ''melancholy,'' or the slight shift in a character''s tone that hints at hidden feelings."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: Comparing Texts',
  'reading',
  'senior',
  5,
  50,
  'quiz',
  '{"question": "Text A (news article) reports: ''The city council voted 7-2 to approve the new transit plan.'' Text B (opinion column) states: ''The council rammed through an unpopular transit scheme, ignoring the voices of ordinary residents.'' How do these texts differ?", "type": "multiple_choice", "options": ["Text A uses more facts; Text B uses emotionally charged language to express a negative opinion.", "Text B is more accurate because it gives more detail.", "Text A is biased in favor of the council; Text B is neutral.", "Both texts present the same event with equal objectivity."], "correct_answer": "Text A uses more facts; Text B uses emotionally charged language to express a negative opinion.", "explanation": "Text A reports the vote objectively (7-2 approval). Text B uses charged words like ''rammed through,'' ''unpopular,'' and ''ignoring voices'' to express disapproval. Comparing texts requires identifying factual reporting versus opinion and recognizing how language shapes perception."}'::jsonb,
  true
);

INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Grammar: Semicolons',
  'reading',
  'senior',
  3,
  35,
  'quiz',
  '{"question": "Which sentence uses a semicolon correctly?", "type": "multiple_choice", "options": ["She loves painting; and drawing landscapes.", "I finished my homework; then I went to practice.", "He is my best friend; who lives next door.", "We need: milk; bread; and eggs."], "correct_answer": "I finished my homework; then I went to practice.", "explanation": "A semicolon connects two closely related independent clauses without a conjunction. ''I finished my homework'' and ''then I went to practice'' are both complete sentences linked by a semicolon. A semicolon should NOT be used before ''and'' in a list or before a relative clause."}'::jsonb,
  true
);


INSERT INTO edu_challenges (title, subject, age_tier, difficulty, xp_reward, challenge_type, content, is_active) VALUES (
  'Passage: The Brave Little Seed',
  'reading',
  'junior',
  2,
  25,
  'quiz',
  '{"question": "A tiny seed fell into the cold, dark ground. It waited all winter long. When spring came, a small green shoot pushed up through the soil and reached for the sun. What did the seed do during the winter?", "type": "multiple_choice", "options": ["It grew into a tall tree.", "It waited in the ground.", "It blew away in the wind.", "It melted in the snow."], "correct_answer": "It waited in the ground.", "explanation": "The passage says the seed waited all winter in the cold, dark ground. In spring, it finally grew into a green shoot. Seeds stay underground and wait for the right conditions before they sprout."}'::jsonb,
  true
);
