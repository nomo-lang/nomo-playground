import type { ExampleId } from "./data/examples";
import { m } from "./paraglide/messages.js";
import { getLocale, type Locale } from "./paraglide/runtime";

export function getPlaygroundCopy(locale: Locale = getLocale()) {
  const options = { locale };
  const noInputs = {};

  const examples: Record<
    ExampleId,
    { title: string; description: string; focus: string }
  > = {
    hello: {
      title: m.example_hello_title(noInputs, options),
      description: m.example_hello_description(noInputs, options),
      focus: m.example_hello_focus(noInputs, options),
    },
    arithmetic: {
      title: m.example_arithmetic_title(noInputs, options),
      description: m.example_arithmetic_description(noInputs, options),
      focus: m.example_arithmetic_focus(noInputs, options),
    },
    "struct-methods": {
      title: m.example_struct_methods_title(noInputs, options),
      description: m.example_struct_methods_description(noInputs, options),
      focus: m.example_struct_methods_focus(noInputs, options),
    },
    array: {
      title: m.example_array_title(noInputs, options),
      description: m.example_array_description(noInputs, options),
      focus: m.example_array_focus(noInputs, options),
    },
  };

  return {
    meta: {
      title: m.meta_title(noInputs, options),
      description: m.meta_description(noInputs, options),
      ogDescription: m.meta_og_description(noInputs, options),
    },
    switchLanguage: m.switch_language(noInputs, options),
    skip: m.skip(noInputs, options),
    browserPreview: m.browser_preview(noInputs, options),
    nav: [
      m.nav_docs(noInputs, options),
      m.nav_github(noInputs, options),
      m.nav_install(noInputs, options),
    ],
    navLabel: m.nav_label(noInputs, options),
    phase: m.phase(noInputs, options),
    phaseNote: m.phase_note(noInputs, options),
    getCompiler: m.get_compiler(noInputs, options),
    examplesLabel: m.examples_label(noInputs, options),
    examples,
    selectedExample: m.selected_example(noInputs, options),
    viewUpstream: m.view_upstream(noInputs, options),
    example: m.example(noInputs, options),
    editedLabel: m.edited_label(noInputs, options),
    editorActions: m.editor_actions(noInputs, options),
    actions: [
      m.action_format(noInputs, options),
      m.action_check(noInputs, options),
      m.action_run(noInputs, options),
      m.action_copy(noInputs, options),
    ],
    editorLabel: m.editor_label(noInputs, options),
    structureValid: m.structure_valid(noInputs, options),
    cursor: (line: number, column: number) =>
      m.cursor({ line, column }, options),
    errorCount: (count: number) =>
      count === 1
        ? m.error_count_one({ count }, options)
        : m.error_count_many({ count }, options),
    resultsLabel: m.results_label(noInputs, options),
    tabs: [
      m.tab_output(noInputs, options),
      m.tab_problems(noInputs, options),
    ],
    programOutput: m.program_output(noInputs, options),
    statuses: {
      success: m.status_success(noInputs, options),
      preview: m.status_preview(noInputs, options),
      error: m.status_error(noInputs, options),
    },
    realBuild: m.real_build(noInputs, options),
    realBuildNote: m.real_build_note(noInputs, options),
    downloadPreview: m.download_preview(noInputs, options),
    noProblems: m.no_problems(noInputs, options),
    noProblemsNote: m.no_problems_note(noInputs, options),
    location: (line: number, column: number) =>
      m.location({ line, column }, options),
    footer: [
      m.footer_phase(noInputs, options),
      m.footer_privacy(noInputs, options),
      m.footer_issue(noInputs, options),
    ],
    notices: {
      ready: m.notice_ready(noInputs, options),
      shared: m.notice_shared(noInputs, options),
      edited: m.notice_edited(noInputs, options),
      loaded: (title: string) => m.notice_loaded({ title }, options),
      checked: (count: number) => {
        if (count === 0) return m.notice_checked_none(noInputs, options);
        return count === 1
          ? m.notice_checked_one({ count }, options)
          : m.notice_checked_many({ count }, options);
      },
      formatted: m.notice_formatted(noInputs, options),
      blocked: m.notice_blocked(noInputs, options),
      complete: m.notice_complete(noInputs, options),
      copied: m.notice_copied(noInputs, options),
    },
    diagnostics: {
      unexpectedClosing: (character: string) =>
        m.diagnostic_unexpected_closing({ character }, options),
      unclosedString: m.diagnostic_unclosed_string(noInputs, options),
      unmatchedOpening: (character: string) =>
        m.diagnostic_unmatched_opening({ character }, options),
      package: m.diagnostic_package(noInputs, options),
      main: m.diagnostic_main(noInputs, options),
      duplicateImport: (name: string, line: number) =>
        m.diagnostic_duplicate_import({ name, line }, options),
      semicolon: m.diagnostic_semicolon(noInputs, options),
    },
    run: {
      blockedOutput: (count: number) =>
        count === 1
          ? m.run_blocked_output_one({ count }, options)
          : m.run_blocked_output_many({ count }, options),
      blockedNote: m.run_blocked_note(noInputs, options),
      fixture: (title: string) => m.run_fixture({ title }, options),
      literalNote: m.run_literal_note(noInputs, options),
      noOutput: m.run_no_output(noInputs, options),
      cliNote: m.run_cli_note(noInputs, options),
    },
  };
}
