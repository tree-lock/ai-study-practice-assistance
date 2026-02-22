import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { Button, Heading, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
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
        <Heading size="7" weight="bold">
          {name}
        </Heading>
        {description ? (
          <Text size="2" color="gray">
            {description}
          </Text>
        ) : null}
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <OutlineEditor topicId={topicId} outline={outline} />
        </div>
        <KnowledgePointManager topicId={topicId} hasOutline={!!outline} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <TextField.Root placeholder="搜索题目" style={{ width: 360 }}>
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
        <Button asChild>
          <Link href="/">
            <PlusIcon />
            创建
          </Link>
        </Button>
      </div>
    </div>
  );
}
