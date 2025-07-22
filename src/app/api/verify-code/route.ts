import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { username, code: verifyCode } = await req.json();
    // console.log("req.json", verifyCode);
    // console.log("req.json", username);
    const user = await UserModel.findOne({ username });

    // console.log("user", user);
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User is not exist with this username",
        },
        { status: 404 }
      );
    }

    const isCodeValid = user?.verifyCode === verifyCode;
    const isCodeNotExpiry =
      user?.verifyCodeExpiry && new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpiry) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "user is verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          message: "the given code is wronge",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "the code is expired please signup again",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Verify-code is failded", error);
    return Response.json({
      success: false,
      message: "Verification code is failed",
    });
  }
}
