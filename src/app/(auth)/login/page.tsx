import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Nagłówek */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image
              src="/logo.png" // Plik w folderze public
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

        {/* Formularz */}
        <form>
          {/* Email */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="email" className={styles.label}>
                E-mail
              </label>
            </div>

            {/*ikony*/}
            <div className={styles.inputWrapper}>
              <Mail className={styles.icon} size={18} />

              <input
                id="email"
                type="email"
                placeholder="imie.nazwisko@smart-soft.pl"
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* passw */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>
                Hasło
              </label>
              <Link href="#" className={styles.link}>
                Zapomniałeś hasła?
              </Link>
            </div>

            {/* ikony*/}
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} size={18} />

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Przycisk */}
          <button type="submit" className={styles.button}>
            Zaloguj się <ChevronRight size={16} />
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
