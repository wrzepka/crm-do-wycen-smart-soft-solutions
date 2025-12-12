'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Lock, Mail, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { loginAction } from '@/lib/actions/login';
import { FormErrors } from '@/types/auth-types';
import styles from './login.module.css';

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
    //ux
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
          <h1 className={styles.companyName}>Bieloidziska twierdza 3000</h1>
          <p className={styles.description}>Zaloguj się, aby zarządzać projektami.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {globalError && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              {globalError}
            </div>
          )}

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
                style={fieldErrors.email ? { color: 'var(--destructive)' } : {}}
              />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="imie.nazwisko@smart.pl"
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                aria-invalid={!!fieldErrors.email}
              />
            </div>
            {fieldErrors.email && <p className={styles.errorMessage}>{fieldErrors.email[0]}</p>}
          </div>

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
            Skontaktuj się z administratorem
          </Link>
        </div>
      </div>
    </div>
  );
}
