// Small reusable "something went wrong" block used wherever a page's data
// fetch fails, so a failed request shows an actionable message instead of
// leaving the page stuck on "Loading..." forever.
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div role="alert" className="text-center py-16 px-4">
      <p className="text-gray-300 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="gradient-bg px-5 py-2 rounded-full text-sm font-medium"
        >
          Try again
        </button>
      )}
    </div>
  );
}
