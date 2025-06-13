"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendPinWhatsApp } from "@/lib/whatsapp/sendPin";

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [dialCode, setDialCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Puedes omitir emailRedirectTo si no usas confirmación por correo
          data: {
            phone: `${dialCode}${phone}`,
          },
        },
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("No user ID returned");

      // 1. Genera el PIN
      const pin = generatePin();

      // 2. Guarda el PIN y el teléfono en la tabla profiles
      const { error: profileError } = await supabase.from("profiles").insert([
        { id: userId, pin, phone: `${dialCode}${phone}` },
      ]);
      if (profileError) throw profileError;

      // 3. Envía el PIN por WhatsApp
      await sendPinWhatsApp({
        phone: `${dialCode}${phone}`,
        pin,
      });

      // 4. Muestra el popup del PIN
      setShowPinPopup(true);

      // router.push("/auth/sign-up-success"); // Opcional, si quieres redirigir
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dialCode">Indicativo país</Label>
                <Input
                  id="dialCode"
                  placeholder="+34"
                  required
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Número de teléfono</Label>
                <Input
                  id="phone"
                  placeholder="612345678"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      {showPinPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-4">
            <h2 className="text-lg font-bold">
              Ingresa el PIN enviado a tu WhatsApp
            </h2>
            <Input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN de 6 dígitos"
            />
            <Button
              onClick={async () => {
                setIsLoading(true);
                const supabase = createClient();
                // Get the current user ID from the session
                const {
                  data: { user },
                  error: userError,
                } = await supabase.auth.getUser();
                if (userError || !user) {
                  setIsLoading(false);
                  setError("No se pudo obtener el usuario.");
                  return;
                }
                const userId = user.id;
                const { data, error } = await supabase
                  .from("profiles")
                  .select("pin")
                  .eq("id", userId)
                  .single();
                setIsLoading(false);
                if (error || !data || data.pin !== pinInput) {
                  setError("PIN incorrecto");
                } else {
                  // PIN correcto, puedes redirigir o mostrar éxito
                  setShowPinPopup(false);
                  router.push("/dashboard");
                }
              }}
              disabled={isLoading}
            >
              Verificar PIN
            </Button>
            {error && <div className="text-red-500">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
