"use client";

import type { Question, AnswerValue, Choice } from "@/shared/types/form";
import {
  ShortText,
  LongText,
  MultipleChoice,
  Checkboxes,
  Dropdown,
  YesNo,
  Rating,
  StarRating,
  EmailInput,
  NumberInput,
  DatePicker,
  FileUpload,
  Statement,
  Ranking,
} from "./questions";
import type { FormViewEditable } from "./FormView";

interface Props {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  onSubmit: () => void;
  onAutoAdvance: () => void;
  editable?: FormViewEditable;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  onSubmit,
  onAutoAdvance,
  editable,
}: Props) {
  const updateChoiceLabel = editable
    ? (choiceId: string, label: string) => {
        const next: Choice[] = (question.choices ?? []).map((c) =>
          c.id === choiceId ? { ...c, label } : c
        );
        editable.updateQuestion(question.id, { choices: next });
      }
    : undefined;
  switch (question.type) {
    case "short_text":
      return (
        <ShortText
          value={(value as string) ?? ""}
          onChange={onChange}
          placeholder={question.placeholder}
          onSubmit={onSubmit}
        />
      );

    case "long_text":
      return (
        <LongText
          value={(value as string) ?? ""}
          onChange={onChange}
          placeholder={question.placeholder}
          onSubmit={onSubmit}
        />
      );

    case "multiple_choice":
      return (
        <MultipleChoice
          choices={question.choices ?? []}
          value={(value as string) ?? ""}
          onChange={onChange}
          onSubmit={onAutoAdvance}
          onEditChoiceLabel={updateChoiceLabel}
        />
      );

    case "checkboxes":
      return (
        <Checkboxes
          choices={question.choices ?? []}
          value={(value as string[]) ?? []}
          onChange={onChange}
          onSubmit={onSubmit}
          onEditChoiceLabel={updateChoiceLabel}
        />
      );

    case "dropdown":
      return (
        <Dropdown
          choices={question.choices ?? []}
          value={(value as string) ?? ""}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={question.placeholder}
          onEditChoiceLabel={updateChoiceLabel}
        />
      );

    case "yes_no":
      return (
        <YesNo
          value={(value as string) ?? ""}
          onChange={onChange}
          onSubmit={onAutoAdvance}
        />
      );

    case "rating":
      return (
        <Rating
          value={(value as number) ?? null}
          onChange={(n) => onChange(n)}
          onSubmit={onAutoAdvance}
          min={question.min ?? 0}
          max={question.max ?? 10}
          lowLabel={question.lowLabel}
          highLabel={question.highLabel}
          onEditLowLabel={
            editable
              ? (lowLabel) =>
                  editable.updateQuestion(question.id, { lowLabel })
              : undefined
          }
          onEditHighLabel={
            editable
              ? (highLabel) =>
                  editable.updateQuestion(question.id, { highLabel })
              : undefined
          }
        />
      );

    case "star_rating":
      return (
        <StarRating
          value={(value as number) ?? null}
          onChange={(n) => onChange(n)}
          onSubmit={onAutoAdvance}
          max={question.max ?? 5}
        />
      );

    case "email":
      return (
        <EmailInput
          value={(value as string) ?? ""}
          onChange={onChange}
          placeholder={question.placeholder}
          onSubmit={onSubmit}
        />
      );

    case "number":
      return (
        <NumberInput
          value={(value as string) ?? ""}
          onChange={onChange}
          placeholder={question.placeholder}
          onSubmit={onSubmit}
          min={question.min}
          max={question.max}
        />
      );

    case "date":
      return (
        <DatePicker
          value={(value as string) ?? ""}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );

    case "file_upload":
      return (
        <FileUpload
          value={(value as File) ?? null}
          onChange={onChange}
          onSubmit={onSubmit}
          maxFileSize={question.maxFileSize}
          acceptedFileTypes={question.acceptedFileTypes}
        />
      );

    case "statement":
      return <Statement onSubmit={onAutoAdvance} />;

    case "ranking":
      return (
        <Ranking
          choices={question.choices ?? []}
          value={(value as string[]) ?? []}
          onChange={onChange}
          onSubmit={onSubmit}
          onEditChoiceLabel={updateChoiceLabel}
        />
      );

    default:
      return null;
  }
}
