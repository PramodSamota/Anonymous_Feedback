import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";
import mongoose, { Types } from "mongoose";
import { NextResponse } from "next/server";

interface DeleteResponse {
  success: boolean;
  message: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
): Promise<NextResponse<DeleteResponse>> {
  // Verify HTTP method
  if (request.method !== "DELETE") {
    return NextResponse.json(
      { success: false, message: "Method not allowed" },
      { status: 405 }
    );
  }

  await dbConnect();

  // 1. Extract and validate messageId
  const resolvedParams = await params;
  const messageId = resolvedParams.messageId?.trim();
  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return NextResponse.json(
      { success: false, message: "Invalid message ID format" },
      { status: 400 }
    );
  }

  // 2. Authentication check
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!user?._id || !session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access" },
      { status: 401 }
    );
  }

  try {
    // 3. Convert IDs to ObjectId
    const userId = new Types.ObjectId(user._id);
    const msgId = new Types.ObjectId(messageId);

    // 4. Execute deletion
    const updateResult = await UserModel.updateOne(
      {
        _id: userId,
        "messages._id": msgId,
      },
      { $pull: { messages: { _id: msgId } } }
    );

    // 5. Handle results
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Message deletion failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Deletion error:", error);

    let errorMessage = "Internal server error";
    if (error instanceof mongoose.Error.CastError) {
      errorMessage = "Invalid ID format";
    } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
      errorMessage = "Document not found";
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
