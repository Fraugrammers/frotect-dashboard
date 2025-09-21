// ErrorPage.tsx
export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-[#141518] text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-white/60 mb-6">Oops! The page you are looking for doesn’t exist.</p>
      <a
        href="/login"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-[color:var(--primary-500)]"
      >
        Back to Login
      </a>
    </div>
  )
}
