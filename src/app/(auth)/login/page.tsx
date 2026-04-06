'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Lock, Mail, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { loginAction } from '@/lib/actions/login';
import { FormErrors } from '@/types/auth-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  //for example conection error
  const [globalError, setGlobalError] = useState<string | null>(null);
  //bad email etc.
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setGlobalError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    //server action validation check

    const result = await loginAction(formData);

    if (!result.ok) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      if (result.formErrors && result.formErrors.length > 0) {
        setGlobalError(result.formErrors[0]);
      } else if (result.error) {
        setGlobalError(result.error);
      }

      setIsLoading(false);
      return;
    }

    //next auth logging
    try {
      const authResult = await signIn('credentials', {
        redirect: false,
        email: result.email,
        password: result.password,
      });

      if (authResult?.error) {
        setGlobalError('Nieprawidłowy e-mail lub hasło.');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Błąd logowania:', error);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[420px] shadow-lg">
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center mb-2">
            <Image
              src="/logo.png"
              alt="Logo Firmy"
              width={180}
              height={60}
              className="h-auto w-auto max-w-[300px] max-h-[100px] object-contain"
              priority
            />
          </div>
          <CardTitle className="text-lg font-medium text-muted-foreground">
            Witaj w portalu
          </CardTitle>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            Bieloidziska twierdza 3000
          </h1>
          <CardDescription>Zaloguj się, aby zarządzać projektami.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {globalError && (
              <div className="p-3 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} />
                {globalError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                E-mail
              </Label>
              <div className="relative">
                <Mail
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors',
                    fieldErrors.email && 'text-destructive',
                  )}
                  size={20}
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="imie.nazwisko@smart.pl"
                  className={cn(
                    'pl-10 h-11 text-base',
                    fieldErrors.email && 'border-destructive focus-visible:ring-destructive/20',
                  )}
                  aria-invalid={!!fieldErrors.email}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm font-medium text-destructive ml-1 animate-in slide-in-from-top-1">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-semibold">
                  Hasło
                </Label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                  Zapomniałeś hasła?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors',
                    fieldErrors.password && 'text-destructive',
                  )}
                  size={20}
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    'pl-10 h-11 text-base',
                    fieldErrors.password && 'border-destructive focus-visible:ring-destructive/20',
                  )}
                  aria-invalid={!!fieldErrors.password}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-sm font-medium text-destructive ml-1 animate-in slide-in-from-top-1">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Logowanie... <Loader2 className="animate-spin ml-2" size={18} />
                </>
              ) : (
                <>
                  Zaloguj się <ChevronRight className="ml-2" size={18} />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t pt-6 mt-4">
          <div className="text-sm text-muted-foreground">
            Nie masz konta?{' '}
            <Link href="#" className="font-medium text-primary hover:underline">
              Skontaktuj się z administratorem
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
