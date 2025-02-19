import styles from "@/styles/Signup.module.css";

console.log(styles); // Debugging: Check if styles are loaded correctly

export default function Signup() {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Sign Up</h1>
    </div>
  );
}
