import { ChatSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { SendHorizonal } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { SimpleMessage } from "./AssessmentDialog";
import { useQueryClient } from "@tanstack/react-query";

export default function ChatForm({
  setMessage,
}: {
  setMessage: Dispatch<SetStateAction<SimpleMessage[]>>;
}) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof ChatSchema>>({
    resolver: zodResolver(ChatSchema),
    defaultValues: {
      message: "",
    },
  });

  const handleSend = async (data: z.infer<typeof ChatSchema>) => {
    const token = window.localStorage.getItem("token") || "";
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
      }),
    });

    const result: { messages: SimpleMessage[] } = await response.json();
    form.reset({ message: "" });
    queryClient.invalidateQueries({ queryKey: ["assessments"] });
    setMessage(result.messages);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSend)}
      className="w-full flex items-center justify-between gap-x-2"
    >
      <Controller
        name="message"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Input
              {...field}
              id="chat-form-input"
              aria-invalid={fieldState.invalid}
              autoComplete="off"
            />
          </Field>
        )}
      />
      <Button type="submit" size="icon-lg">
        {form.formState.isSubmitting ? <Spinner /> : <SendHorizonal />}
      </Button>
    </form>
  );
}
