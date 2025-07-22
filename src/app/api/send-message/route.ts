import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { Message } from "@/models/User.model";
export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();
  
  console.log('Received request:', { username, content });
  
  // Validate input
  if (!username || !content) {
    return Response.json(
      {
        success: false,
        message: "Username and content are required",
      },
      { status: 400 }
    );
  }
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not exist for this username",
        },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 }
      );
    }

    const newMessage = { content, createdAt: new Date() };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "message sent to user successfully",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("unexpeted error", error);
    return Response.json(
      {
        success: false,
        message: "Interal server Error",
      },
      { status: 500 }
    );
  }
}
