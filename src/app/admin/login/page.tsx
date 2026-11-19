import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/Logo";
import { adminConfigured, isAdmin } from "@/lib/auth";

export const metadata = { title: "Giriş" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = adminConfigured();

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-100 to-brand-50 px-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-lift">
        <div className="mx-auto grid h-16 w-20 place-items-center rounded-2xl bg-brand-600">
          <LogoMark className="h-10 w-14" />
        </div>
        <h1 className="mt-6 text-center text-2xl font-extrabold text-brand-900">Admin panel</h1>
        <p className="mt-1 text-center text-sm text-brand-600">ByCase idarəetmə paneli</p>
        <div className="mt-7">
          {configured ? (
            <LoginForm />
          ) : (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              Giriş hələ qurulmayıb. <code>.env.local</code> faylında <code>ADMIN_PASSWORD</code> və{" "}
              <code>ADMIN_SESSION_SECRET</code> (ən azı 16 simvol) təyin edin, sonra serveri yenidən başladın.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
