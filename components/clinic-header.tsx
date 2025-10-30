import Link from "next/link"

export function ClinicHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg text-primary hover:opacity-90">
          ClinHat
          <span className="sr-only">Go to home</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-2">
          <Link
            href="/front-desk"
            className="text-sm px-3 py-1 rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Front Desk
          </Link>
          <Link
            href="/doctor"
            className="text-sm px-3 py-1 rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Doctor
          </Link>
          <Link
            href="/admin"
            className="text-sm px-3 py-1 rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Admin
          </Link>
        </nav>
      </div>
      <div className="h-1 w-full bg-primary/80" />
    </header>
  )
}

export default ClinicHeader
