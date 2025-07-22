"use client";

import { VerifySchema } from "@/schemas/VerifySchema";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader } from "lucide-react";
function VerifyAccount() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof VerifySchema>>({
    resolver: zodResolver(VerifySchema),
    defaultValues: {
      username: "",
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof VerifySchema>) => {
    try {
      setLoading(true);
      //   console.log("data", data.code);
      //   console.log("username", params.username);
      const response = await axios.post("/api/verify-code", {
        username: params.username,
        code: data.code,
      });
      console.log("res.data", response.data);
      toast("user is verified successfully");
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error in Signup of user", error);
      const axisoError = error as AxiosError;
      console.log("axiosError", axisoError.response?.data);
      toast("failed to verify user");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className=" w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className=" text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="cdde" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default VerifyAccount;
