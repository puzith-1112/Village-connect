import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "../lib/api-client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["villager", "provider"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  experience: z.string().optional()
});
function Register() {
  const { login: setAuthToken } = useAuth();
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      experience: "",
      role: "villager"
    }
  });
  const onSubmit = (data) => {
    registerMutation.mutate({ data }, {
      onSuccess: (response) => {
        setAuthToken(response.token);
        toast.success("Account created successfully!");
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast.error(error.data?.error || "Registration failed. Please try again.");
      }
    });
  };
  return <PublicLayout>
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <Card className="w-full max-w-md shadow-md border-border/50">
          <CardHeader className="space-y-3 text-center pb-8">
            <CardTitle className="text-4xl font-bold">Join VillageConnect</CardTitle>
            <CardDescription className="text-lg">Create an account to access community services</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                <Input
    id="name"
    placeholder="Enter your full name"
    className="h-12 text-base"
    {...form.register("name")}
  />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base font-medium">Phone</Label>
                  <Input id="phone" placeholder="Mobile number" className="h-12 text-base" {...form.register("phone")} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-base font-medium">City / Village</Label>
                  <Input id="city" placeholder="Village name" className="h-12 text-base" {...form.register("city")} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="state" className="text-base font-medium">State</Label>
                  <Input id="state" placeholder="State" className="h-12 text-base" {...form.register("state")} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="pincode" className="text-base font-medium">Pincode</Label>
                  <Input id="pincode" placeholder="Postal code" className="h-12 text-base" {...form.register("pincode")} />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-base font-medium">Address</Label>
                <Input id="address" placeholder="Street, locality, landmark" className="h-12 text-base" {...form.register("address")} />
              </div>

              <div className="space-y-3">
                <Label htmlFor="experience" className="text-base font-medium">Experience (optional)</Label>
                <Input id="experience" placeholder="Farming, tailoring, field work..." className="h-12 text-base" {...form.register("experience")} />
              </div>
              
              <div className="space-y-4 pt-2">
                <Label className="text-base font-medium">I am a...</Label>
                <RadioGroup
    defaultValue={form.getValues("role")}
    onValueChange={(val) => form.setValue("role", val)}
    className="flex flex-col space-y-3"
  >
                  <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="villager" id="role-villager" className="size-5" />
                    <Label htmlFor="role-villager" className="flex-1 cursor-pointer text-base font-medium">
                      Villager / Resident
                      <span className="block text-sm text-muted-foreground font-normal mt-1">I want to access services and information.</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="provider" id="role-provider" className="size-5" />
                    <Label htmlFor="role-provider" className="flex-1 cursor-pointer text-base font-medium">
                      Service Provider
                      <span className="block text-sm text-muted-foreground font-normal mt-1">I want to post jobs and offer services.</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
    type="submit"
    className="w-full h-12 text-lg font-medium"
    disabled={registerMutation.isPending}
  >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
              <div className="text-center text-base text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PublicLayout>;
}
export {
  Register as default
};
