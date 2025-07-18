import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import { EmailTemplate } from "@/components/email-template";
export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
):Promise<ApiResponse>{
   try {
    await resend.emails.send({       
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'verfication Email',
          react: EmailTemplate({ username,verifyCode }),
          })
        return {success:true,message:"verification email sent successfully"}

   } catch (error) {
    console.error("error sending verification email",error)
    return {success:false,message:"failed to send verification email"}
   }
}