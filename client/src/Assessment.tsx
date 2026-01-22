/* eslint-disable @typescript-eslint/no-unused-vars */
import { useInfiniteQuery } from "@tanstack/react-query";
import AssessmentDialog from "./components/AssessmentDialog";
import AssessmentCard from "./components/AssessmentCard";
import { Fragment } from "react/jsx-runtime";
import { Button } from "./components/ui/button";

export type Assessment = {
  startup_name: string;
  industry: string;
  analysis: string;
};

export default function Assessment() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["assessments"],
    queryFn: async ({ pageParam }) => {
      const token = window.localStorage.getItem("token") || "";
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/assessments?cursor=${pageParam}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result: {
        assessments: Assessment[];
        nextCursor?: number;
      } = await response.json();
      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => lastPage.nextCursor,
  });

  return (
    <main className="w-full h-dvh flex flex-col items-center">
      <AssessmentDialog />
      {status === "pending" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <p>Error: {error.message}</p>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-h-[80dvh] overflow-y-auto gap-4 px-2 md:px-6">
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.assessments.map((assessment) => (
                <AssessmentCard
                  assessment={assessment}
                  key={assessment.startup_name}
                />
              ))}
            </Fragment>
          ))}
        </section>
      )}
      <div className="pt-2">
        <Button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetching}
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
              ? "Load More"
              : "Nothing more to load"}
        </Button>
      </div>
    </main>
  );
}
