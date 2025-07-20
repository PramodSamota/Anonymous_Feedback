import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";
import mongoose, { Types } from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  await dbConnect();

  // 1. Extract and validate messageId
  const { messageId } = params;
  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return Response.json(
      { success: false, message: "Invalid message ID format" },
      { status: 400 }
    );
  }

  // 2. Authentication check
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!user?._id || !session) {
    return Response.json(
      { success: false, message: "Unauthorized access" },
      { status: 401 }
    );
  }

  try {
    // 3. Convert IDs to ObjectId
    const userId = new Types.ObjectId(user._id);
    const msgId = new Types.ObjectId(messageId);

    // 4. Debugging: Log the IDs before query
    console.log(`Attempting to delete message ${msgId} for user ${userId}`);

    // 5. Execute deletion
    const updateResult = await UserModel.updateOne(
      {
        _id: userId,
        "messages._id": msgId, // Ensures the message belongs to user
      },
      { $pull: { messages: { _id: msgId } } }
    );

    // 6. Handle results
    if (updateResult.matchedCount === 0) {
      console.log("No user/message found matching criteria");
      return Response.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    if (updateResult.modifiedCount === 0) {
      console.log(
        "Message exists but wasn't deleted (possible data inconsistency)"
      );
      return Response.json(
        { success: false, message: "Message deletion failed" },
        { status: 500 }
      );
    }

    // 7. Success response
    return Response.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // 8. Detailed error handling
    console.error("Deletion error:", error);

    let errorMessage = "Internal server error";
    if (error instanceof mongoose.Error.CastError) {
      errorMessage = "Invalid ID format";
    } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
      errorMessage = "Document not found";
    }

    return Response.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
