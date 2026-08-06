function NotFound() {
  return <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="text-center max-w-lg">
        <h1 className="text-8xl font-bold mb-6 text-primary">404</h1>
        <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-10 text-lg leading-relaxed max-w-md mx-auto">
          The page you're looking for doesn't exist. Please check the URL and try again.
        </p>
        <a href="/" className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg">
          Go Home
        </a>
      </div>
    </div>;
}
export {
  NotFound as default
};


