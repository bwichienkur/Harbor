export const quotes = [
  { text: 'Often the right path isn’t the easiest one.', author: 'Harbor' },
  { text: 'Focus is a muscle. Today is another rep.', author: 'Harbor' },
  { text: 'Small steps compound into remarkable days.', author: 'Harbor' },
  { text: 'Protect your attention like it’s your most valuable tool.', author: 'Harbor' },
  { text: 'Done is better than perfect when perfect never ships.', author: 'Harbor' },
  { text: 'A calm mind finishes more than a frantic one.', author: 'Harbor' },
  { text: 'You don’t need more time. You need clearer intent.', author: 'Harbor' },
  { text: 'Start before you feel ready. Momentum does the rest.', author: 'Harbor' },
  { text: 'Deep work is a gift you give your future self.', author: 'Harbor' },
  { text: 'Rest is part of the work, not a reward after it.', author: 'Harbor' },
  { text: 'One focused hour can outpace a scattered afternoon.', author: 'Harbor' },
  { text: 'Show up. Stay with it. Let the quiet do its work.', author: 'Harbor' },
]

export function quoteForToday(date = new Date()) {
  const day = Math.floor(date.getTime() / 86_400_000)
  return quotes[day % quotes.length]
}
