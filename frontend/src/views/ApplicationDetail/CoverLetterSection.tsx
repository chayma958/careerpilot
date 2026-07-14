import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateCoverLetter, saveCoverLetter } from "../../api/ai";
import { getErrorMessage } from "../../lib/errors";
import { Spinner } from "../../components/Spinner";
import { discardButtonClass, primaryButtonClass, secondaryButtonClass } from "../../lib/ui";
import { sectionClass, labelClass, errorTextClass } from "./styles";

interface CoverLetterSectionProps {
  applicationId: string;
}

export function CoverLetterSection({ applicationId }: CoverLetterSectionProps) {
  const queryClient = useQueryClient();
  const [coverLetterDraft, setCoverLetterDraft] = useState<string | null>(null);

  const coverLetterMutation = useMutation({
    mutationFn: () => generateCoverLetter(applicationId),
    onSuccess: (text) => setCoverLetterDraft(text),
  });

  const saveCoverLetterMutation = useMutation({
    mutationFn: (text: string) => saveCoverLetter(applicationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["applications", applicationId] });
      setCoverLetterDraft(null);
    },
  });

  return (
    <div className={sectionClass}>
      <p className={labelClass}>Cover letter</p>
      {!coverLetterDraft && (
        <button
          onClick={() => coverLetterMutation.mutate()}
          disabled={coverLetterMutation.isPending}
          className={`${secondaryButtonClass} px-3 py-1.5`}
        >
          {coverLetterMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
          {coverLetterMutation.isPending ? "Generating..." : "Generate cover letter"}
        </button>
      )}
      {coverLetterMutation.isError && (
        <p className={errorTextClass}>{getErrorMessage(coverLetterMutation.error)}</p>
      )}
      {saveCoverLetterMutation.isError && (
        <p className={errorTextClass}>{getErrorMessage(saveCoverLetterMutation.error)}</p>
      )}
      {coverLetterDraft && (
        <div>
          <div className="whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            {coverLetterDraft}
          </div>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => saveCoverLetterMutation.mutate(coverLetterDraft)}
              disabled={saveCoverLetterMutation.isPending}
              className={`${primaryButtonClass} px-3 py-1.5`}
            >
              {saveCoverLetterMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
              {saveCoverLetterMutation.isPending ? "Saving..." : "Save as PDF"}
            </button>
            <button
              onClick={() => setCoverLetterDraft(null)}
              disabled={saveCoverLetterMutation.isPending}
              className={discardButtonClass}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
