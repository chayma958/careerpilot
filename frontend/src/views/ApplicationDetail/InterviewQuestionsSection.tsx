import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteSavedInterviewQuestions,
  generateInterviewQuestions,
  saveInterviewQuestions,
} from "../../api/ai";
import type { SavedInterviewQuestionsEntry } from "../../types";
import { getErrorMessage } from "../../lib/errors";
import { Spinner } from "../../components/Spinner";
import { discardButtonClass, primaryButtonClass, secondaryButtonClass } from "../../lib/ui";
import { sectionClass, labelClass, errorTextClass } from "./styles";

interface InterviewQuestionsSectionProps {
  applicationId: string;
  savedQuestions: SavedInterviewQuestionsEntry[];
}

export function InterviewQuestionsSection({
  applicationId,
  savedQuestions,
}: InterviewQuestionsSectionProps) {
  const queryClient = useQueryClient();
  const [questionsDraft, setQuestionsDraft] = useState<string[] | null>(null);

  function invalidateApplication() {
    queryClient.invalidateQueries({ queryKey: ["applications", applicationId] });
  }

  const interviewQuestionsMutation = useMutation({
    mutationFn: () => generateInterviewQuestions(applicationId),
    onSuccess: (qs) => setQuestionsDraft(qs),
  });

  const saveQuestionsMutation = useMutation({
    mutationFn: (questions: string[]) => saveInterviewQuestions(applicationId, questions),
    onSuccess: () => {
      invalidateApplication();
      setQuestionsDraft(null);
    },
  });

  const deleteQuestionsMutation = useMutation({
    mutationFn: (savedId: string) => deleteSavedInterviewQuestions(savedId),
    onSuccess: invalidateApplication,
  });

  return (
    <div className={sectionClass}>
      <p className={labelClass}>Interview questions</p>
      {!questionsDraft && (
        <button
          onClick={() => interviewQuestionsMutation.mutate()}
          disabled={interviewQuestionsMutation.isPending}
          className={`${secondaryButtonClass} px-3 py-1.5`}
        >
          {interviewQuestionsMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
          {interviewQuestionsMutation.isPending ? "Generating..." : "Generate interview questions"}
        </button>
      )}
      {interviewQuestionsMutation.isError && (
        <p className={errorTextClass}>{getErrorMessage(interviewQuestionsMutation.error)}</p>
      )}
      {saveQuestionsMutation.isError && (
        <p className={errorTextClass}>{getErrorMessage(saveQuestionsMutation.error)}</p>
      )}
      {questionsDraft && (
        <div>
          <ol className="list-decimal space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-3 pl-8 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            {questionsDraft.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => saveQuestionsMutation.mutate(questionsDraft)}
              disabled={saveQuestionsMutation.isPending}
              className={`${primaryButtonClass} px-3 py-1.5`}
            >
              {saveQuestionsMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
              {saveQuestionsMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setQuestionsDraft(null)}
              disabled={saveQuestionsMutation.isPending}
              className={discardButtonClass}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {savedQuestions.length > 0 && (
        <div className="mt-4 space-y-3">
          {savedQuestions.map((set) => (
            <div key={set.id} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Saved {new Date(set.createdAt).toLocaleDateString("en-US")}
                </p>
                <button
                  onClick={() => deleteQuestionsMutation.mutate(set.id)}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                {set.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
