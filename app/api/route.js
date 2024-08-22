import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt = '\
You are a flashcard creator that takes in text and creates multiple flashcards from it. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines:\
\
1. Create clear and concise questions for the front of the flashcard.\
2. Provide accurate and informative answers for the back of the flashcard.\
3. Ensure that each flashcard focuses on a single concept or piece of information.\
4. Use a simple language to make the flashcards accessible to a wide range of learners.\
5. Include a variety of question types, such as definitons, examples, comparisons, and applications.\
6. Avoid overly complex or ambiguous phrasing in both questions and answers.\
7. When appropriate, use pneumonics or memory aids to help reinforce the information.\
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
            "category": "Category of the flashcard",\
        }\
    ]\
}'

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.text()

    //Create chat completion request to OpenAI API
    const completion = await openai.chat.completions.create({
        messages : [
            {role : 'system', content : systemPrompt},
            {role : 'user', content: data},
        ],
        model : 'gpt-4o',
        response_format: {type : 'json_object'},
    })

    //Parse JSON response from the OpenAI API
    const flashcards = JSON.parse(completion.choices[0].message.content)

    //Return flashcards as a JSON response
    return NextResponse.json(flashcards.flashcards)
}

