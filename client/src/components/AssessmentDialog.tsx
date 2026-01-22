import { useState } from "react";
import ChatForm from "./ChatForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import MessageBlock from "./MessageBlock";
import { Button } from "./ui/button";

export type SimpleMessage = {
  id: string[];
  kwargs: {
    content: string;
    tool_calls?: {
      name: string;
    }[];
  };
};

export default function AssessmentDialog() {
  const [message, setMessage] = useState<SimpleMessage[]>([]);
  return (
    <div className="h-[20dvh] flex items-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button">Assess My Start-up</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assess My Start-up</DialogTitle>
            <DialogDescription>
              Are you building your own start-up? Have a chat with our agent to
              find out what you could do to prepare for a fruitful Slush.
            </DialogDescription>
          </DialogHeader>
          <section className="h-[300px] overflow-y-auto flex flex-col gap-y-2">
            {message.map(
              (item, index) =>
                !(
                  item.id.includes("ToolMessage") ||
                  (item.kwargs.tool_calls && item.kwargs.tool_calls?.length > 0)
                ) && (
                  <MessageBlock
                    key={index}
                    content={item.kwargs.content}
                    type={item.id.includes("HumanMessage") ? "HUMAN" : "AI"}
                  />
                ),
            )}
          </section>

          <DialogFooter className="w-full flex">
            <ChatForm setMessage={setMessage} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
