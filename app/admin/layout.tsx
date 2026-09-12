import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import AdminNav from "@/components/admin/AdminNav";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className={styles.shell}>
      <AdminNav email={admin.email} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
