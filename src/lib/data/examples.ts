// Curated examples are framework-neutral and mirror compiler fixtures.
export type ExampleId =
  | "hello"
  | "arithmetic"
  | "struct-methods"
  | "array"
  | "game-of-life"
  | "fibonacci-closure"
  | "peano-integers"
  | "concurrent-pi"
  | "concurrent-prime-sieve"
  | "peg-solitaire"
  | "tree-comparison"
  | "clear-screen"
  | "http-server"
  | "display-image"
  | "multiple-files"
  | "sleep"
  | "test-function"
  | "generic-index";

export type Example = {
  id: ExampleId;
  title: string;
  description: string;
  focus: string;
  source: string;
  upstreamPath?: string;
};

export const examples: Example[] = [
  {
    id: "hello",
    title: "Hello, Nomo",
    description: "Inference, checked formatting, and three-clause loops.",
    focus: "Basics",
    upstreamPath: "hello",
    source: `package app.main

import std.fmt
import std.io

fn greeting() -> string {
    return "Hello, Nomo"
}

fn main() -> void {
    let message = greeting()

    for let i: ui64 = 0; i < 10; i++ {
        io.println(fmt.format("{} {}", message, i))
    }
}
`,
  },
  {
    id: "arithmetic",
    title: "Arithmetic",
    description: "Integer expressions, precedence, and conversion.",
    focus: "Values",
    upstreamPath: "operators_arithmetic",
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
    upstreamPath: "struct_methods",
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
    upstreamPath: "array_basic",
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
  {
    id: "game-of-life",
    title: "Conway's Game of Life",
    description: "Evolves a five-by-five blinker with arrays and nested loops.",
    focus: "Simulation",
    source: `package app.main

import std.array
import std.fmt
import std.io

fn cell(board: Array<i32>, x: i64, y: i64) -> i32 {
    let safe_x: i64 = if x < 0 { 0 } else { x }
    let safe_y: i64 = if y < 0 { 0 } else { y }
    let index: u64 = (safe_y * 5 + safe_x) as u64
    let value: Option<i32> = if x < 0 || x >= 5 || y < 0 || y >= 5 {
        None
    } else {
        board.get(index)
    }
    return match value {
        Some(alive) => alive
        None => 0
    }
}

fn evolve(board: Array<i32>) -> Array<i32> {
    let mut next: Array<i32> = Array.new<i32>()
    for let y: i64 = 0; y < 5; y++ {
        for let x: i64 = 0; x < 5; x++ {
            let mut neighbors: i32 = 0
            for let dy: i64 = -1; dy <= 1; dy++ {
                for let dx: i64 = -1; dx <= 1; dx++ {
                    neighbors += if dx != 0 || dy != 0 {
                        cell(board, x + dx, y + dy)
                    } else {
                        0
                    }
                }
            }

            let alive: i32 = cell(board, x, y)
            let value: i32 = if alive == 1 {
                if neighbors == 2 || neighbors == 3 {
                    1
                } else {
                    0
                }
            } else {
                if neighbors == 3 {
                    1
                } else {
                    0
                }
            }
            next.push(value)
        }
    }
    return next
}

fn render(board: Array<i32>) -> void {
    for let y: i64 = 0; y < 5; y++ {
        let mut row: string = ""
        for let x: i64 = 0; x < 5; x++ {
            row = if cell(board, x, y) == 1 {
                fmt.format("{}#", row)
            } else {
                fmt.format("{}.", row)
            }
        }
        io.println(row)
    }
}

fn main() -> void {
    let mut board: Array<i32> = Array.new<i32>()
    for let index: i64 = 0; index < 25; index++ {
        let value: i32 = if index == 11 || index == 12 || index == 13 {
            1
        } else {
            0
        }
        board.push(value)
    }
    render(evolve(board))
}
`,
  },
  {
    id: "fibonacci-closure",
    title: "Fibonacci Closure",
    description:
      "Models captured closure state explicitly until first-class closures arrive.",
    focus: "State",
    upstreamPath: "mut_methods",
    source: `package app.main

import std.fmt
import std.io

struct Fibonacci {
    current: u64
    next: u64
}

impl Fibonacci {
    fn take(mut self) -> u64 {
        let value: u64 = self.current
        let following: u64 = self.current + self.next
        self.current = self.next
        self.next = following
        return value
    }
}

fn main() -> void {
    let mut fibonacci: Fibonacci = Fibonacci { current: 0, next: 1 }
    let mut output: string = ""
    for let index: u64 = 0; index < 10; index++ {
        let value: u64 = fibonacci.take()
        output = if index == 0 {
            fmt.format("{}", value)
        } else {
            fmt.format("{} {}", output, value)
        }
    }
    io.println(output)
}
`,
  },
  {
    id: "peano-integers",
    title: "Peano Integers",
    description: "Builds addition from repeated successor operations.",
    focus: "Data model",
    source: `package app.main

import std.io

struct Peano {
    successors: u64
}

impl Peano {
    fn succ(mut self) -> void {
        self.successors++
    }

    fn value(self) -> u64 {
        return self.successors
    }
}

fn add(left: Peano, right: Peano) -> Peano {
    let mut total: Peano = left
    for let step: u64 = 0; step < right.value(); step++ {
        total.succ()
    }
    return total
}

fn main() -> void {
    let two: Peano = Peano { successors: 2 }
    let three: Peano = Peano { successors: 3 }
    let five: Peano = add(two, three)
    io.println(five.value())
}
`,
  },
  {
    id: "concurrent-pi",
    title: "Concurrent pi",
    description:
      "Uses deterministic worker partitions; each lane can become a native task later.",
    focus: "Work partitioning",
    upstreamPath: "operators_arithmetic",
    source: `package app.main

import std.fmt
import std.io

fn partial_sum(worker: u64) -> f64 {
    let mut sum: f64 = 0.0
    for let index: u64 = worker; index < 1000; index += 4 {
        let denominator: f64 = (index * 2 + 1) as f64
        let term: f64 = 1.0 / denominator
        sum += if index % 2 == 0 {
            term
        } else {
            -term
        }
    }
    return sum
}

fn main() -> void {
    let mut total: f64 = 0.0
    for let worker: u64 = 0; worker < 4; worker++ {
        total += partial_sum(worker)
    }
    io.println(fmt.format("pi ~= {}", total * 4.0))
}
`,
  },
  {
    id: "concurrent-prime-sieve",
    title: "Concurrent Prime Sieve",
    description:
      "Separates sieve stages into deterministic chunks suitable for future workers.",
    focus: "Algorithms",
    upstreamPath: "array_basic",
    source: `package app.main

import std.array
import std.fmt
import std.io
import std.string

fn flag(values: Array<bool>, index: u64) -> bool {
    let value: Option<bool> = values.get(index)
    return match value {
        Some(enabled) => enabled
        None => false
    }
}

fn main() -> void {
    let limit: u64 = 40
    let mut prime: Array<bool> = Array.new<bool>()
    for let index: u64 = 0; index <= 40; index++ {
        prime.push(true)
    }
    prime.set(0, false)
    prime.set(1, false)

    for let candidate: u64 = 2; candidate * candidate <= 40; candidate++ {
        for let multiple: u64 = candidate * candidate; multiple <= 40; multiple++ {
            let keep: bool = flag(prime, multiple) && (!flag(prime, candidate) || multiple % candidate != 0)
            prime.set(multiple, keep)
        }
    }

    let mut output: string = ""
    for let value: u64 = 2; value <= 40; value++ {
        output = if flag(prime, value) {
            if output.is_empty() {
                fmt.format("{}", value)
            } else {
                fmt.format("{} {}", output, value)
            }
        } else {
            output
        }
    }
    io.println(output)
}
`,
  },
  {
    id: "peg-solitaire",
    title: "Peg Solitaire Solver",
    description: "Backtracks over a compact one-dimensional solitaire board.",
    focus: "Search",
    upstreamPath: "array_value_semantics",
    source: `package app.main

import std.array
import std.io

fn peg(board: Array<bool>, index: u64) -> bool {
    let value: Option<bool> = board.get(index)
    return match value {
        Some(occupied) => occupied
        None => false
    }
}

fn peg_count(board: Array<bool>) -> u64 {
    let mut count: u64 = 0
    for let index: u64 = 0; index < board.len(); index++ {
        count += if peg(board, index) {
            1
        } else {
            0
        }
    }
    return count
}

fn moved(board: Array<bool>, from: u64, over: u64, target: u64) -> Array<bool> {
    let mut next: Array<bool> = board
    next.set(from, false)
    next.set(over, false)
    next.set(target, true)
    return next
}

fn continue_search(result: i64, board: Array<bool>, depth: i64, from: u64) -> i64 {
    if result >= 0 {
        result
    } else {
        solve(board, depth, from + 1)
    }
}

fn solve(board: Array<bool>, depth: i64, from: u64) -> i64 {
    if peg_count(board) == 1 {
        depth
    } else {
        if depth >= 6 || from >= board.len() {
            -1
        } else {
            if peg(board, from) && from + 2 < board.len() && peg(board, from + 1) && !peg(board, from + 2) {
                continue_search(
                    solve(moved(board, from, from + 1, from + 2), depth + 1, 0),
                    board,
                    depth,
                    from
                )
            } else {
                if peg(board, from) && from >= 2 && peg(board, from - 1) && !peg(board, from - 2) {
                    continue_search(
                        solve(moved(board, from, from - 1, from - 2), depth + 1, 0),
                        board,
                        depth,
                        from
                    )
                } else {
                    solve(board, depth, from + 1)
                }
            }
        }
    }
}

fn main() -> void {
    let mut board: Array<bool> = Array.new<bool>()
    board.push(false)
    board.push(true)
    board.push(false)
    board.push(true)
    board.push(true)
    io.println("solution moves:", solve(board, 0, 0))
}
`,
  },
  {
    id: "tree-comparison",
    title: "Tree Comparison",
    description: "Recursively compares trees stored behind Array boundaries.",
    focus: "Recursion",
    upstreamPath: "array_struct",
    source: `package app.main

import std.array
import std.io

struct Tree {
    value: i64
    children: Array<Tree>
}

fn leaf(value: i64) -> Tree {
    let children: Array<Tree> = Array.new<Tree>()
    return Tree { value: value, children: children }
}

fn branch(value: i64, left: Tree, right: Tree) -> Tree {
    let mut children: Array<Tree> = Array.new<Tree>()
    children.push(left)
    children.push(right)
    return Tree { value: value, children: children }
}

fn both(left: bool, right: bool) -> bool {
    if left {
        right
    } else {
        false
    }
}

fn same_tree(left: Tree, right: Tree) -> bool {
    let left_children: Array<Tree> = left.children
    let right_children: Array<Tree> = right.children
    let left_size: u64 = left_children.len()
    let right_size: u64 = right_children.len()
    let same_value: bool = if left.value == right.value {
        true
    } else {
        false
    }
    let same_size: bool = if left_size == right_size {
        true
    } else {
        false
    }
    let mut equal: bool = both(same_value, same_size)
    for let index: u64 = 0; index < left_size; index++ {
        let left_child: Option<Tree> = left_children.get(index)
        let right_child: Option<Tree> = right_children.get(index)
        let same: bool = match left_child {
            Some(a) => match right_child {
                Some(b) => same_tree(a, b)
                None => false
            }
            None => false
        }
        equal = both(equal, same)
    }
    return equal
}

fn main() -> void {
    let left: Tree = branch(1, leaf(2), leaf(3))
    let same: Tree = branch(1, leaf(2), leaf(3))
    let different: Tree = branch(1, leaf(2), leaf(4))
    io.println("left == same:", same_tree(left, same))
    io.println("left == different:", same_tree(left, different))
}
`,
  },
  {
    id: "clear-screen",
    title: "Clear Screen",
    description:
      "Uses a portable newline fallback because browser output is not a terminal.",
    focus: "Terminal",
    upstreamPath: "io_print",
    source: `package app.main

import std.io

fn clear_screen() -> void {
    // Native terminal backends can replace this with an ANSI-aware helper.
    for let line: u64 = 0; line < 8; line++ {
        io.println("")
    }
}

fn main() -> void {
    io.println("old frame")
    clear_screen()
    io.println("new frame")
}
`,
  },
  {
    id: "http-server",
    title: "HTTP Server",
    description:
      "Runs a pure request handler; native code can connect it to std.http.listen.",
    focus: "Server core",
    upstreamPath: "std_http",
    source: `package app.main

import std.fmt
import std.io

struct Request {
    method: string
    path: string
}

struct Response {
    status: u32
    body: string
}

impl fmt.Display for Response {
    fn to_string(self) -> string {
        return fmt.format("HTTP {}\\n\\n{}", self.status, self.body)
    }
}

fn handle(request: Request) -> Response {
    return if request.method == "GET" && request.path == "/hello" {
        Response { status: 200, body: "Hello from Nomo" }
    } else {
        Response { status: 404, body: "Not found" }
    }
}

fn main() -> void {
    // A native project feeds requests from http.accept into this handler.
    let request: Request = Request { method: "GET", path: "/hello" }
    io.println(handle(request))
}
`,
  },
  {
    id: "display-image",
    title: "Display Image",
    description: "Renders a small monochrome image with Unicode block pixels.",
    focus: "Output",
    upstreamPath: "io_print",
    source: `package app.main

import std.array
import std.io

fn main() -> void {
    let mut image: Array<string> = Array.new<string>()
    image.push("  ██  ██  ")
    image.push("██████████")
    image.push("██████████")
    image.push("  ██████  ")
    image.push("    ██    ")

    for row in image {
        io.println(row)
    }
}
`,
  },
  {
    id: "multiple-files",
    title: "Multiple Files",
    description:
      "Marks project file boundaries in one buffer; the CLI loads them as modules.",
    focus: "Project layout",
    upstreamPath: "workspace_basic",
    source: `package app.main

import std.io

// src/math.nomo
// package app.math
fn add(left: i64, right: i64) -> i64 {
    return left + right
}

// src/banner.nomo
// package app.banner
fn banner() -> string {
    return "multiple files"
}

// src/main.nomo would import app.math and app.banner.
fn main() -> void {
    io.println(banner(), add(20, 22))
}
`,
  },
  {
    id: "sleep",
    title: "Sleep",
    description:
      "Shows deterministic scheduling; native code can replace ticks with time.sleep.",
    focus: "Timing",
    upstreamPath: "std_time",
    source: `package app.main

import std.io

fn main() -> void {
    // Browser WASM has no host clock. Native equivalent:
    // time.sleep_millis(250)
    for let remaining: i64 = 3; remaining > 0; remaining-- {
        io.println("tick", remaining)
    }
    io.println("awake")
}
`,
  },
  {
    id: "test-function",
    title: "Test Function",
    description: "Defines a #[test] and calls it in the sandbox demonstration.",
    focus: "Testing",
    upstreamPath: "nomo_test_basic",
    source: `package app.main

import std.io
import std.testing

fn fibonacci(value: u64) -> u64 {
    if value < 2 {
        value
    } else {
        fibonacci(value - 1) + fibonacci(value - 2)
    }
}

#[test]
fn fibonacci_of_ten() -> void {
    testing.assert_equal(fibonacci(10), 55 as u64)
}

fn main() -> void {
    fibonacci_of_ten()
    io.println("test passed; run all tests with nomo test")
}
`,
  },
  {
    id: "generic-index",
    title: "Generic index",
    description: "Implements one bounds-checked index helper for every Array<T>.",
    focus: "Generics",
    upstreamPath: "generic_function",
    source: `package app.main

import std.array
import std.io

fn index<T>(values: Array<T>, position: u64) -> Option<T> {
    return values.get(position)
}

fn main() -> void {
    let mut languages: Array<string> = Array.new<string>()
    languages.push("Nomo")
    languages.push("Rust")

    let selected: Option<string> = index<string>(languages, 0)
    let message: string = match selected {
        Some(value) => value
        None => "out of bounds"
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
