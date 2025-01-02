import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Send, BookOpen } from "lucide-react";
import axios from "axios";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChatThread, Message, User } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";

export default function Chat() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;
    setUser(JSON.parse(user));
  }, []);

  if (!user)
    return (
      <div className="h-screen w-screen flex-1 flex items-center justify-center text-muted-foreground">
        Log in to start chatting
      </div>
    );
  return <ChatInterface user={user} />;
}

interface ChatInterfaceProps {
  user: User;
}

function ChatInterface({ user }: ChatInterfaceProps) {
  const [searchParams] = useSearchParams();
  const threadParam = searchParams.get("thread");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const fetchThreads = async () => {
    const { data } = await axios.get<ChatThread[]>(
      `${import.meta.env.VITE_API_ENDPOINT}/api/chat/threads/${user.id}`
    );
    setThreads(data);

    // If there's a thread ID in the URL and we haven't selected a thread yet
    if (threadParam && !selectedThread) {
      const thread = data.find((t) => t.id === threadParam);
      if (thread) {
        setSelectedThread(thread);
      }
    }
  };

  const fetchMessages = async (threadId: string) => {
    const { data } = await axios.get<Message[]>(
      `${
        import.meta.env.VITE_API_ENDPOINT
      }/api/chat/threads/${threadId}/messages/${user.id}`
    );
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    await axios.post(
      `${import.meta.env.VITE_API_ENDPOINT}/api/chat/threads/${
        selectedThread.id
      }/messages/${user.id}`,
      {
        text: newMessage,
      }
    );

    setNewMessage("");
    fetchMessages(selectedThread.id);
  };

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 60000);
    return () => clearInterval(interval);
  }, [threadParam]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
      const interval = setInterval(
        () => fetchMessages(selectedThread.id),
        60000
      );
      return () => clearInterval(interval);
    }
  }, [selectedThread]);

  return (
    <div className="h-screen max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-6rem)]">
        <div className="col-span-4 space-y-4 overflow-y-auto">
          {threads.map((thread) => (
            <Card
              key={thread.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedThread?.id === thread.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedThread(thread)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {thread.listing.title}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  ${thread.listing.price} • {thread.listing.condition}
                </div>
                {thread.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {thread.lastMessage.text}
                  </p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="col-span-8 flex flex-col">
          {selectedThread ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] min-w-[40%] rounded-xl p-3 ${
                        message.senderId === user.id
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      }`}
                    >
                      <p>{message.text}</p>
                      <span className="text-xs opacity-70">
                        {format(new Date(message.createdAt), "p")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
