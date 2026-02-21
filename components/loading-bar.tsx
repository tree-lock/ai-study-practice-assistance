export function LoadingBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-1 w-full overflow-hidden rounded bg-blue-100">
      <div className="absolute left-0 top-0 h-full w-1/2 animate-loading-bar bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400" />
    </div>
  );
}
