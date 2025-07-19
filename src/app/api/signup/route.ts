import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const reqBody = await req.json();
    const { username, email, password } = reqBody;

    const verifyCode = "1234";
    if (!username || !email || !password) {
      return Response.json({ message: "provide all the fields" });
    }

    const existingUserByUserName = await User.findOne({
      username,
      isVerified: true,
    });

    if (existingUserByUserName) {
      console.log("user is already persent");
      return Response.json(
        { success: false, message: "for this email user is already persent" },
        {
          status: 409,
        }
      );
    }

    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        console.log("user is already persent");
        return Response.json(
          { success: false, message: "for this email user is already persent" },
          {
            status: 409,
          }
        );
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const verifyExipry = new Date(Date.now() + 3600000);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: verifyExipry,
        isVerified: false,
        isAcceptingMessage: true,
      });

      if (!user) {
        console.log("user not created");
        return Response.json(
          { success: false, message: "SignUp is failed" },
          {
            status: 404,
          }
        );
      }
    }
    //email
    const emailResponse = await sendVerificationEmail(
      username,
      email,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        { message: emailResponse.message, success: false },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "user Signup successfully. please verify" },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("Signup Failed", error.message);
    return Response.json(
      { success: false, message: "failed to singup" },
      {
        status: 500,
      }
    );
  }
}
