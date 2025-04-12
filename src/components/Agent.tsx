"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { interviewer, vapi } from "@/lib/vapi";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

export const Agent = ({ username, id, questions ,interviewId }: AgentProps) => {
  console.log("Questions",interviewId)
  const router = useRouter();

  enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
  }

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessaged[]>([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.error("error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);
useEffect(() => {
  const generateFeedback = async () => {
    if (!interviewId) {
      console.error("interviewId is null or undefined.");
      return;
    }

    try {
    const response = await axios.post(`${BACKEND_URL}/api/feedback`, {
      interviewId,
      userId: id || "", 
      transcript: messages,  
    });
      const { success, feedBackId } = response.data;


      if (success && feedBackId) {
        router.push(`/Interview/feedback/${interviewId}`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      router.push("/");
    }
  };

  if (callStatus === CallStatus.FINISHED) {
    toast.success("Your call has ended");
    generateFeedback();
  }
}, [callStatus, interviewId, id, messages, router]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    console.log(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!)
    try {
       let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }
      if (!questions) {
        toast.success("No Question found")
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
          username:username
        }
      })
    } catch (err) {
      console.error("Failed to start call:", err);
      toast.error("An error Accoured while taking interview")
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    try {
      await vapi.stop();
    } catch (err) {
      console.error("Failed to stop call:", err);
    }
  };

  

  const lastMessage = messages[messages.length - 1]?.content;

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4">
        {/* AI Avatar */}
        <div className="flex flex-col items-center justify-center w-64 h-64 p-4 bg-gray-400 dark:bg-gray-800 rounded-xl shadow-md">
          <div className="relative flex items-center justify-center w-24 h-24 bg-blue-500 rounded-full overflow-hidden">
            <Image
              src="/ai-avatar.png"
              alt="AI Avatar"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
            {isSpeaking && (
              <span className="absolute w-4/5 h-4/5 rounded-full bg-blue-300 opacity-75 animate-ping" />
            )}
          </div>
          <h1 className="mt-6 font-bold text-gray-900 dark:text-white">AI Interviewer</h1>
        </div>

        {/* User Avatar */}
        <div className="flex flex-col items-center justify-center w-64 h-64 p-4 bg-gray-400 dark:bg-gray-900 rounded-xl shadow-md">
          <div className="flex items-center justify-center w-24 h-24 bg-blue-500 rounded-full overflow-hidden">
            <Image
              src="/user-avatar.png"
              alt="User Avatar"
              width={90}
              height={90}
              className="rounded object-cover"
            />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">You</p>
        </div>

        {/* Message Display */}
        {messages.length > 0 && (
          <div className="border border-gray-400 p-2 rounded-2xl w-full">
            <div className="rounded-2xl min-h-12 px-5 py-3 flex items-center justify-center">
              <p key={lastMessage} className="transition-opacity duration-500">
                {lastMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Call Button */}
      <div className="w-full flex justify-center mt-8">
        <Button
          onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
          disabled={callStatus === CallStatus.CONNECTING}
        >
          {callStatus === CallStatus.ACTIVE
            ? "End Call"
            : callStatus === CallStatus.CONNECTING
            ? "Connecting..."
            : "Call"}
        </Button>
      </div>
    </>
  );
};
