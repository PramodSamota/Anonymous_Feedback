import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as User;
  console.log("user", user);
  if (!user || !session) {
    return Response.json(
      { success: false, message: "user is not logged in" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const existingUser = await UserModel.findById(userId);
    console.log("existingUser", existingUser);
    const user = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
          // Include other user fields you might need
          username: { $first: "$username" },
          email: { $first: "$email" },
        },
      },
    ]);

    console.log("user", user);
    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user[0].messages || user[0].messages.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User has no messages",
        },
        { status: 200 } // 200 because user exists, just no messages
      );
    }

    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error", error);
    return Response.json(
      {
        success: false,
        message: "Internal Error in fetchin message",
      },
      { status: 500 }
    );
  }
}
