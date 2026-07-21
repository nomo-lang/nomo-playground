import type { ExampleId } from "$lib/data/examples";

export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function toLocale(value: string | undefined): Locale {
  return value === "zh" ? "zh" : defaultLocale;
}

export function localeFromPathname(pathname: string): Locale {
  return pathname === "/zh" || pathname.startsWith("/zh/")
    ? "zh"
    : defaultLocale;
}

export function localeHref(locale: Locale, search = "") {
  const pathname = locale === defaultLocale ? "/" : `/${locale}/`;
  return `${pathname}${search}`;
}

const exampleCopy: Record<
  Locale,
  Record<ExampleId, { title: string; description: string; focus: string }>
> = {
  en: {
    hello: {
      title: "Hello, Nomo",
      description: "Functions, typed bindings, and standard output.",
      focus: "Basics",
    },
    arithmetic: {
      title: "Arithmetic",
      description: "Integer expressions, precedence, and conversion.",
      focus: "Values",
    },
    "struct-methods": {
      title: "Struct methods",
      description: "A typed record with an explicit implementation block.",
      focus: "Types",
    },
    array: {
      title: "Array values",
      description: "Mutation, Option, match, and expression-oriented branches.",
      focus: "Control flow",
    },
  },
  zh: {
    hello: {
      title: "你好，Nomo",
      description: "函数、带类型的绑定与标准输出。",
      focus: "基础",
    },
    arithmetic: {
      title: "算术运算",
      description: "整数表达式、优先级与类型转换。",
      focus: "值",
    },
    "struct-methods": {
      title: "结构体方法",
      description: "带有显式实现块的类型化记录。",
      focus: "类型",
    },
    array: {
      title: "数组值",
      description: "可变操作、Option、match 与面向表达式的分支。",
      focus: "控制流",
    },
  },
};

