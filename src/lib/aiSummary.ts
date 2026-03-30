export async function generateSummary(content: string): Promise<string> {
  const prompt = `Please provide a concise executive summary of the following note content in 2-3 sentences:\n\n${content}`;

  const response = await fetch('https://api.cohere.com/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'command',
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate summary');
  }

  const data = await response.json();
  return data.generations[0].text.trim();
}

export async function generateSummaryLocal(content: string): Promise<string> {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim());
  if (sentences.length === 0) return 'No content to summarize.';

  const keyLines = sentences.slice(0, Math.min(3, Math.ceil(sentences.length / 3)));
  return keyLines.map((s) => s.trim()).join('. ') + '.';
}
