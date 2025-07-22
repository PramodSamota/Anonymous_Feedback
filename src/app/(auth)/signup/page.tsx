"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignUpSchema } from "@/schemas/SignUpSchema";
import axios, { AxiosError } from "axios";
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
import { Loader } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";
function SignUpPage() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 500);
  const router = useRouter();

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUserNameUnique = async () => {
      if (username) {
        setIsCheckingUsername(false);
        setUsernameMessage("");
        try {
          const res = await axios.get(
            `/api/check-username?username=${username}`
          );

          setUsernameMessage(res.data.message);
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.log(error.response?.data.message); // Server response (if any)
            setUsernameMessage(error.response?.data.message);
          } else if (error instanceof Error) {
            // Non-Axios error (e.g., network failure)
            console.log("Non-Axios error:", error.message);
          } else {
            console.log("Unknown error:", error);
          }
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUserNameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
    console.log("data", data);
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/signup", data);
      console.log("res", res.data);
      toast("SignUp successfully");
      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error("Error in Signup of user", error);
      const axisoError = error as AxiosError;
      console.log("axiosError", axisoError.response?.data);
    } finally {
      setIsSubmitting(false);
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
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader />}
                  <p
                    className={`text-sm ${usernameMessage === "username is available" ? "text-green-500" : "text-red-500"}`}
                  >
                    {usernameMessage}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> please wait
                </>
              ) : (
                "SingUp"
              )}
            </Button>
          </form>
        </Form>
        <div>
          <p>
            {" "}
            Already a member?{""}
            <Link href="/sing-in" className="text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
