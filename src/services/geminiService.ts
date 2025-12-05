import OpenAI from 'openai';
import { Contact } from "../types";

// Get API key from environment variables
// Try OpenAI first, fallback to FastRouter
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const FASTROUTER_API_KEY = process.env.EXPO_PUBLIC_FASTROUTER_API_KEY;

let apiKey: string;
let baseURL: string | undefined;

if (OPENAI_API_KEY) {
  console.log('✅ Using OpenAI API key:', OPENAI_API_KEY.substring(0, 15) + '...');
  apiKey = OPENAI_API_KEY;
  baseURL = undefined; // Use default OpenAI endpoint
} else if (FASTROUTER_API_KEY) {
  console.log('✅ Using FastRouter API key:', FASTROUTER_API_KEY.substring(0, 10) + '...');
  apiKey = FASTROUTER_API_KEY;
  baseURL = 'https://go.fastrouter.ai/api/v1';
} else {
  console.error('⚠️ No API key found! Set EXPO_PUBLIC_OPENAI_API_KEY or EXPO_PUBLIC_FASTROUTER_API_KEY');
  apiKey = '';
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
  dangerouslyAllowBrowser: true,
});

// Primary model to use
const MODEL_NAME = OPENAI_API_KEY ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

// Fallback models if primary fails
const MODELS_TO_TRY = OPENAI_API_KEY ? [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo',
] : [
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'google/gemini-2.0-flash-exp',
  'google/gemini-1.5-flash',
  'anthropic/claude-3-5-sonnet-20241022'
];

export const extractContactFromImage = async (
  frontBase64: string,
  backBase64?: string
): Promise<Omit<Contact, 'id' | 'scannedAt' | 'frontImage' | 'backImage' | 'userId'>> => {
  const messages: any[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Extract contact info from this business card. Return ONLY JSON:
{"fullName":"","jobTitle":"","company":"","email":"","phone":"","website":"","address":""}`
        },
        {
          type: 'image_url',
          image_url: {
            url: frontBase64.startsWith('data:') ? frontBase64 : `data:image/jpeg;base64,${frontBase64}`
          }
        }
      ]
    }
  ];

  // Add back image if exists
  if (backBase64) {
    messages[0].content.push({
      type: 'image_url',
      image_url: {
        url: backBase64.startsWith('data:') ? backBase64 : `data:image/jpeg;base64,${backBase64}`
      }
    });
  }

  // Try each model until one works
  let lastError: any = null;

  for (const model of MODELS_TO_TRY) {
    try {
      console.log('Attempting to extract with model:', model);

      const completion = await openai.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0,
        max_tokens: 500,
        stream: false,
      });

      console.log('Success with model:', model);

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error("No response from AI");
      }

      console.log('Response text:', responseText);

      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Could not find JSON in response:", responseText);
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Parsed contact:', parsed);

      return parsed as Omit<Contact, 'id' | 'scannedAt' | 'frontImage' | 'backImage' | 'userId'>;
    } catch (e: any) {
      console.error(`Model ${model} failed:`, e.message);
      lastError = e;
      // Continue to next model
      continue;
    }
  }

  // All models failed
  console.error("All models failed. Last error:", lastError);
  throw new Error(lastError?.response?.data?.error?.message || lastError?.message || "Failed to extract contact info - all models unavailable");
};

// Helper function to clean LaTeX and markdown formatting
const cleanFormattedText = (text: string): string => {
  return text
    // Remove LaTeX math delimiters
    .replace(/\$\$([^$]+)\$\$/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    // Remove LaTeX commands
    .replace(/\\[a-zA-Z]+\{([^}]+)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    // Clean up markdown bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Clean up markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Clean up code blocks
    .replace(/```[a-z]*\n?/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const askAssistant = async (query: string, contacts: Contact[]): Promise<string> => {
  const contactContext = contacts.map(c => ({
    name: c.fullName,
    company: c.company,
    job: c.jobTitle,
    email: c.email,
    phone: c.phone,
    website: c.website,
    address: c.address,
    scannedDate: c.scannedAt,
    notes: c.rawText
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: `You are an intelligent business assistant with access to the user's contact database and the ability to search for information online.

**Contact Database** (${contacts.length} contacts):
${JSON.stringify(contactContext, null, 2)}

**Your Capabilities:**
1. Answer questions about the user's scanned contacts (names, companies, job titles, contact info, etc.)
2. Provide insights and analysis of their network (e.g., "Who works at X company?", "How many people from Y industry?")
3. For questions beyond the contact data, use your general knowledge and web search capabilities to provide accurate, up-to-date information
4. Help with business-related queries, industry information, company details, etc.

**IMPORTANT FORMATTING RULES:**
- Use PLAIN TEXT only - NO markdown, NO LaTeX, NO special formatting
- Use simple bullet points with dashes (-)
- Use simple numbering (1., 2., 3.)
- NO bold, italic, or code formatting
- NO mathematical notation or LaTeX syntax
- Write naturally as if texting a colleague

**Instructions:**
- When asked about contacts, search through the contact database provided
- For general knowledge questions, provide accurate information using web search if needed
- Be concise, helpful, and professional
- If you're not sure about contact data, acknowledge it
- For recent events or current information, indicate you're using web search capabilities`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const rawResponse = completion.choices[0].message.content || "I couldn't generate a response.";
    
    // Clean any formatting that might have slipped through
    return cleanFormattedText(rawResponse);
  } catch (e: any) {
    console.error("Failed to get assistant response", e);
    return "Sorry, I couldn't process your request. Please try again.";
  }
};

export const setApiKey = (key: string) => {
  // This would update the API key in a production app
  console.log("API key updated");
};
