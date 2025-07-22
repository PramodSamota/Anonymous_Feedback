"use client";

import MessageCard from "@/components/messageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message, User } from "@/models/User.model";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { data: session } = useSession();
  console.log("data", session);
  const form = useForm({ defaultValues: { acceptMessages: false } });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`/api/delete-message/${messageId}`);
      setMessages(messages.filter((message) => message._id !== messageId));
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete message");
    }
  };

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const res = await axios.get("/api/accept-messages");
      setValue("acceptMessages", res.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Fetch settings error:", axiosError);
      toast.error("Failed to fetch message settings");
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/get-messages");
      // console.log("res", res.data.messages);
      setMessages(res.data.messages || []);
      if (refresh) {
        toast.success("Messages refreshed");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Fetch messages error:", axiosError);
      toast.error("Error fetching messages");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSwitchChange = async () => {
    try {
      setIsSwitchLoading(true);
      const newValue = !acceptMessages;
      await axios.post("/api/accept-messages", {
        acceptMessages: newValue,
      });
      setValue("acceptMessages", newValue);
      toast.success(`Messages ${newValue ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update message settings");
    } finally {
      setIsSwitchLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchAcceptMessages();
    }
  }, [session, fetchMessages, fetchAcceptMessages]);

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Please login to view dashboard</p>
      </div>
    );
  }

  const { username } = session.user as User;
  const profileUrl = `${window.location.origin}/u/${username}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile URL copied to clipboard");
    } catch (err) {
      console.log("failed to copy URL", err);
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="flex-1 p-2 border rounded"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span>Accept Messages: {acceptMessages ? "On" : "Off"}</span>
        {isSwitchLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Messages</h2>
        <Button
          variant="outline"
          onClick={() => fetchMessages(true)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="text-gray-500">No messages to display</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
