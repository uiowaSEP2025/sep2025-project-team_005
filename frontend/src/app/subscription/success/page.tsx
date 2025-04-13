import Link from "next/link";

export default function Success() {
  return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <h1>Payment Successful!</h1>
      <p>Your subscription has been activated. Welcome to premium features!</p>
      <Link href="/" style={{ color: "#3b82f6", fontWeight: "bold" }}>
        Go to Dashboard →
      </Link>
    </div>
  );
}