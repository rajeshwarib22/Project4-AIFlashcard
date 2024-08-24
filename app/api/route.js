import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const systemPrompt =
  '\
You are a flashcard creator that takes in text and creates multiple flashcards from it. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines:\
\
1. Create clear and concise questions for the front of the flashcard.\
2. Provide accurate and informative answers for the back of the flashcard.\
3. Ensure that each flashcard focuses on a single concept or piece of information.\
4. Use simple language to make the flashcards accessible to a wide range of learners.\
5. Include a variety of question types, such as definitions, examples, comparisons, and applications.\
6. Avoid overly complex or ambiguous phrasing in both questions and answers.\
7. When appropriate, use mnemonics or memory aids to help reinforce the information.\
8. Tailor the difficulty level of the flashcards to the user\'s specified preferences.\
9. If given a body of text, extract the most important and relevant information for the flashcards.\
10. Only generate 10 flashcards.\
11. Identify what category each flashcard falls under. Each card can only have 1 category. The category can only be Math, Science, or History.\
\
Remember, the goal is to facilitate effective learning and retention of information through these flashcards.\
\
You should return in the following JSON format:\
{\
    "flashcards":[\
        {\
            "question": "Front of the card",\
            "answer": "Back of the card",\
            "category": "Category of the flashcard"\
        }\
    ]\
}';

export async function POST(req) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Your OpenAI API key
  });
  const openai = new OpenAIApi(configuration);
  const data = await req.text();

  const completion = await openai.createChatCompletion({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: data },
    ],
  });

  // Parse the JSON response from the OpenAI API
  const flashcards = JSON.parse(completion.data.choices[0].message.content);

  // Return the flashcards as a JSON response
  return NextResponse.json(flashcards.flashcards);
}
