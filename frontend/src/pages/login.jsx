import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "../lib/api-client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});
function Login() {
  const { login: setAuthToken } = useAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const onSubmit = (data) => {
    loginMutation.mutate({ data }, {
      onSuccess: (response) => {
        setAuthToken(response.token);
        toast.success("Welcome back!");
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast.error(error.data?.error || "Login failed. Please check your credentials.");
      }
    });
  };
  return <PublicLayout>
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <Card className="w-full max-w-md shadow-md border-border/50">
          <CardHeader className="space-y-3 text-center pb-8">
            <CardTitle className="text-4xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-lg">Sign in to your VillageConnect account</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium">Email</Label>
                <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    className="h-12 text-base"
    {...form.register("email")}
  />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-medium">Password</Label>
                <Input
    id="password"
    type="password"
    placeholder="Enter your password"
    className="h-12 text-base"
    {...form.register("password")}
  />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
    type="submit"
    className="w-full h-12 text-lg font-medium"
    disabled={loginMutation.isPending}
  >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center text-base text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PublicLayout>;
}
export {
  Login as default
};
