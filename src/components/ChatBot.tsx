import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, X, Minimize2, BotMessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  agencyData?: {
    dailyMetrics: {
      salesCount: number;
      revenue: number;
      profit: number;
      expenses: number;
      netProfit: number;
      date: string;
    };
    monthlyMetrics: {
      salesCount: number;
      revenue: number;
      profit: number;
      expenses: number;
      netProfit: number;
      month: number;
      year: number;
    };
    agentPerformance: Array<{
      name: string;
      salesCount: number;
      profit: number;
      profitPercentage: string;
      avgProfitPerSale: string;
    }>;
    serviceTypes: Array<{
      name: string;
      count: number;
      revenue: number;
      profit: number;
      avgTicket: string;
      profitMargin: string;
    }>;
    topServices: Array<{
      rank: number;
      type: string;
      count: number;
      totalProfit: number;
      profitPercentage: string;
    }>;
    systemBalances: Array<{
      system: string;
      balance: number;
      status: string;
    }>;
    bookingTypes: {
      flights: number;
      hotels: number;
      organizedTravel: number;
      total: number;
    };
    recentSales: Array<{
      id: number;
      type: string;
      client: string;
      agent: string;
      sellingPrice: number;
      profit: number;
      profitMargin: string;
      system: string;
      date: string;
      cashedIn: boolean;
    }>;
    kpis: {
      dailyProfitMargin: string;
      monthlyProfitMargin: string;
      avgDailySales: string;
      avgTicketDaily: string;
      avgTicketMonthly: string;
      topAgent: string | null;
    };
    unapprovedExpenses: {
      daily: number;
      monthly: number;
    };
  };
}

export const ChatBot: React.FC<ChatBotProps> = ({ agencyData }) => {
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant Business Analyst. Je peux vous aider à analyser vos données de vente et à vous fournir des insights utiles pour prendre de meilleures décisions. Que souhaitez-vous explorer ?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get recent conversation history (last 6 messages for context)
      const recentMessages = messages.slice(-6).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          message: inputValue,
          agencyData: agencyData,
          conversationHistory: recentMessages
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Only show ChatBot for managers and super_agents
  if (roleLoading) {
    return null; // Don't show anything while loading role
  }

  if (!userRole || (userRole !== 'manager' && userRole !== 'super_agent')) {
    return null; // Don't show ChatBot for other roles
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
      >
        <BotMessageSquare className="h-6 w-6 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-xl z-50 transition-all duration-200 ${
      isMinimized ? 'h-14' : 'h-[500px]'
    }`}>
      <CardHeader className="p-4 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5" />
            Business Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(500px-80px)]">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez moi des questions..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};