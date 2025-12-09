'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Lock, Mail, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { loginSchema } from '@/lib/schemas/authSchema';
import styles from './login.module.css';

// Typ dla błędów formularza (klucz to nazwa pola, wartość to tablica komunikatów)
type FieldErrors = {
  email?: string[];
  password?: string[];
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({}); // Stan dla błędów pól

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setGlobalError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. Walidacja Zod
    const validation = loginSchema.safeParse({ email, password });

    if (!validation.success) {
      // Zamiast brać pierwszy błąd, mapujemy błędy do konkretnych pól
      setFieldErrors(validation.error.flatten().fieldErrors);
      setIsLoading(false);
      return;
    }

    // 2. Próba logowania
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setGlobalError('Nieprawidłowy e-mail lub hasło.');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      // POPRAWKA: Używamy zmiennej error (logujemy ją), żeby ESLint nie zgłaszał błędu "unused var"
      console.error('Błąd logowania:', error);
      setGlobalError('Wystąpił błąd połączenia. Spróbuj ponownie.');
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image
              src="/logo.png"
              alt="Logo Firmy"
              width={180}
              height={60}
              className={styles.logoImage}
              priority
            />
          </div>
          <div className={styles.title}>Witaj w portalu</div>
          <h1 className={styles.companyName}>Bielowicka twierdza 3000</h1>
          <p className={styles.description}>Zaloguj się, aby zarządzać projektami.</p>
        </div>

        {/* Dodajemy noValidate, aby wyłączyć systemowe dymki */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Błąd ogólny (np. złe hasło, brak połączenia) */}
          {globalError && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              {globalError}
            </div>
          )}

          {/* Email */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="email" className={styles.label}>
                E-mail
              </label>
            </div>

            <div className={styles.inputWrapper}>
              <Mail
                className={styles.icon}
                size={18}
                // Jeśli jest błąd, kolorujemy ikonę na czerwono
                style={fieldErrors.email ? { color: 'var(--destructive)' } : {}}
              />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="imie.nazwisko@smart-soft.pl"
                // Dodajemy klasę błędu warunkowo
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                // Mimo noValidate, warto zostawić atrybuty dla dostępności
                aria-invalid={!!fieldErrors.email}
              />
            </div>
            {/* Wyświetlanie błędu pod polem */}
            {fieldErrors.email && <p className={styles.errorMessage}>{fieldErrors.email[0]}</p>}
          </div>

          {/* Hasło */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>
                Hasło
              </label>
              <Link href="#" className={styles.link}>
                Zapomniałeś hasła?
              </Link>
            </div>

            <div className={styles.inputWrapper}>
              <Lock
                className={styles.icon}
                size={18}
                style={fieldErrors.password ? { color: 'var(--destructive)' } : {}}
              />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                aria-invalid={!!fieldErrors.password}
              />
            </div>
            {fieldErrors.password && (
              <p className={styles.errorMessage}>{fieldErrors.password[0]}</p>
            )}
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? (
              <>
                Logowanie... <Loader2 className="animate-spin ml-2" size={16} />
              </>
            ) : (
              <>
                Zaloguj się <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          Nie masz konta?{' '}
          <Link href="#" className={styles.link}>
            To nie wiem czy to potrzebne chlopaki
          </Link>
        </div>
      </div>
    </div>
  );
}
