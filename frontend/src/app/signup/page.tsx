import styles from "@/styles/Signup.module.css";
import Image from "next/image";

console.log(styles); // Debugging: Check if styles are loaded correctly

export default function Signup() {
  return (
    <div className={styles.header}>
        <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
        <h1 className={styles.title}>Sign Up</h1>
    </div>
  );
}
