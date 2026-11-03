// Original sample reflections, not Carla's final authored deck. Edit text here.
export const abundanceCards = [
  { id: 'opportunity', name: 'Opportunity', message: 'Recognize the value in what you already know.', action: 'Write down one skill you could turn into something useful.' },
  { id: 'own-voice', name: 'Your Own Voice', message: 'Your experience deserves a place in the conversation.', action: 'Name one choice you would make if you trusted your own perspective.' },
  { id: 'inherited-beliefs', name: 'A New Perspective', message: 'A belief you inherited does not have to define your next step.', action: 'Write one rule you learned about money or success. Ask whether it still serves you.' },
  { id: 'creative-potential', name: 'Creative Potential', message: 'Your curiosity can be the beginning of something meaningful.', action: 'Give one unfinished idea ten minutes of gentle attention.' },
  { id: 'contribution', name: 'Contribution', message: 'What feels ordinary to you may be useful to someone else.', action: 'Choose one small way to share what you know without overextending yourself.' },
  { id: 'small-step', name: 'One Small Step', message: 'You do not need the whole path to take a thoughtful step.', action: 'Choose one action you can finish today, and make it small enough to begin.' },
  { id: 'support', name: 'Receiving Support', message: 'Allowing support can be an act of trust, not a loss of independence.', action: 'Name one kind of help you need. Ask a trusted person whether they can offer it.' },
  { id: 'worth', name: 'Inherent Worth', message: 'Your worth is larger than a balance, a title, or a measure of success.', action: 'List three qualities you value in yourself that have nothing to do with money.' },
  { id: 'enough', name: 'Enough for Today', message: 'You may define enough in a way that honors your real life.', action: 'Describe what enough time, energy, or resources would look like for today.' },
  { id: 'boundaries', name: 'Room to Breathe', message: 'Protecting your energy makes room for what matters to you.', action: 'Choose one commitment to simplify, pause, or approach with a clearer boundary.' },
  { id: 'recognition', name: 'Quiet Progress', message: 'Small, steady efforts are worthy of recognition.', action: 'Notice one thing you have learned or completed this week. Let it count.' },
  { id: 'alignment', name: 'Alignment', message: 'Success can reflect your values rather than someone else’s expectations.', action: 'Name one value you want your next decision to honor.' },
];

export function shuffleDeck(cards, random = Math.random) {
  const result = [...cards];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}