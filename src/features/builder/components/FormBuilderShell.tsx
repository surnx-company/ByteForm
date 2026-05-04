"use client";

import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useFormBuilder } from "../hooks/useFormBuilder";
import { QuestionTypeMenu } from "./QuestionTypeMenu";
import { QuestionList } from "./QuestionList";
import {
  QuestionEditor,
  WelcomeScreenEditor,
  ThankYouScreenEditor,
} from "./QuestionEditor";
import { FormView } from "@/features/runtime";
import { UserMenu } from "@/shared/components/UserMenu";
import type { Form } from "@/shared/types/form";

const serif = { fontFamily: "var(--font-serif)" } as const;
const W = "#6B1A2A";
const I = "#F7F3EC";
const B = "#1C1410";
const M = "#7A6A60";
const WA = (a: number) => `rgba(107,26,42,${a})`;

function sanitizeSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Props {
  initialForm: Form;
}

export function SaveableFormBuilder({ initialForm }: Props) {
  const builder = useFormBuilder(initialForm);
  const {
    form,
    selectedId,
    setSelectedId,
    selectedQuestion,
    editingScreen,
    setEditingScreen,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    updateWelcomeScreen,
    updateThankYouScreen,
    updateFormTitle,
    updateFormSlug,
    updateRedirectUrl,
    setPublished,
  } = builder;

  const [saving, setSaving] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [liveToast, setLiveToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Right panel: "editor" shows question/screen editor, "settings" shows form settings
  const [rightTab, setRightTab] = useState<"editor" | "settings">("settings");

  const [slugDraft, setSlugDraft] = useState(form.slug);
  const [slugEditing, setSlugEditing] = useState(false);

  // Always-fresh form snapshot for callbacks that don't want to re-bind on every keystroke.
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  });

  const publicUrl = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/f/${form.slug}`
        : `/f/${form.slug}`,
    [form.slug],
  );

  const saveForm = useCallback(async () => {
    const f = formRef.current;
    setSaving(true);
    try {
      await fetch(`/api/forms/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title,
          slug: f.slug,
          welcomeScreen: f.welcomeScreen,
          thankYouScreen: f.thankYouScreen,
          questions: f.questions,
          isPublished: f.isPublished,
          redirectUrl: f.redirectUrl ?? "",
        }),
      });
    } catch {
      // silent auto-save fail
    } finally {
      setSaving(false);
    }
  }, []);

  // Skip the first run — initialForm came from the server, no need to PUT it back.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const t = setTimeout(saveForm, 1500);
    return () => clearTimeout(t);
  }, [
    form.title,
    form.slug,
    form.welcomeScreen,
    form.thankYouScreen,
    form.questions,
    form.redirectUrl,
    saveForm,
  ]);

  const togglePublish = useCallback(async () => {
    const f = formRef.current;
    const next = !f.isPublished;
    setPublished(next);
    setPublishBusy(true);
    try {
      await fetch(`/api/forms/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title,
          slug: f.slug,
          welcomeScreen: f.welcomeScreen,
          thankYouScreen: f.thankYouScreen,
          questions: f.questions,
          isPublished: next,
          redirectUrl: f.redirectUrl ?? "",
        }),
      });
      if (next) {
        setLiveToast(true);
        setTimeout(() => setLiveToast(false), 5000);
      }
    } catch {
      setPublished(!next);
    } finally {
      setPublishBusy(false);
    }
  }, [setPublished]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [publicUrl]);

  const commitSlug = useCallback(() => {
    const clean = sanitizeSlug(slugDraft) || formRef.current.slug;
    setSlugDraft(clean);
    updateFormSlug(clean);
    setSlugEditing(false);
  }, [slugDraft, updateFormSlug]);

  // When a question or screen is selected, switch to editor tab
  const selectQuestion = useCallback(
    (id: string) => {
      setSelectedId(id);
      setEditingScreen(null);
      setRightTab("editor");
    },
    [setSelectedId, setEditingScreen],
  );

  const selectScreen = useCallback(
    (screen: "welcome" | "thankyou") => {
      setEditingScreen(screen);
      setSelectedId(null);
      setRightTab("editor");
    },
    [setSelectedId, setEditingScreen],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateFormTitle(e.target.value),
    [updateFormTitle],
  );

  const editorHasContent = selectedQuestion || editingScreen;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: I, color: B }}
    >
      {/* Mobile gate — builder requires a larger screen */}
      <div className="md:hidden fixed inset-0 z-[999] bg-bg flex flex-col items-center justify-center text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="2" y="4" width="20" height="14" rx="2" stroke={W} strokeWidth="1.5" />
            <path d="M8 22h8M12 18v4" stroke={W} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-fg font-normal mb-3">
          Open on a larger screen
        </h1>
        <p className="text-sm text-fg-muted leading-relaxed max-w-xs mb-8">
          The form builder works best on a desktop or laptop. Your forms and responses are fully accessible on any device.
        </p>
        <a
          href="/dashboard"
          className="text-sm text-[#F7F3EC] bg-accent px-6 py-2.5 rounded-lg no-underline hover:bg-accent-hover transition-colors"
        >
          Back to dashboard
        </a>
      </div>

      {/* Post-publish toast */}
      {liveToast && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            background: "white",
            borderRadius: 10,
            border: `0.5px solid ${WA(0.14)}`,
            boxShadow: "0 8px 32px rgba(28,20,16,0.12)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: "slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both",
            minWidth: 340,
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="#16a34a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: B,
                margin: "0 0 2px",
              }}
            >
              Your form is live
            </p>
            <p
              style={{
                fontSize: 11,
                color: M,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {publicUrl}
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            style={{
              fontSize: 12,
              padding: "5px 12px",
              borderRadius: 6,
              background: copiedLink ? "rgba(34,197,94,0.1)" : WA(0.06),
              color: copiedLink ? "#16a34a" : W,
              border: `0.5px solid ${copiedLink ? "rgba(34,197,94,0.25)" : WA(0.2)}`,
              cursor: "pointer",
              flexShrink: 0,
              fontWeight: 500,
            }}
          >
            {copiedLink ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}

      {/* Header */}
      <header
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: `0.5px solid ${WA(0.12)}`,
          background: "white",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <img
              src="/logo-icon.svg"
              alt="ByteForm"
              style={{ height: 26, width: 26 }}
            />
            <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <span
                style={{
                  ...serif,
                  fontSize: 16,
                  color: B,
                  letterSpacing: "-0.3px",
                }}
              >
                Byte
              </span>
              <span
                style={{
                  ...serif,
                  fontSize: 16,
                  color: W,
                  letterSpacing: "-0.3px",
                }}
              >
                Form
              </span>
            </div>
          </a>
          <div style={{ width: 1, height: 16, background: WA(0.15) }} />
          <a
            href="/dashboard"
            title="Back to your forms"
            className="builder-back-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px 5px 8px",
              borderRadius: 7,
              border: `0.5px solid ${WA(0.18)}`,
              fontSize: 12,
              color: B,
              textDecoration: "none",
              background: "transparent",
              whiteSpace: "nowrap",
              transition: "background 0.12s, border-color 0.12s",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              aria-hidden
            >
              <path
                d="M7 2L3 5.5L7 9"
                stroke={B}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All forms
          </a>
          <div style={{ width: 1, height: 16, background: WA(0.15) }} />
          <input
            type="text"
            value={form.title}
            onChange={handleTitleChange}
            style={{
              background: "transparent",
              fontSize: 13,
              fontWeight: 500,
              color: B,
              border: "none",
              outline: "none",
              width: 192,
            }}
            placeholder="Form title…"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: M }}>
            {saving ? "Saving…" : "Saved"}
          </span>

          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 500,
              color: form.isPublished ? "#16a34a" : M,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: form.isPublished ? "#16a34a" : M,
              }}
            />
            {form.isPublished ? "Live" : "Draft"}
          </span>

          {form.isPublished && (
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: B,
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 7,
                border: `0.5px solid ${WA(0.18)}`,
              }}
            >
              View live
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M7.5 1H9V2.5M9 1L5 5M3.5 2H2C1.45 2 1 2.45 1 3V8C1 8.55 1.45 9 2 9H7C7.55 9 8 8.55 8 8V6.5"
                  stroke={M}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          )}

          <a
            href={`/dashboard/${form.id}/responses`}
            style={{
              fontSize: 12,
              color: B,
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 7,
              border: `0.5px solid ${WA(0.18)}`,
            }}
          >
            Responses
          </a>

          <button
            onClick={togglePublish}
            disabled={publishBusy}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: 7,
              border: "0.5px solid",
              cursor: publishBusy ? "wait" : "pointer",
              ...(form.isPublished
                ? { background: "transparent", color: M, borderColor: WA(0.18) }
                : { background: W, color: I, borderColor: "transparent" }),
            }}
          >
            {publishBusy
              ? form.isPublished
                ? "Unpublishing…"
                : "Publishing…"
              : form.isPublished
                ? "Unpublish"
                : "Publish"}
          </button>

          <UserMenu />
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left panel */}
        <div
          style={{
            width: 280,
            borderRight: `0.5px solid ${WA(0.12)}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            background: "white",
          }}
        >
          <div style={{ padding: 12, borderBottom: `0.5px solid ${WA(0.1)}` }}>
            <QuestionTypeMenu onAdd={addQuestion} />
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {/* Welcome screen */}
            <button
              onClick={() => selectScreen("welcome")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                textAlign: "left",
                marginBottom: 4,
                cursor: "pointer",
                background:
                  editingScreen === "welcome" ? WA(0.07) : "transparent",
                border: `0.5px solid ${editingScreen === "welcome" ? WA(0.2) : "transparent"}`,
                color: B,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  flexShrink: 0,
                  background: WA(0.06),
                  border: `0.5px solid ${WA(0.12)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path
                    d="M1 5.5C1 3.01 3.01 1 5.5 1S10 3.01 10 5.5 7.99 10 5.5 10"
                    stroke={M}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3.5 5.5L5 7L7.5 4"
                    stroke={M}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Welcome Screen
            </button>

            <QuestionList
              questions={form.questions}
              selectedId={selectedId}
              onSelect={selectQuestion}
              onDelete={deleteQuestion}
              onDuplicate={duplicateQuestion}
              onReorder={reorderQuestions}
            />

            {/* Thank you screen */}
            <button
              onClick={() => selectScreen("thankyou")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                textAlign: "left",
                marginTop: 4,
                cursor: "pointer",
                background:
                  editingScreen === "thankyou" ? WA(0.07) : "transparent",
                border: `0.5px solid ${editingScreen === "thankyou" ? WA(0.2) : "transparent"}`,
                color: B,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  flexShrink: 0,
                  background: WA(0.06),
                  border: `0.5px solid ${WA(0.12)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path
                    d="M2 5.5L4.5 8L9 3"
                    stroke={M}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Thank You Screen
            </button>
          </div>
        </div>

        {/* Center panel — live preview */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: "6px 16px",
              borderBottom: `0.5px solid ${WA(0.1)}`,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: M,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Preview
            </span>
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: M, textDecoration: "none" }}
            >
              Open full screen ↗
            </a>
          </div>
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              background: "var(--color-bg)",
            }}
          >
            {form.questions.length === 0 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 32,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    marginBottom: 20,
                    background: WA(0.05),
                    border: `0.5px solid ${WA(0.15)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M9 3.5v11M3.5 9h11"
                      stroke={W}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: B,
                    marginBottom: 6,
                  }}
                >
                  Add your first question
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: M,
                    lineHeight: 1.6,
                    maxWidth: 240,
                  }}
                >
                  Use <strong>+ Add question</strong> in the left panel. Your
                  preview will appear here.
                </p>
              </div>
            ) : (
              <div style={{ position: "absolute", inset: 0 }}>
                <FormView
                  form={form}
                  jumpTo={
                    editingScreen === "welcome"
                      ? "welcome"
                      : editingScreen === "thankyou"
                        ? "thankyou"
                        : (selectedId ?? undefined)
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 288,
            borderLeft: `0.5px solid ${WA(0.12)}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            background: "white",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: `0.5px solid ${WA(0.1)}`,
              padding: "0 4px",
            }}
          >
            <button
              onClick={() => setRightTab("editor")}
              style={{
                flex: 1,
                padding: "10px 8px",
                fontSize: 12,
                fontWeight: 500,
                background: "none",
                border: "none",
                cursor: "pointer",
                borderBottom:
                  rightTab === "editor"
                    ? `2px solid ${W}`
                    : "2px solid transparent",
                color: rightTab === "editor" ? W : M,
                transition: "color 0.15s",
              }}
            >
              {editingScreen === "welcome"
                ? "Welcome"
                : editingScreen === "thankyou"
                  ? "Thank You"
                  : selectedQuestion
                    ? "Edit Question"
                    : "Editor"}
            </button>
            <button
              onClick={() => setRightTab("settings")}
              style={{
                flex: 1,
                padding: "10px 8px",
                fontSize: 12,
                fontWeight: 500,
                background: "none",
                border: "none",
                cursor: "pointer",
                borderBottom:
                  rightTab === "settings"
                    ? `2px solid ${W}`
                    : "2px solid transparent",
                color: rightTab === "settings" ? W : M,
                transition: "color 0.15s",
              }}
            >
              Form Settings
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {/* Editor tab */}
            {rightTab === "editor" && (
              <>
                {editingScreen === "welcome" && (
                  <WelcomeScreenEditor
                    screen={form.welcomeScreen}
                    onUpdate={updateWelcomeScreen}
                  />
                )}
                {editingScreen === "thankyou" && (
                  <ThankYouScreenEditor
                    screen={form.thankYouScreen}
                    onUpdate={updateThankYouScreen}
                  />
                )}
                {selectedQuestion && !editingScreen && (
                  <QuestionEditor
                    question={selectedQuestion}
                    allQuestions={form.questions}
                    onUpdate={updateQuestion}
                  />
                )}
                {!editorHasContent && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingTop: 48,
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: 13, color: M, lineHeight: 1.6 }}>
                      Select a question or screen in the left panel to edit it
                      here.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Settings tab */}
            {rightTab === "settings" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {/* Live callout */}
                {form.isPublished && (
                  <div
                    style={{
                      borderRadius: 10,
                      padding: "12px 14px",
                      background: "rgba(34,197,94,0.06)",
                      border: "0.5px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#16a34a",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#16a34a",
                        }}
                      >
                        Form is live
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 11,
                        color: M,
                        margin: "0 0 10px",
                        wordBreak: "break-all",
                        lineHeight: 1.5,
                      }}
                    >
                      {publicUrl}
                    </p>
                    <button
                      onClick={handleCopyLink}
                      style={{
                        width: "100%",
                        padding: "7px",
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 500,
                        background: copiedLink
                          ? "rgba(34,197,94,0.1)"
                          : WA(0.06),
                        color: copiedLink ? "#16a34a" : W,
                        border: `0.5px solid ${copiedLink ? "rgba(34,197,94,0.2)" : WA(0.18)}`,
                        cursor: "pointer",
                      }}
                    >
                      {copiedLink ? "Copied!" : "Copy share link"}
                    </button>
                  </div>
                )}

                {/* Form URL */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 500,
                      color: M,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Form URL
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: `0.5px solid ${slugEditing ? WA(0.4) : WA(0.18)}`,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: I,
                      transition: "border-color 0.15s",
                    }}
                  >
                    <span
                      style={{
                        padding: "8px 10px",
                        fontSize: 12,
                        color: M,
                        borderRight: `0.5px solid ${WA(0.12)}`,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      /f/
                    </span>
                    <input
                      value={slugEditing ? slugDraft : form.slug}
                      onFocus={() => {
                        setSlugEditing(true);
                        setSlugDraft(form.slug);
                      }}
                      onChange={(e) => setSlugDraft(e.target.value)}
                      onBlur={commitSlug}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitSlug();
                        if (e.key === "Escape") {
                          setSlugEditing(false);
                          setSlugDraft(form.slug);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: 12,
                        color: B,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        minWidth: 0,
                      }}
                      placeholder="your-form-slug"
                      spellCheck={false}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: M,
                      marginTop: 6,
                      lineHeight: 1.5,
                    }}
                  >
                    Lowercase letters, numbers and hyphens only.
                  </p>
                </div>

                {/* Redirect URL */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 500,
                      color: M,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Redirect After Submission
                  </label>
                  <input
                    type="url"
                    value={form.redirectUrl ?? ""}
                    onChange={(e) => updateRedirectUrl(e.target.value)}
                    placeholder="https://example.com/thank-you"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12,
                      color: B,
                      background: I,
                      border: `0.5px solid ${WA(0.18)}`,
                      borderRadius: 8,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = WA(0.4))
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = WA(0.18))
                    }
                  />
                  <p
                    style={{
                      fontSize: 11,
                      color: M,
                      marginTop: 6,
                      lineHeight: 1.5,
                    }}
                  >
                    {form.redirectUrl
                      ? "Respondents will be redirected here after submitting."
                      : "Leave empty to show the thank you screen instead."}
                  </p>
                </div>

                {/* Publish */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 500,
                      color: M,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Visibility
                  </label>
                  <button
                    onClick={togglePublish}
                    disabled={publishBusy}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: publishBusy ? "wait" : "pointer",
                      border: "0.5px solid",
                      ...(form.isPublished
                        ? {
                            background: "transparent",
                            color: M,
                            borderColor: WA(0.15),
                          }
                        : {
                            background: W,
                            color: I,
                            borderColor: "transparent",
                          }),
                    }}
                  >
                    {publishBusy
                      ? form.isPublished
                        ? "Unpublishing…"
                        : "Publishing…"
                      : form.isPublished
                        ? "Unpublish form"
                        : "Publish form"}
                  </button>
                  <p
                    style={{
                      fontSize: 11,
                      color: M,
                      marginTop: 6,
                      lineHeight: 1.5,
                    }}
                  >
                    {form.isPublished
                      ? "Accepting responses. Unpublish to pause."
                      : "Publish to make your form live at the URL above."}
                  </p>
                </div>

                {/* Questions summary */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 500,
                      color: M,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Questions
                  </label>
                  <p style={{ fontSize: 13, color: B, margin: 0 }}>
                    {form.questions.length === 0
                      ? "No questions added yet."
                      : `${form.questions.length} question${form.questions.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .builder-back-link:hover {
          background: rgba(107,26,42,0.06);
          border-color: rgba(107,26,42,0.28) !important;
        }
        .builder-back-link:focus-visible {
          outline: 2px solid rgba(107,26,42,0.4);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
