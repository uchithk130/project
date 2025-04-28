'use client';
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ProctoringWidget from '../components/ProctoringWidget';
const MAX_QUESTIONS = 5;
const QUESTION_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  PROBLEM_SOLVING: 'problem_solving',
  CLOSING: 'closing'
};
 
export default function InterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const [conversation, setConversation] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewState, setInterviewState] = useState("not-started");
  const [isListening, setIsListening] = useState(false);
  const [progress, setProgress] = useState(0);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const endOfChatRef = useRef(null);
  const [applicationData, setApplicationData] = useState(null);
  const [matchStatus, setMatchStatus] = useState('');

  useEffect(() => {
    if (!applicationId) router.push("/");
    else fetchApplicationData();
  }, [applicationId, router]);

  const fetchApplicationData = async () => {
    try {
      const response = await fetch(`/api/getApplication?id=${applicationId}`);
      const data = await response.json();
      setApplicationData(data);
    } catch (error) {
      console.error("Error fetching application data:", error);
    }
  };

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => synthRef.current.cancel();
  }, []);

  const startInterview = async () => {
    try {
      setInterviewState("in-progress");
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          candidateId: applicationData?.candidate_id,
          jobId: applicationData?.job_id,
          candidateName: applicationData?.candidate_name,
          jobDescription: applicationData?.description,
          techStack: applicationData?.extracted_data?.extractedData?.Skills?.join(", "),
          questionCount: 0
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setCurrentQuestion({
        content: data.question,
        type: data.type,
        timestamp: new Date().toISOString()
      });
      setProgress(100 / MAX_QUESTIONS);
      speakQuestion(data.question);
    } catch (error) {
      console.error("Interview start failed:", error);
      alert("Failed to start interview: " + error.message);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      // Send the answer for evaluation
      const evaluationResponse = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastAnswer: answer,
          currentQuestion: currentQuestion.content
        }),
      });
      
      const evaluationData = await evaluationResponse.json();

      // Update conversation history with evaluation result
      const updatedConversation = [
        ...conversation,
        {
          question: currentQuestion,
          answer: answer,
          evaluation: evaluationData.evaluation
        }
      ];
      
      setConversation(updatedConversation);

      // Request the next question (if any)
      const nextQuestionResponse = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          conversationHistory: updatedConversation,
          questionCount: updatedConversation.length + 1,
          candidateName: applicationData?.candidate_name,
          candidateId: applicationData?.candidate_id,
          jobId: applicationData?.job_id
        }),
      });

      const nextQuestion = await nextQuestionResponse.json();
      
      // If the API indicates completion, show the closing message and then navigate after a delay.
      if (nextQuestion.completed) {
        setCurrentQuestion({
          content: nextQuestion.question,
          type: nextQuestion.type,
          timestamp: new Date().toISOString()
        });
        setProgress(100);
        speakQuestion(nextQuestion.question);
        // Wait a few seconds so the candidate sees the final evaluation before navigating.
        setTimeout(() => {
          router.push(`/results?id=${applicationId}`);
        }, 5000);
      } else {
        setCurrentQuestion({
          content: nextQuestion.question,
          type: nextQuestion.type,
          timestamp: new Date().toISOString()
        });
        setProgress(100 * (updatedConversation.length + 1) / MAX_QUESTIONS);
        speakQuestion(nextQuestion.question);
      }
    } catch (error) {
      console.error("Error processing response:", error);
      alert("Error submitting answer: " + error.message);
    }
  };

  const speakQuestion = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    synthRef.current.speak(utterance);
  };


  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported!");

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false; 
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentAnswer(transcript);
      handleAnswer(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  };


  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
       <ProctoringWidget setMatchStatus={setMatchStatus} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {applicationData?.candidate_name ? `${applicationData.candidate_name}'s Interview` : "Technical Interview"}
          </h1>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
            <span className="text-sm text-gray-600 mt-1 block">
              Question {Math.ceil(progress / (100 / MAX_QUESTIONS))} of {MAX_QUESTIONS}
            </span>
          </div>
        </div>

        {interviewState === "not-started" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={startInterview}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold
                       hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Interview
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {conversation.map((item, index) => (
                <div key={index} className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">Interviewer</span>
                      <span className="text-sm text-gray-500 capitalize">{item.question.type}</span>
                    </div>
                    <p className="text-gray-800">{item.question.content}</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg ml-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">Your Answer</span>
                      {item.evaluation && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                          Score: {item.evaluation.overall}/10
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 mb-2">{item.answer}</p>
                    {/* {item.evaluation && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-100">
                        <p className="text-sm text-yellow-800">{item.evaluation.feedback}</p>
                      </div>
                    )} */}
                  </div>
                </div>
              ))}

              {currentQuestion && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">Interviewer</span>
                    <span className="text-sm text-gray-500 capitalize">{currentQuestion.type}</span>
                  </div>
                  <p className="text-gray-800">{currentQuestion.content}</p>
                </div>
              )}

              <div ref={endOfChatRef} />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={startListening}
                disabled={isListening}
                className={`w-full py-4 rounded-lg font-medium transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isListening ? "Listening..." : "Press to Answer"}
              </button>
              {currentAnswer && (
                <p className="mt-4 text-gray-700 text-center italic animate-pulse">
                  {currentAnswer}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
