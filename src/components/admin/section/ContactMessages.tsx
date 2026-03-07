import React, { useState, useEffect } from "react";
import {
  Check,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = Cookies.get("auth_token");
      const response = await fetch("/api/contact", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
      } else {
        toast.error("Failed to load messages");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      setLoading(false);
    }
  };

  const handleToggleStatus = async (message: ContactMessage): Promise<void> => {
    try {
      const newStatus = message.status === "unread" ? "read" : "unread";
      const token = Cookies.get("auth_token");
      const response = await fetch(`/api/contact`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: message._id, status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Message marked as ${newStatus}`);
        setMessages(messages.map(m => m._id === message._id ? { ...m, status: newStatus } : m));
        if (selectedMessage?._id === message._id) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteMessage = async (messageId: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const token = Cookies.get("auth_token");
      const response = await fetch(`/api/contact?id=${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Message deleted successfully");
        setMessages(messages.filter(m => m._id !== messageId));
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Contact Messages</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border bg-background rounded-md w-full md:w-64 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
            />
          </div>

          <button
            onClick={fetchMessages}
            className="flex items-center justify-center p-2 border border-border rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden h-[calc(100vh-250px)] flex flex-col">
          <div className="p-4 bg-muted/50 border-b border-border font-semibold text-md">
            Inbox ({messages?.filter(m => m?.status === 'unread').length} unread)
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredMessages?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No messages found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredMessages?.map((msg) => (
                  <button
                    key={msg?._id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.status === "unread") {
                        handleToggleStatus(msg);
                      }
                    }}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex flex-col gap-1 ${selectedMessage?._id === msg?._id ? 'bg-primary/5 border-l-2 border-primary' : ''
                      } ${msg?.status === 'unread' ? 'bg-card' : 'bg-muted/20 opacity-80'}`}
                    style={{ borderBottom: selectedMessage?._id === msg?._id ? "0px" : '' }}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-md font-semibold truncate ${msg?.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {msg?.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`text-sm font-medium truncate ${msg?.status === 'unread' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                      {msg?.subject}
                    </div>
                    <div className="text-sm font-normal text-muted-foreground truncate">
                      {msg?.message}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col h-[calc(100vh-250px)]">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg capitalize font-semibold text-foreground truncate">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="text-base font-medium text-foreground">{selectedMessage.name}</span>
                    <span className="text-sm truncate">&lt;{selectedMessage.email}&gt;</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(selectedMessage)}
                    className={`p-2 rounded-md border border-border transition-colors ${selectedMessage.status === 'unread' ? 'hover:bg-green-500/10 hover:text-green-600' : 'hover:bg-primary/10 hover:text-primary'
                      }`}
                    title={selectedMessage.status === 'unread' ? "Mark as Read" : "Mark as Unread"}
                  >
                    {selectedMessage.status === 'unread' ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="p-2 rounded-md border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-8 flex-1 overflow-y-auto whitespace-pre-wrap text-foreground leading-relaxed">
                {selectedMessage.message}
              </div>
              <div className="p-4 bg-muted/20 border-t border-border text-[10px] text-muted-foreground flex justify-between">
                <span>Received on: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                <span>ID: {selectedMessage._id}</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">Select a message to read</p>
              <p className="text-sm mt-1">Choose a message from the sidebar to view its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;
