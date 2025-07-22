"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Message } from "@/models/User.model";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns"; // For date formatting
import { useEffect } from "react";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/delete-message/${message._id}`);
      toast.success("Message deleted successfully");
      onMessageDelete(message._id);
    } catch (error) {
      toast.error("Failed to delete message");
      console.error("Delete error:", error);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Message</CardTitle>
            {message.createdAt && (
              <p className="text-sm text-gray-500">
                {format(new Date(message.createdAt), "MMM dd, yyyy h:mm a")}
              </p>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {/* {message.sender && (
          <p className="text-sm text-gray-500 mt-2">
            From: {message.sender.username || "Anonymous"}
          </p>
        )} */}
      </CardContent>
    </Card>
  );
}

export default MessageCard;
