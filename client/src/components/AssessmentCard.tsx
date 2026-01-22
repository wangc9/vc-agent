import Markdown from "react-markdown";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { Assessment } from "@/Assessment";

export default function AssessmentCard({
  assessment,
}: {
  assessment: Assessment;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{assessment.startup_name}</CardTitle>
        <CardDescription className="flex gap-x-1 flex-wrap">
          {assessment.industry}
        </CardDescription>
      </CardHeader>
      <article className="flex flex-col px-6">
        <Markdown>{assessment.analysis}</Markdown>
      </article>
    </Card>
  );
}
