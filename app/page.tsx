import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Agent <span className="text-primary">Aik</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Deploy AI agents that work for your business. Build workflows, monitor executions, and scale effortlessly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
