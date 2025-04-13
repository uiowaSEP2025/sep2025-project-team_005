import Link from "next/link";

export default function Cancel() {
  return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <h1>Payment Canceled</h1>
      <p>No worries — you can always try again when you're ready.</p>
      <Link href="/subscription" style={{ color: "#3b82f6", fontWeight: "bold" }}>
        Return to Subscription Page →
      </Link>
    </div>
  );
}