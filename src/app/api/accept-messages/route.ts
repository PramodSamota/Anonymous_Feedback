import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    console.log("user", user);
    if (!user || session) {
      return Response.json(
        { success: false, message: "user is not logged in" },
        { status: 401 }
      );
    }
    const { acceptingMessages } = await req.json();

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { isAcceptingMessage: acceptingMessages },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "user is failed" },
        { status: 401 }
      );
    }
    return Response.json(
      { success: true, message: "status changed successfully", updatedUser },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "user failed to change status of accepting messages",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    console.log("user", user);
    if (!user || session) {
      return Response.json(
        { success: false, message: "user is not logged in" },
        { status: 401 }
      );
    }

    const foundUser = await UserModel.findById(user._id);

    if (!foundUser) {
      return Response.json(
        { success: false, message: "user is failed" },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "status get successfully",
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "user failed to chake status of accepting messages",
      },
      { status: 500 }
    );
  }
}
