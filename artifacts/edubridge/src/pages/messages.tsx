import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useListConversations, getListConversationsQueryKey,
  useGetMessages, getGetMessagesQueryKey,
  useSendMessage,
  useStartConversation,
} from "@workspace/api-client-react";
import { Send, MessageSquare, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function Messages() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [firstMessage, setFirstMessage] = useState("");

  const conversations = useListConversations({ query: { queryKey: getListConversationsQueryKey() } });
  const messages = useGetMessages(activeConvId ?? 0, {
    query: { queryKey: getGetMessagesQueryKey(activeConvId ?? 0), enabled: !!activeConvId }
  });
  const sendMessage = useSendMessage();
  const startConversation = useStartConversation();

  const activeConv = conversations.data?.find(c => c.id === activeConvId);

  return (
    <Shell>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Conversation List */}
        <div className="w-72 shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">{lang === "ar" ? "الرسائل" : "Messages"}</h2>
            <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => setShowNew(v => !v)} data-testid="button-new-conversation">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {showNew && (
            <div className="bg-card border border-border/50 rounded-xl p-3 mb-3 space-y-2">
              <Input placeholder={lang === "ar" ? "معرف المستخدم" : "User ID"} value={recipientId} onChange={e => setRecipientId(e.target.value)} className="text-sm h-8" data-testid="input-recipient-id" />
              <Input placeholder={lang === "ar" ? "الرسالة الأولى" : "First message"} value={firstMessage} onChange={e => setFirstMessage(e.target.value)} className="text-sm h-8" data-testid="input-first-message" />
              <Button
                size="sm"
                className="w-full h-7 text-xs"
                disabled={!recipientId || !firstMessage || startConversation.isPending}
                onClick={() => {
                  if (!user) return;
                  startConversation.mutate({ data: { initiatorId: user.id, recipientId: parseInt(recipientId), firstMessage } }, {
                    onSuccess: (conv) => {
                      qc.invalidateQueries({ queryKey: getListConversationsQueryKey() });
                      setActiveConvId(conv.id);
                      setShowNew(false); setRecipientId(""); setFirstMessage("");
                    }
                  });
                }}
                data-testid="button-start-conversation"
              >
                {lang === "ar" ? "بدء محادثة" : "Start Chat"}
              </Button>
            </div>
          )}

          <div className="flex-1 space-y-1 overflow-y-auto">
            {conversations.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />)}
              </div>
            ) : !conversations.data?.length ? (
              <div className="text-center py-12">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد محادثات" : "No conversations"}</p>
              </div>
            ) : (
              conversations.data.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-start p-3 rounded-xl transition-colors ${activeConvId === conv.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40"}`}
                  data-testid={`conversation-item-${conv.id}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {conv.participantNames[0]?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{conv.participantNames.join(", ")}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">{conv.unreadCount}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden">
          {!activeConvId ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageSquare className="w-14 h-14 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">{lang === "ar" ? "اختر محادثة للبدء" : "Select a conversation to start"}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {activeConv?.participantNames[0]?.[0] ?? "?"}
                </div>
                <span className="font-medium">{activeConv?.participantNames.join(", ")}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted/30 rounded-xl animate-pulse w-3/4" />)}
                  </div>
                ) : messages.data?.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        {msg.body}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-border/30 flex gap-2">
                <Input
                  value={messageBody}
                  onChange={e => setMessageBody(e.target.value)}
                  placeholder={lang === "ar" ? "اكتب رسالتك..." : "Type a message..."}
                  className="flex-1"
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (messageBody.trim() && user) { sendMessage.mutate({ conversationId: activeConvId, data: { senderId: user.id, body: messageBody } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetMessagesQueryKey(activeConvId) }); setMessageBody(""); } }); } }
                  }}
                  data-testid="input-message"
                />
                <Button
                  size="icon"
                  disabled={!messageBody.trim() || sendMessage.isPending}
                  onClick={() => {
                    if (!messageBody.trim() || !user) return;
                    sendMessage.mutate({ conversationId: activeConvId, data: { senderId: user.id, body: messageBody } }, {
                      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetMessagesQueryKey(activeConvId) }); setMessageBody(""); }
                    });
                  }}
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
