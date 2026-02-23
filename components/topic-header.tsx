import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnowledgePointManager } from "./knowledge-point-manager";
import { OutlineEditor } from "./outline-editor";

type TopicHeaderProps = {
  topicId: string;
  name: string;
  description: string | null;
  outline: string | null;
};

export function TopicHeader({
  topicId,
  name,
  description,
  outline,
}: TopicHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <OutlineEditor topicId={topicId} outline={outline} />
        </div>
        <KnowledgePointManager topicId={topicId} hasOutline={!!outline} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-[360px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索题目" className="pl-9" />
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="size-4" />
            创建
          </Link>
        </Button>
      </div>
    </div>
  );
}
