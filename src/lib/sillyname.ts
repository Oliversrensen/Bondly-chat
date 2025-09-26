const adjectives = [
  "Funky", "Wobbly", "Sleepy", "Zany", "Goofy",
  "Bouncy", "Cheeky", "Dizzy", "Clumsy", "Quirky"
];

const animals = [
  "Panda", "Banana", "Otter", "Sloth", "Koala",
  "Duck", "Penguin", "Giraffe", "Frog", "Llama"
];

export function generateSillyName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 100); // small random suffix
  return `${adj}${noun}${num}`;
}
