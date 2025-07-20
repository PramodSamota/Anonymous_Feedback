import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { SignUpSchema, userNameSchema } from "@/schemas/SignUpSchema";
export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      username: searchParams.get("username"),
    };
    // console.log("queryParams", queryParams);
    //check zod schema
    const result = userNameSchema.safeParse(queryParams.username);
    console.log("result", result.error?.issues[0].message);

    if (!result.success) {
      return Response.json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    // const username = result.data?.username;
    const username = queryParams.username;
    console.log("username", username);
    const user = await UserModel.findOne({ username });
    if (user) {
      return Response.json(
        {
          success: false,
          message: "username already taken",
        },
        { status: 409 }
      );
    }

    console.log("user", user);
    return Response.json(
      { success: true, message: "username is available" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal Error In User-checking " },
      { status: 500 }
    );
  }
}
