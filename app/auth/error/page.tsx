export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Authentication Error</h1>
      <p className="text-gray-600 mt-2">
        It seems like you are trying to sign in with a different provider.
        Please use the original provider you signed up with.
      </p>
      <a href="/auth" className="mt-4 text-pink-500 underline">
        Go back to Sign In
      </a>
    </div>
  );
}
