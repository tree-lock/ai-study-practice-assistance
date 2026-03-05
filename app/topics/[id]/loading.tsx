import { LoadingBar } from "@/components/loading-bar";

export default function TopicPageLoading() {
  return (
    <div className="relative">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-20 pb-8">
        <LoadingBar />
      </div>
    </div>
  );
}
