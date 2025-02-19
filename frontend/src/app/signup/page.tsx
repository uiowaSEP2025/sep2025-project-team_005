import styles from "@/styles/Signup.module.css";
import Image from "next/image";

export default function Signup() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Image src="/savvy.png" alt="Platform Logo" width={100} height={100} />
        <h1 className={styles.title}>Sign Up</h1>
      </div>

      <form className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input type="email" id="email" name="email" className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input type="text" id="username" name="username" className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input type="password" id="password" name="password" className={styles.input} required />
        </div>

        <button type="submit" className={styles.submitButton}>Sign Up</button>
      </form>
    </div>
  );
}