export const messages = {
  en: {
    meta: {
      title: "Nomo Playground",
      description:
        "Explore real Nomo syntax with structural diagnostics, formatting, curated output, and shareable source links.",
      ogDescription:
        "A fast, install-free way to explore the Nomo programming language.",
    },
    switchLanguage: "中文",
    skip: "Skip to editor",
    browserPreview: "Browser preview",
    nav: ["Docs", "GitHub", "Install Nomo"],
    navLabel: "Playground links",
    phase: "PHASE 1",
    phaseNote:
      "Local structural checker + curated runner. Full compilation requires the native Nomo CLI.",
    getCompiler: "Get the compiler",
    examplesLabel: "Examples",
    examples: exampleCopy.en,
    selectedExample: "SELECTED EXAMPLE",
    viewUpstream: "View upstream",
    example: "Example",
    editedLabel: "Edited",
    editorActions: "Editor actions",
    actions: ["Format", "Check", "Run example", "Copy link"],
    editorLabel: "Nomo source editor",
    structureValid: "Structure valid",
    cursor: (line: number, column: number) => `Ln ${line}, Col ${column}`,
    errorCount: (count: number) => `${count} error${count === 1 ? "" : "s"}`,
    resultsLabel: "Playground results",
    tabs: ["Output", "Problems"],
    programOutput: "PROGRAM OUTPUT",
    statuses: { success: "success", preview: "preview", error: "error" },
    realBuild: "NEED THE REAL BUILD?",
    realBuildNote:
      "Compile arbitrary source to readable C99 and a native binary with the Nomo CLI.",
    downloadPreview: "Download preview",
    noProblems: "No structural problems",
    noProblemsNote:
      "The browser checker found a package, a runnable main function, and balanced syntax.",
    location: (line: number, column: number) =>
      `line ${line}, column ${column}`,
    footer: [
      "Nomo Playground · Phase 1",
      "Local analysis only — no source leaves your browser",
      "Report an issue ↗",
    ],
    notices: {
      ready: "Ready",
      shared: "Loaded shared source",
      edited: "Edited",
      loaded: (title: string) => `Loaded ${title}`,
      checked: (count: number) =>
        count === 0
          ? "Check complete — no structural errors"
          : `Check complete — ${count} error${count === 1 ? "" : "s"}`,
      formatted: "Formatted",
      blocked: "Run blocked by errors",
      complete: "Preview complete",
      copied: "Share link copied",
    },
    diagnostics: {
      unexpectedClosing: (character: string) =>
        `Unexpected closing '${character}'.`,
      unclosedString: "String literal is not closed.",
      unmatchedOpening: (character: string) =>
        `Opening '${character}' has no matching close.`,
      package: "A Nomo file starts with a package declaration.",
      main: "This runnable example needs fn main() with a return type.",
      duplicateImport: (name: string, line: number) =>
        `Duplicate import '${name}' (first imported on line ${line}).`,
      semicolon: "Nomo statements do not require semicolons.",
    },
    run: {
      blockedOutput: (count: number) =>
        `${count} error${count === 1 ? "" : "s"} — run Check for details.`,
      blockedNote: "Execution is blocked until structural errors are fixed.",
      fixture: (title: string) => `Curated browser fixture · ${title}`,
      literalNote: "Local literal-output preview · not the native Nomo compiler",
      noOutput: "No browser-runnable literal output found.",
      cliNote: "Use the Nomo CLI to compile and run arbitrary source.",
    },
  },
  zh: {
    meta: {
      title: "Nomo 在线体验",
      description: "使用结构诊断、格式化、精选输出和可分享源码链接探索真实的 Nomo 语法。",
      ogDescription: "无需安装，快速体验 Nomo 编程语言。",
    },
    switchLanguage: "EN",
    skip: "跳到编辑器",
    browserPreview: "浏览器预览",
    nav: ["文档", "GitHub", "安装 Nomo"],
    navLabel: "Playground 链接",
    phase: "阶段 1",
    phaseNote: "本地结构检查器与精选运行器。完整编译需要原生 Nomo CLI。",
    getCompiler: "获取编译器",
    examplesLabel: "示例",
    examples: exampleCopy.zh,
    selectedExample: "当前示例",
    viewUpstream: "查看上游源码",
    example: "示例",
    editedLabel: "已编辑",
    editorActions: "编辑器操作",
    actions: ["格式化", "检查", "运行示例", "复制链接"],
    editorLabel: "Nomo 源码编辑器",
    structureValid: "结构有效",
    cursor: (line: number, column: number) => `行 ${line}，列 ${column}`,
    errorCount: (count: number) => `${count} 个错误`,
    resultsLabel: "Playground 结果",
    tabs: ["输出", "问题"],
    programOutput: "程序输出",
    statuses: { success: "成功", preview: "预览", error: "错误" },
    realBuild: "需要真实构建？",
    realBuildNote: "使用 Nomo CLI 将任意源码编译为可读 C99 和原生二进制文件。",
    downloadPreview: "下载预览版",
    noProblems: "没有结构问题",
    noProblemsNote: "浏览器检查器找到了包声明、可运行的 main 函数以及配对的语法结构。",
    location: (line: number, column: number) => `第 ${line} 行，第 ${column} 列`,
    footer: [
      "Nomo Playground · 阶段 1",
      "仅在本地分析——源码不会离开你的浏览器",
      "报告问题 ↗",
    ],
    notices: {
      ready: "就绪",
      shared: "已加载分享的源码",
      edited: "已编辑",
      loaded: (title: string) => `已加载${title}`,
      checked: (count: number) =>
        count === 0 ? "检查完成——没有结构错误" : `检查完成——${count} 个错误`,
      formatted: "已格式化",
      blocked: "存在错误，无法运行",
      complete: "预览完成",
      copied: "分享链接已复制",
    },
    diagnostics: {
      unexpectedClosing: (character: string) => `意外的闭合符号“${character}”。`,
      unclosedString: "字符串字面量未闭合。",
      unmatchedOpening: (character: string) => `起始符号“${character}”没有匹配的闭合符号。`,
      package: "Nomo 文件必须以 package 声明开头。",
      main: "可运行示例需要带返回类型的 fn main()。",
      duplicateImport: (name: string, line: number) =>
        `重复导入“${name}”（首次导入位于第 ${line} 行）。`,
      semicolon: "Nomo 语句不需要分号。",
    },
    run: {
      blockedOutput: (count: number) => `${count} 个错误——请运行“检查”查看详情。`,
      blockedNote: "修复结构错误后才能执行。",
      fixture: (title: string) => `精选浏览器示例 · ${title}`,
      literalNote: "本地字面量输出预览 · 并非原生 Nomo 编译器",
      noOutput: "没有找到可在浏览器中运行的字面量输出。",
      cliNote: "请使用 Nomo CLI 编译并运行任意源码。",
    },
  },
} as const;
