import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface SignupForm {
  name: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  venmoHandle: string;
}

export default function Login({}: React.ComponentPropsWithoutRef<"div">) {
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupForm, setSignupForm] = useState<SignupForm>({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    venmoHandle: "",
  });

  const [err, showErr] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [errorType, setErrorType] = useState<string>(""); // Add this line
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      showErr(false);
      const user = res.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (e) {
      showErr(true);
    }
  }

  function handleSignupChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/register",
        signupForm
      );
      showErr(false);
      setErrorType("");
      const user = res.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (e: any) {
      showErr(true);
      if (e.response?.data?.error === "email already registered") {
        setErrorType("email");
        setActiveTab("login");
      } else if (e.response?.data?.error === "username already taken") {
        setErrorType("username");
      } else if (e.response?.data?.error === "must use .edu email") {
        setErrorType("edu");
      }
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        onChange={(e) => setLoginEmail(e.target.value)}
                        id="login-email"
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      {err && (
                        <p className="text-red-600 text-sm">
                          Incorrect Username or Password
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="text-2xl">Create Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup}>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "Name", name: "name", type: "text" },
                      { label: "Username", name: "username", type: "text" },
                      {
                        label: "Email",
                        name: "email",
                        type: "email",
                        placeholder: "m@example.com",
                      },
                      { label: "Password", name: "password", type: "password" },
                      {
                        label: "Phone",
                        name: "phone",
                        type: "tel",
                        placeholder: "919-123-4567",
                      },
                      {
                        label: "Venmo Handle",
                        name: "venmoHandle",
                        type: "text",
                        placeholder: "@username",
                      },
                    ].map((field) => (
                      <div key={field.name} className="grid gap-2">
                        <Label htmlFor={`signup-${field.name}`}>
                          {field.label}
                        </Label>
                        <Input
                          id={`signup-${field.name}`}
                          name={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={signupForm[field.name as keyof SignupForm]}
                          onChange={handleSignupChange}
                          required
                        />
                      </div>
                    ))}
                    {err && (
                      <p className="text-red-600 text-sm">
                        {errorType === "username"
                          ? "Username already taken"
                          : errorType === "email"
                          ? "Email already registered"
                          : errorType === "edu"
                          ? "Must use a .edu email address"
                          : "Error creating account"}
                      </p>
                    )}
                    <Button type="submit" className="w-full">
                      Sign Up
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
