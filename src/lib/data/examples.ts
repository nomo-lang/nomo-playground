// Curated examples are framework-neutral and mirror compiler fixtures.
export type ExampleId = "hello" | "arithmetic" | "struct-methods" | "array";

export type Example = {
  id: ExampleId;
  title: string;
  description: string;
  focus: string;
  source: string;
};

export const examples: Example[] = [
  {
    id: "hello",
    title: "Hello, Nomo",
    description: "Inference, three-clause loops, and multi-value output.",
    focus: "Basics",
    source: `package app.main

import std.io

fn greeting() -> string {
    return "Hello, Nomo"
}

fn main() -> void {
    let message = greeting()

    for let i: ui64 = 0; i < 10; i++ {
        io.println(message, i)
    }
}
`,
  },
  {
    id: "arithmetic",
    title: "Arithmetic",
    description: "Integer expressions, precedence, and conversion.",
    focus: "Values",
    source: `package app.main

import std.io
import std.num

fn main() -> void {
    let total: i64 = (12 + 6) * 2 - 9 / 3 % 2
    let negated: i64 = -total
    io.println(num.to_string(total))
    io.println(num.to_string(negated))
}
`,
  },
  {
    id: "struct-methods",
    title: "Struct methods",
    description: "A typed record with an explicit implementation block.",
    focus: "Types",
    source: `package app.main

import std.io

struct User {
    email: string
}

impl User {
    pub fn get_email(self) -> string {
        return self.email
    }
}

fn main() -> void {
    let user: User = User { email: "a@nomo.dev" }
    let email: string = user.get_email()
    io.println(email)
}
`,
  },
  {
    id: "array",
    title: "Array values",
    description: "Mutation, Option, match, and expression-oriented branches.",
    focus: "Control flow",
    source: `package app.main

import std.array
import std.io

fn main() -> void {
    let mut items: Array<i32> = Array.new<i32>()
    items.push(1)
    items.push(2)
    items.set(0, 7)
    let first: Option<i32> = items.get(0)
    let message: string = match first {
        Some(value) => if value == 7 {
            "array ok"
        } else {
            "wrong"
        }
        None => "missing"
    }
    io.println(message)
}
`,
  },
];

export const defaultExample = examples[0];

export function findExample(id: string | undefined) {
  return examples.find((example) => example.id === id);
}
