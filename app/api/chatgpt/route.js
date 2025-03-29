
import { NextResponse } from 'next/server';
import connection from '@/app/utils/db';

const MAX_QUESTIONS = 5;
const QUESTION_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  PROBLEM_SOLVING: 'problem_solving',
  CLOSING: 'closing'
};

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      conversationHistory = [],
      questionCount = 0,
      candidateName,
      applicationId,
      candidateId,
      jobId,
      lastAnswer,
      currentQuestion
    } = body;

    // If an answer is provided, evaluate it.
    if (lastAnswer && currentQuestion) {
      const evaluation = await evaluateAnswer(currentQuestion, lastAnswer);
      return NextResponse.json({ evaluation });
    }

    // If maximum questions have been reached, store results and return a closing message.
    if (questionCount > MAX_QUESTIONS) {
      await storeInterviewResults(body);
      return NextResponse.json({
        question: `Thank you for your time${candidateName ? `, ${candidateName}` : ''}! We will review your answers and update you soon.`,
        type: QUESTION_TYPES.CLOSING,
        completed: true
      });
    }

    // First question (introduction)
    if (questionCount === 0) {
      return NextResponse.json({
        question: candidateName 
          ? `Hello ${candidateName}! Please introduce yourself and tell us about your technical background.`
          : "Let's start with your introduction. Please tell us about yourself and your technical experience.",
        type: QUESTION_TYPES.BEHAVIORAL,
        completed: false
      });
    }

    // For subsequent questions, generate a question prompt.
    const questionPrompt = createQuestionPrompt(body, questionCount);
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: questionPrompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const gptData = await gptResponse.json();
    
    if (!gptResponse.ok || !gptData?.choices?.[0]?.message?.content) {
      throw new Error(gptData.error?.message || 'Failed to generate question');
    }

    const parsedQuestion = parseQuestion(gptData.choices[0].message.content);
    return NextResponse.json({
      ...parsedQuestion,
      completed: false
    });

  } catch (error) {
    console.error('Interview error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to process interview question',
      completed: false
    }, { status: 500 });
  }
}

async function evaluateAnswer(question, answer) {
  try {
    const evaluationPrompt = `Evaluate this interview answer in valid JSON format:
{
  "technicalKnowledge": <0-10>,
  "communicationClarity": <0-10>,
  "problemSolving": <0-10>,
  "overall": <0-10>,
  "feedback": "<constructive feedback>"
}

Question: ${question}
Answer: ${answer}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: evaluationPrompt }],
        temperature: 0.2,
        max_tokens: 300
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(data.choices[0].message.content);

    if (typeof result.technicalKnowledge !== 'number' || typeof result.feedback !== 'string') {
      throw new Error('Invalid evaluation format');
    }

    return result;

  } catch (error) {
    console.error('Evaluation error:', error);
    return {
      technicalKnowledge: 5,
      communicationClarity: 5,
      problemSolving: 5,
      overall: 5,
      feedback: `Evaluation failed: ${error.message} - Please try answering again.`
    };
  }
}

function createQuestionPrompt(data, count) {
  const questionTypes = Object.values(QUESTION_TYPES);
  // Cycle through question types (skipping CLOSING)
  const type = questionTypes[(count - 1) % (questionTypes.length - 1)];
  const context = `Job: ${data.jobDescription}\nSkills: ${data.techStack}\nPrevious answers: ${JSON.stringify(data.conversationHistory.slice(-2))}`;
  
  return `Generate a ${type} question about:\n${context}\nFormat: [${type.toUpperCase()}] Question text`;
}

function parseQuestion(text) {
  const match = text.match(/\[(\w+)\]\s*(.+)/);
  const validTypes = Object.keys(QUESTION_TYPES).map(t => t.toLowerCase());
  const questionType = match && validTypes.includes(match[1].toLowerCase())
    ? match[1].toLowerCase()
    : QUESTION_TYPES.TECHNICAL;

  return {
    question: match && match[2] ? match[2].trim() : text.trim(),
    type: questionType
  };
}

async function storeInterviewResults(data) {
  try {
    const interviewData = {
      applicationId: data.applicationId,
      candidateId: data.candidateId,
      jobId: data.jobId,
      conversation: data.conversationHistory,
      scores: {
        technical: averageScore(data.conversationHistory, 'technicalKnowledge'),
        behavioral: averageScore(data.conversationHistory, 'communicationClarity'),
        problemSolving: averageScore(data.conversationHistory, 'problemSolving')
      }
    };

    await connection.execute(
      `INSERT INTO interview 
       (application_id, candidate_id, job_id, details) 
       VALUES (?, ?, ?, ?)`,
      [data.applicationId, data.candidateId, data.jobId, JSON.stringify(interviewData)]
    );
  } catch (error) {
    console.error('Database storage error:', error);
    throw new Error('Failed to store interview results');
  }
}

function averageScore(conversation, field) {
  const scores = conversation
    .filter(c => c.evaluation && typeof c.evaluation[field] === 'number')
    .map(c => c.evaluation[field]);
    
  return scores.length > 0 
    ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
    : 0;
}
