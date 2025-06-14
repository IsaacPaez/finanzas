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
  const [dialCode, setDialCode] = useState("+34");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  // Guarda el PIN generado en un estado
  const [generatedPin, setGeneratedPin] = useState("");
  const router = useRouter();

  // Paso 1: Solo validar y enviar PIN (sin crear usuario aún)
  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Genera el PIN
      const pin = generatePin();
      setGeneratedPin(pin);

      // 2. Envía el PIN por WhatsApp
      await sendPinWhatsApp({
        phone: `${dialCode}${phone}`,
        pin,
      });

      // 3. Muestra el popup del PIN
      setShowPinPopup(true);
    } catch (err) {
      console.error("Error al enviar PIN:", err);
      setError(err instanceof Error ? err.message : "Error al enviar el PIN");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Verifica PIN y si es correcto, crea el usuario
  const handleVerifyAndCreateUser = async () => {
    // Verifica que el PIN ingresado sea igual al generado
    if (pinInput !== generatedPin) {
      setError("PIN incorrecto");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Una vez verificado el PIN, crea el usuario
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: `${dialCode}${phone}`,
          },
        },
      });
      
      if (error) throw error;
      
      const userId = data.user?.id;
      if (!userId) throw new Error("No se pudo crear el usuario");

      // Guarda el teléfono en profiles (ya no es necesario guardar el PIN)
      await supabase.from("profiles").insert([
        { id: userId, phone: `${dialCode}${phone}` }
      ]);

      // Redirige al dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registrarte</CardTitle>
          <CardDescription>Crea una nueva cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Cambia el onSubmit para llamar a handleSendPin en lugar de handleSignUp */}
          <form onSubmit={handleSendPin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
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
                  <Label htmlFor="repeat-password">Repetir Contraseña</Label>
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
                {isLoading ? "Enviando código..." : "Continuar"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Popup para verificar PIN */}
      {showPinPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Verificar tu número</h2>
            <p className="mb-4">Hemos enviado un PIN a tu WhatsApp. Introdúcelo a continuación.</p>
            <div className="mb-4">
              <Input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN de 6 dígitos"
                className="text-center text-xl tracking-widest"
              />
            </div>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPinPopup(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              {/* Cambia para llamar a la nueva función de verificación y creación */}
              <Button
                onClick={handleVerifyAndCreateUser}
                disabled={isLoading || pinInput.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar y registrarme"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
