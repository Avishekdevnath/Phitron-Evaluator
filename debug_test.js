const question = {
  id: '1',
  number: '1',
  title: 'Question',
  prompt: 'What is the meaning of life?',
  maxMarks: 10,
};

const block = {
  id: '1',
  type: 'paragraph',
  content: 'Random text that does not match the question',
  order: 0,
};

// Explicit match logic
const qNum = question.number.toLowerCase().trim();
console.log('Question number:', qNum);
console.log('Block type:', block.type);
console.log('Block content:', block.content);
console.log('Block is heading?', block.type === 'heading');

const content = block.content.toLowerCase().trim();
console.log('Content lowercase:', content);
console.log('Starts with qNum?', content.startsWith(qNum));
console.log('Includes "question 1"?', content.includes(`question ${qNum}`));

// Keyword extraction
const stopWords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
]);

const prompt = question.prompt;
const words = prompt.toLowerCase().split(/\W+/).filter(word => word.length > 3 && !stopWords.has(word));
console.log('Keywords:', [...new Set(words)].slice(0, 5));

const keywords = [...new Set(words)].slice(0, 5);
let score = 0;
for (const keyword of keywords) {
  if (content.includes(keyword.toLowerCase())) {
    console.log('Found keyword:', keyword);
    score += 1;
  }
}
console.log('Keyword score:', score, '/', keywords.length, '=', score / keywords.length, 'threshold: 0.5');
console.log('Meets 50% threshold?', score / keywords.length >= 0.5);
