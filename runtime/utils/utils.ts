export function estimateTokens(text: string): number {
    // Split text into words and punctuation
    const words = text.match(/\b\w+\b/g);
    const punctuations = text.match(/[^a-zA-Z0-9\s]/g);
    // Count newline tokens
    const newlines = (text.match(/\n/g) || []).length;
    
    // Count tokens, assuming one word/punctuation is one token
    const wordTokens = words ? words.length : 0;
    const punctuationTokens = punctuations ? punctuations.length : 0;
    
    // Return total estimated token count
    return wordTokens + punctuationTokens + newlines;
}

export function assertIsArray(value: any): asserts value is [] {
    if (!Array.isArray(value)) {
      throw new Error('Value is not an array');
    }
  }