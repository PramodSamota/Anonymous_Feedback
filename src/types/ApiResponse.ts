import { Message } from "@/models/User.model";
export interface ApiResponse {
        message:string;
        success:boolean;
        isAcceptingMessage?:boolean;
        messages?:Array<Message>;
}