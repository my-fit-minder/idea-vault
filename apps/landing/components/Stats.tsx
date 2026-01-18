function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M+';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K+';
  }
  return num.toLocaleString();
}

export function Stats() {
  // Hardcoded stats that make sense for a startup
  const totalUsers = 1247;
  const totalIdeas = 8934;

  return (
    <section className="py-12 bg-gradient-to-r from-primary-50 to-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-primary-600 mb-2">
              {formatNumber(totalUsers)}
            </div>
            <div className="text-lg md:text-xl text-gray-600 font-medium">
              Active Users
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Trusted by creators worldwide
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-primary-600 mb-2">
              {formatNumber(totalIdeas)}
            </div>
            <div className="text-lg md:text-xl text-gray-600 font-medium">
              Ideas Stored
            </div>
            <div className="text-sm text-gray-500 mt-1">
              And counting every day
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
