import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  UserProfile,
  CodingProblem,
  HiddenTestCase,
  LanguageTrack,
  Submission,
  ProblemProgress,
  Bookmark,
  DailyChallenge,
  Achievement,
  UserAchievement,
  LeaderboardEntry,
} from './types.ts';

interface DatabaseData {
  profiles: UserProfile[];
  languages: LanguageTrack[];
  problems: CodingProblem[];
  hidden_test_cases: HiddenTestCase[];
  submissions: Submission[];
  problem_progress: ProblemProgress[];
  bookmarks: Bookmark[];
  daily_challenges: DailyChallenge[];
  achievements: Achievement[];
  user_achievements: UserAchievement[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseData = {
    profiles: [],
    languages: [],
    problems: [],
    hidden_test_cases: [],
    submissions: [],
    problem_progress: [],
    bookmarks: [],
    daily_challenges: [],
    achievements: [],
    user_achievements: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed to parse existing database file, reseeding:', err);
      }
    }

    this.seedInitialData();
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('AdminPass123!', salt);
    const studentPasswordHash = bcrypt.hashSync('StudentPass123!', salt);

    // 1. Initial Profiles
    const adminUser: UserProfile = {
      id: 'usr_admin_01',
      email: 'admin@codearena.dev',
      password_hash: adminPasswordHash,
      full_name: 'Professor Alan Turing',
      college_name: 'MIT',
      department: 'Computer Science & Engineering',
      year_of_study: 'Faculty / Admin',
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    const studentUser: UserProfile = {
      id: 'usr_alex_02',
      email: 'alex.dev@college.edu',
      password_hash: studentPasswordHash,
      full_name: 'Alex Rivera',
      college_name: 'Stanford University',
      department: 'Software Engineering',
      year_of_study: '3rd Year',
      role: 'student',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    };

    const studentUser2: UserProfile = {
      id: 'usr_priya_03',
      email: 'priya.sharma@iit.ac.in',
      password_hash: studentPasswordHash,
      full_name: 'Priya Sharma',
      college_name: 'IIT Bombay',
      department: 'Computer Science',
      year_of_study: '4th Year',
      role: 'student',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    };

    const studentUser3: UserProfile = {
      id: 'usr_marcus_04',
      email: 'marcus.chen@berkeley.edu',
      password_hash: studentPasswordHash,
      full_name: 'Marcus Chen',
      college_name: 'UC Berkeley',
      department: 'Electrical Engineering & CS',
      year_of_study: '2nd Year',
      role: 'student',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    };

    this.data.profiles = [adminUser, studentUser, studentUser2, studentUser3];

    // 2. Languages
    this.data.languages = [
      {
        id: 'lang_python',
        name: 'Python',
        slug: 'python',
        editor_mode: 'python',
        execution_language_id: 'python3',
        icon: 'FileCode2',
        badge_color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        description: 'High-level, versatile language renowned for concise syntax, data science, and web development.',
        is_enabled: true,
        topics: [
          {
            title: 'Variables & Data Types',
            description: 'Primitives, numeric types, strings, type casting, and standard I/O.',
            difficulty: 'Easy',
            items: ['Integers, Floats, Strings', 'Booleans and NoneType', 'Input & Output Formatting'],
          },
          {
            title: 'Conditions & Loops',
            description: 'if-elif-else statements, for loops with range, while loops, and break/continue.',
            difficulty: 'Easy',
            items: ['Decision Making', 'For & While Iterations', 'List Comprehensions'],
          },
          {
            title: 'Functions & Modules',
            description: 'Defining functions, default arguments, *args/**kwargs, and lambda functions.',
            difficulty: 'Easy',
            items: ['Function Scope', 'Recursion Fundamentals', 'Lambda & Higher-Order Functions'],
          },
          {
            title: 'Data Structures',
            description: 'Lists, tuples, dictionaries, sets, and collections module.',
            difficulty: 'Medium',
            items: ['Dictionary Lookups', 'Set Operations', 'Stack and Queue implementations'],
          },
          {
            title: 'Object-Oriented Programming',
            description: 'Classes, dunder methods, inheritance, encapsulation, and polymorphism.',
            difficulty: 'Medium',
            items: ['Class Construction', 'Inheritance & Super', 'Encapsulation & Properties'],
          },
          {
            title: 'Algorithms & Advanced',
            description: 'Sorting, binary search, dynamic programming, and memoization.',
            difficulty: 'Hard',
            items: ['Divide and Conquer', 'Two Pointers & Sliding Window', 'Graph Traversals'],
          },
        ],
      },
      {
        id: 'lang_cpp',
        name: 'C++',
        slug: 'cpp',
        editor_mode: 'cpp',
        execution_language_id: 'gcc-13.2.0',
        icon: 'Cpu',
        badge_color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        description: 'Blazing-fast compiled language used widely in competitive programming, game engines, and systems.',
        is_enabled: true,
        topics: [
          {
            title: 'Variables & Operators',
            description: 'Data types, arithmetic and bitwise operators, cin/cout fast I/O.',
            difficulty: 'Easy',
            items: ['Basic Types & Overflow', 'Fast I/O with ios_base', 'Bitwise Manipulation'],
          },
          {
            title: 'Control Flow & Loops',
            description: 'Branching logic, nested loops, switch-case, and break/continue.',
            difficulty: 'Easy',
            items: ['Conditionals', 'Loop Constructs', 'Jump Statements'],
          },
          {
            title: 'Functions & Pointers',
            description: 'Pass by value vs reference, pointer arithmetic, and memory addressing.',
            difficulty: 'Medium',
            items: ['Pointers and Memory', 'Pass by Reference', 'Function Overloading'],
          },
          {
            title: 'Standard Template Library (STL)',
            description: 'Vectors, sets, maps, priority queues, and sorting algorithms.',
            difficulty: 'Medium',
            items: ['Vector & Deque', 'std::map and std::set', 'std::priority_queue & Heap'],
          },
          {
            title: 'Classes & OOP',
            description: 'Constructors, destructors, operator overloading, and inheritance.',
            difficulty: 'Medium',
            items: ['Encapsulation', 'Operator Overloading', 'Virtual Functions & Polymorphism'],
          },
          {
            title: 'Advanced Competitive Programming',
            description: 'Segment trees, Fenwick trees, binary lifting, and DP with bitmasks.',
            difficulty: 'Hard',
            items: ['Graph & Trees', 'Dynamic Programming', 'Disjoint Set Union (DSU)'],
          },
        ],
      },
      {
        id: 'lang_c',
        name: 'C',
        slug: 'c',
        editor_mode: 'c',
        execution_language_id: 'gcc-13.2.0-c',
        icon: 'Code',
        badge_color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        description: 'The mother of modern languages. Master pointers, manual memory allocation, and hardware closeness.',
        is_enabled: true,
        topics: [
          {
            title: 'Data Types & I/O',
            description: 'printf, scanf, format specifiers, type modifiers, and preprocessor directives.',
            difficulty: 'Easy',
            items: ['Format Specifiers', 'Primitive Memory Sizes', 'Preprocessor Macros'],
          },
          {
            title: 'Control Structures',
            description: 'if-else, while, do-while, and for loops with pattern problems.',
            difficulty: 'Easy',
            items: ['Nested Conditionals', 'Loop Optimization', 'Pattern Printing'],
          },
          {
            title: 'Pointers & Dynamic Memory',
            description: 'Address-of operator, pointer dereferencing, malloc, calloc, realloc, and free.',
            difficulty: 'Medium',
            items: ['Pointer Fundamentals', 'malloc and free', 'Memory Leaks & Valgrind Basics'],
          },
          {
            title: 'Structures & Unions',
            description: 'Custom user-defined types, nested structs, and typedef.',
            difficulty: 'Medium',
            items: ['struct Definitions', 'Pointers to Structs (->)', 'Memory Alignment'],
          },
          {
            title: 'Data Structures in C',
            description: 'Building linked lists, stacks, and binary trees from scratch with pointers.',
            difficulty: 'Hard',
            items: ['Singly Linked List', 'Doubly Linked List', 'Binary Search Tree'],
          },
        ],
      },
      {
        id: 'lang_html',
        name: 'HTML',
        slug: 'html',
        editor_mode: 'html',
        execution_language_id: 'html-preview',
        icon: 'Globe',
        badge_color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        description: 'Hypertext Markup Language. Build structured, accessible web pages with live sandboxed previews.',
        is_enabled: true,
        topics: [
          {
            title: 'Document Structure & Semantics',
            description: 'DOCTYPE, html, head, body, header, nav, main, section, article, footer.',
            difficulty: 'Easy',
            items: ['Semantic Hierarchy', 'Meta Tags & Head Information', 'Text Typography Tags'],
          },
          {
            title: 'Lists, Tables & Media',
            description: 'Ordered/unordered lists, tabular data structures, images, and audio/video.',
            difficulty: 'Easy',
            items: ['Nested Lists', 'Table Rows, Cols & Headers', 'Responsive Images & Figure'],
          },
          {
            title: 'Forms & Input Validation',
            description: 'Input types, form validation, labels, selects, textareas, and buttons.',
            difficulty: 'Medium',
            items: ['Form Controls', 'HTML5 Validation Attributes', 'Accessible Form Controls'],
          },
          {
            title: 'Web Components & Layout',
            description: 'Combining HTML with CSS Flexbox/Grid and interactive JavaScript scripts.',
            difficulty: 'Medium',
            items: ['Card Component Structure', 'Navigation Bars', 'Sandboxed IFrame Safety'],
          },
        ],
      },
      {
        id: 'lang_java',
        name: 'Java',
        slug: 'java',
        editor_mode: 'java',
        execution_language_id: 'openjdk-jdk-21+35',
        icon: 'Coffee',
        badge_color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        description: 'Robust, enterprise-grade, object-oriented language running on billions of devices worldwide.',
        is_enabled: true,
        topics: [
          {
            title: 'Basics & Syntax',
            description: 'Variables, primitive types, operators, and Scanner standard input.',
            difficulty: 'Easy',
            items: ['Primitive Types', 'Scanner I/O', 'Type Casting'],
          },
          {
            title: 'Methods & Arrays',
            description: 'Static methods, 1D and 2D arrays, method overloading, and recursion.',
            difficulty: 'Easy',
            items: ['Array Manipulation', 'Method Parameters & Return', 'Call Stack & Recursion'],
          },
          {
            title: 'OOP Fundamentals',
            description: 'Classes, objects, constructors, encapsulation, getters and setters.',
            difficulty: 'Medium',
            items: ['Constructors & this', 'Access Modifiers', 'Static vs Instance Members'],
          },
          {
            title: 'Inheritance & Interfaces',
            description: 'extends, implements, abstract classes, and polymorphism.',
            difficulty: 'Medium',
            items: ['Abstract Classes', 'Interface Contracts', 'Polymorphic Method Dispatch'],
          },
          {
            title: 'Java Collections Framework',
            description: 'ArrayList, LinkedList, HashMap, HashSet, and PriorityQueue.',
            difficulty: 'Medium',
            items: ['List & Set Implementations', 'Map Key-Value Store', 'Comparable & Comparator'],
          },
          {
            title: 'Exception Handling & Multithreading',
            description: 'try-catch-finally, custom exceptions, Thread class, and Runnable.',
            difficulty: 'Hard',
            items: ['Checked vs Unchecked Exceptions', 'Thread Basics', 'Stream API & Lambdas'],
          },
        ],
      },
    ];

    // 3. Coding Problems with starter code for Python, C++, C, Java, and HTML!
    this.data.problems = [
      {
        id: 'two-sum',
        title: 'Add Two Numbers',
        slug: 'two-sum',
        description:
          'Write a program that takes two integers $A$ and $B$ from standard input and prints their sum.\n\n### Task\nRead two space-separated integers $A$ and $B$, compute $A + B$, and output the result.',
        input_format: 'A single line containing two space-separated integers $A$ and $B$.',
        output_format: 'Print a single integer representing the sum $A + B$.',
        constraints: '-10^9 <= A, B <= 10^9',
        difficulty: 'Easy',
        topic_tags: ['Basics', 'Math'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: '# Read two space-separated integers\na, b = map(int, input().split())\nprint(a + b)\n',
          cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        cout << (a + b) << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n\nint main() {\n    long long a, b;\n    if (scanf("%lld %lld", &a, &b) == 2) {\n        printf("%lld\\n", a + b);\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextLong()) {\n            long a = scanner.nextLong();\n            long b = scanner.nextLong();\n            System.out.println(a + b);\n        }\n    }\n}\n',
        },
        sample_tests: [
          { input: '3 5', expected_output: '8', explanation: '3 + 5 = 8.' },
          { input: '-10 25', expected_output: '15', explanation: '-10 + 25 = 15.' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'even-or-odd',
        title: 'Even or Odd Number',
        slug: 'even-or-odd',
        description:
          'Given an integer $N$, determine whether the number is **Even** or **Odd**.\n\nPrint `Even` if the integer is divisible by 2 with remainder 0, otherwise print `Odd`.',
        input_format: 'A single integer $N$.',
        output_format: 'Print "Even" or "Odd" (without quotes).',
        constraints: '-10^9 <= N <= 10^9',
        difficulty: 'Easy',
        topic_tags: ['Basics', 'Conditionals'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 'n = int(input().strip())\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n',
          cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        if (n % 2 == 0) cout << "Even" << endl;\n        else cout << "Odd" << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        if (n % 2 == 0) printf("Even\\n");\n        else printf("Odd\\n");\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        System.out.println(n % 2 == 0 ? "Even" : "Odd");\n    }\n}\n',
        },
        sample_tests: [
          { input: '4', expected_output: 'Even', explanation: '4 is divisible by 2.' },
          { input: '7', expected_output: 'Odd', explanation: '7 leaves a remainder of 1 when divided by 2.' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 28 * 86400000).toISOString(),
      },
      {
        id: 'palindrome-check',
        title: 'Palindrome String Checker',
        slug: 'palindrome-check',
        description:
          'A palindrome is a word, phrase, or sequence that reads the same backward as forward.\n\nGiven a single string $S$ consisting of alphanumeric characters, determine if it is a palindrome. Case-sensitive.\n\nPrint `YES` if it is a palindrome, otherwise print `NO`.',
        input_format: 'A single string $S$ with no internal spaces.',
        output_format: 'Print "YES" or "NO".',
        constraints: '1 <= length(S) <= 10^5',
        difficulty: 'Easy',
        topic_tags: ['Strings', 'Two Pointers'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 's = input().strip()\nif s == s[::-1]:\n    print("YES")\nelse:\n    print("NO")\n',
          cpp: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        string rev = s;\n        reverse(rev.begin(), rev.end());\n        cout << (s == rev ? "YES" : "NO") << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf("%s", s) == 1) {\n        int len = strlen(s);\n        int is_pal = 1;\n        for (int i = 0; i < len / 2; i++) {\n            if (s[i] != s[len - 1 - i]) {\n                is_pal = 0;\n                break;\n            }\n        }\n        printf("%s\\n", is_pal ? "YES" : "NO");\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        String rev = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(rev) ? "YES" : "NO");\n    }\n}\n',
        },
        sample_tests: [
          { input: 'racecar', expected_output: 'YES', explanation: '"racecar" reversed is "racecar".' },
          { input: 'hello', expected_output: 'NO', explanation: '"hello" reversed is "olleh".' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: 'factorial',
        title: 'Factorial of a Number',
        slug: 'factorial',
        description:
          'Compute $N!$ (N factorial) for a non-negative integer $N$.\n\nRecall that $0! = 1$ and for $N > 0$, $N! = 1 \\times 2 \\times 3 \\times ... \\times N$.',
        input_format: 'A single non-negative integer $N$.',
        output_format: 'Print the value of $N!$.',
        constraints: '0 <= N <= 20',
        difficulty: 'Easy',
        topic_tags: ['Math', 'Recursion'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 'import math\nn = int(input().strip())\nprint(math.factorial(n))\n',
          cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        long long ans = 1;\n        for (int i = 2; i <= n; i++) ans *= i;\n        cout << ans << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        unsigned long long ans = 1;\n        for (int i = 2; i <= n; i++) ans *= i;\n        printf("%llu\\n", ans);\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long ans = 1;\n        for (int i = 2; i <= n; i++) ans *= i;\n        System.out.println(ans);\n    }\n}\n',
        },
        sample_tests: [
          { input: '5', expected_output: '120', explanation: '5! = 5 * 4 * 3 * 2 * 1 = 120.' },
          { input: '0', expected_output: '1', explanation: '0! is defined as 1.' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 22 * 86400000).toISOString(),
      },
      {
        id: 'fibonacci-sequence',
        title: 'Nth Fibonacci Number',
        slug: 'fibonacci-sequence',
        description:
          'The Fibonacci sequence is defined as:\n- $F(0) = 0$\n- $F(1) = 1$\n- $F(n) = F(n-1) + F(n-2)$ for $n \\ge 2$.\n\nGiven $N$, compute $F(N)$.',
        input_format: 'A single non-negative integer $N$.',
        output_format: 'Print the $N$-th Fibonacci number.',
        constraints: '0 <= N <= 50',
        difficulty: 'Medium',
        topic_tags: ['Dynamic Programming', 'Math'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 'n = int(input().strip())\nif n == 0:\n    print(0)\nelif n == 1:\n    print(1)\nelse:\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    print(b)\n',
          cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        if (n == 0) { cout << 0 << endl; return 0; }\n        if (n == 1) { cout << 1 << endl; return 0; }\n        long long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long long next = a + b;\n            a = b;\n            b = next;\n        }\n        cout << b << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        if (n == 0) { printf("0\\n"); return 0; }\n        if (n == 1) { printf("1\\n"); return 0; }\n        long long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long long next = a + b;\n            a = b;\n            b = next;\n        }\n        printf("%lld\\n", b);\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n == 0) { System.out.println(0); return; }\n        if (n == 1) { System.out.println(1); return; }\n        long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long c = a + b;\n            a = b;\n            b = c;\n        }\n        System.out.println(b);\n    }\n}\n',
        },
        sample_tests: [
          { input: '7', expected_output: '13', explanation: 'F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8, F(7)=13.' },
          { input: '10', expected_output: '55', explanation: 'F(10) is 55.' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'prime-number-check',
        title: 'Prime Number Detection',
        slug: 'prime-number-check',
        description:
          'A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.\n\nGiven an integer $N$, determine if it is a prime number. Output `PRIME` or `NOT PRIME`.',
        input_format: 'A single integer $N$.',
        output_format: 'Print "PRIME" or "NOT PRIME".',
        constraints: '1 <= N <= 10^9',
        difficulty: 'Easy',
        topic_tags: ['Math', 'Algorithms'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 'import math\n\ndef is_prime(n):\n    if n <= 1:\n        return False\n    if n <= 3:\n        return True\n    if n % 2 == 0 or n % 3 == 0:\n        return False\n    i = 5\n    while i * i <= n:\n        if n % i == 0 or n % (i + 2) == 0:\n            return False\n        i += 6\n    return True\n\nn = int(input().strip())\nprint("PRIME" if is_prime(n) else "NOT PRIME")\n',
          cpp: '#include <iostream>\nusing namespace std;\n\nbool isPrime(long long n) {\n    if (n <= 1) return false;\n    if (n <= 3) return true;\n    if (n % 2 == 0 || n % 3 == 0) return false;\n    for (long long i = 5; i * i <= n; i += 6) {\n        if (n % i == 0 || n % (i + 2) == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        cout << (isPrime(n) ? "PRIME" : "NOT PRIME") << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n#include <stdbool.h>\n\nbool isPrime(long long n) {\n    if (n <= 1) return false;\n    if (n <= 3) return true;\n    if (n % 2 == 0 || n % 3 == 0) return false;\n    for (long long i = 5; i * i <= n; i += 6) {\n        if (n % i == 0 || n % (i + 2) == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        printf("%s\\n", isPrime(n) ? "PRIME" : "NOT PRIME");\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    static boolean isPrime(long n) {\n        if (n <= 1) return false;\n        if (n <= 3) return true;\n        if (n % 2 == 0 || n % 3 == 0) return false;\n        for (long i = 5; i * i <= n; i += 6) {\n            if (n % i == 0 || n % (i + 2) == 0) return false;\n        }\n        return true;\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        System.out.println(isPrime(n) ? "PRIME" : "NOT PRIME");\n    }\n}\n',
        },
        sample_tests: [
          { input: '17', expected_output: 'PRIME', explanation: '17 is only divisible by 1 and 17.' },
          { input: '24', expected_output: 'NOT PRIME', explanation: '24 is divisible by 2, 3, 4, 6, 8, 12.' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
      },
      {
        id: 'find-largest-element',
        title: 'Find Maximum Element in Array',
        slug: 'find-largest-element',
        description:
          'Given an array of $N$ integers, find and print the maximum value in the array.',
        input_format: 'The first line contains an integer $N$.\nThe second line contains $N$ space-separated integers.',
        output_format: 'Print the maximum value present in the array.',
        constraints: '1 <= N <= 10^5\n-10^9 <= A[i] <= 10^9',
        difficulty: 'Easy',
        topic_tags: ['Arrays'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 'n = int(input().strip())\narr = list(map(int, input().split()))\nprint(max(arr))\n',
          cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        long long mx = -1e18;\n        for (int i = 0; i < n; i++) {\n            long long val;\n            cin >> val;\n            if (val > mx) mx = val;\n        }\n        cout << mx << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        long long max_val = -1000000000000000000LL;\n        for (int i = 0; i < n; i++) {\n            long long x;\n            scanf("%lld", &x);\n            if (x > max_val) max_val = x;\n        }\n        printf("%lld\\n", max_val);\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long max = Long.MIN_VALUE;\n        for (int i = 0; i < n; i++) {\n            long v = sc.nextLong();\n            if (v > max) max = v;\n        }\n        System.out.println(max);\n    }\n}\n',
        },
        sample_tests: [
          { input: '5\n12 45 8 99 23', expected_output: '99', explanation: '99 is the highest integer in the array.' },
          { input: '3\n-10 -25 -4', expected_output: '-4', explanation: '-4 is greater than -10 and -25.' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 'sort-array',
        title: 'Sort Numbers in Ascending Order',
        slug: 'sort-array',
        description:
          'Given an unsorted array of $N$ integers, sort the array in ascending order and print the elements separated by spaces.',
        input_format: 'The first line contains $N$.\nThe second line contains $N$ space-separated integers.',
        output_format: 'Print the sorted array elements on a single line separated by spaces.',
        constraints: '1 <= N <= 10^5\n-10^9 <= A[i] <= 10^9',
        difficulty: 'Medium',
        topic_tags: ['Sorting', 'Algorithms'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 'n = int(input().strip())\narr = list(map(int, input().split()))\narr.sort()\nprint(" ".join(map(str, arr)))\n',
          cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<long long> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        sort(a.begin(), a.end());\n        for (int i = 0; i < n; i++) {\n            cout << a[i] << (i + 1 == n ? "" : " ");\n        }\n        cout << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n#include <stdlib.h>\n\nint cmp(const void *a, const void *b) {\n    long long diff = (*(long long*)a - *(long long*)b);\n    return (diff > 0) - (diff < 0);\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        long long *arr = (long long*)malloc(n * sizeof(long long));\n        for (int i = 0; i < n; i++) scanf("%lld", &arr[i]);\n        qsort(arr, n, sizeof(long long), cmp);\n        for (int i = 0; i < n; i++) {\n            printf("%lld%s", arr[i], (i + 1 == n) ? "" : " ");\n        }\n        printf("\\n");\n        free(arr);\n    }\n    return 0;\n}\n',
          java: 'import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long[] arr = new long[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextLong();\n        Arrays.sort(arr);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < n; i++) {\n            sb.append(arr[i]);\n            if (i < n - 1) sb.append(" ");\n        }\n        System.out.println(sb.toString());\n    }\n}\n',
        },
        sample_tests: [
          { input: '5\n5 2 9 1 5', expected_output: '1 2 5 5 9', explanation: 'Elements sorted in non-decreasing order.' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
      {
        id: 'binary-search',
        title: 'Binary Search Target Index',
        slug: 'binary-search',
        description:
          'Given a strictly increasing sorted array of $N$ integers and a target value $K$, return the 0-based index of $K$ in the array.\n\nIf $K$ does not exist in the array, print `-1`. You must implement $O(\\log N)$ binary search.',
        input_format: 'The first line contains $N$ and $K$.\nThe second line contains $N$ sorted integers.',
        output_format: 'Print the 0-based index of $K$, or -1 if not found.',
        constraints: '1 <= N <= 10^5\n-10^9 <= A[i], K <= 10^9',
        difficulty: 'Medium',
        topic_tags: ['Binary Search', 'Algorithms'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 'import bisect\nn, k = map(int, input().split())\narr = list(map(int, input().split()))\nidx = bisect.bisect_left(arr, k)\nif idx < n and arr[idx] == k:\n    print(idx)\nelse:\n    print(-1)\n',
          cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n; long long k;\n    if (cin >> n >> k) {\n        vector<long long> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        int l = 0, r = n - 1, ans = -1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (a[mid] == k) { ans = mid; break; }\n            else if (a[mid] < k) l = mid + 1;\n            else r = mid - 1;\n        }\n        cout << ans << endl;\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    long long k;\n    if (scanf("%d %lld", &n, &k) == 2) {\n        long long *a = (long long*)malloc(n * sizeof(long long));\n        for (int i = 0; i < n; i++) scanf("%lld", &a[i]);\n        int l = 0, r = n - 1, ans = -1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (a[mid] == k) { ans = mid; break; }\n            else if (a[mid] < k) l = mid + 1;\n            else r = mid - 1;\n        }\n        printf("%d\\n", ans);\n        free(a);\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long k = sc.nextLong();\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextLong();\n        int l = 0, r = n - 1, ans = -1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (a[mid] == k) { ans = mid; break; }\n            else if (a[mid] < k) l = mid + 1;\n            else r = mid - 1;\n        }\n        System.out.println(ans);\n    }\n}\n',
        },
        sample_tests: [
          { input: '6 9\n2 5 7 9 12 15', expected_output: '3', explanation: '9 is located at 0-based index 3.' },
          { input: '5 100\n1 3 5 7 9', expected_output: '-1', explanation: '100 is not in the array.' },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'matrix-transpose',
        title: 'Matrix Transpose',
        slug: 'matrix-transpose',
        description:
          'Given an $R \\times C$ matrix of integers, output the transpose matrix of size $C \\times R$.\n\nThe transpose of a matrix is formed by turning rows into columns and columns into rows.',
        input_format: 'The first line contains $R$ and $C$.\nThe next $R$ lines each contain $C$ space-separated integers.',
        output_format: 'Print $C$ lines, each containing $R$ space-separated integers.',
        constraints: '1 <= R, C <= 100\n-10^4 <= Matrix[i][j] <= 10^4',
        difficulty: 'Medium',
        topic_tags: ['Matrices', '2D Arrays'],
        supported_languages: ['python', 'cpp', 'c', 'java'],
        starter_code: {
          python: 'r, c = map(int, input().split())\nmatrix = [list(map(int, input().split())) for _ in range(r)]\nfor j in range(c):\n    row = [str(matrix[i][j]) for i in range(r)]\n    print(" ".join(row))\n',
          cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int r, c;\n    if (cin >> r >> c) {\n        vector<vector<int>> mat(r, vector<int>(c));\n        for (int i = 0; i < r; i++)\n            for (int j = 0; j < c; j++)\n                cin >> mat[i][j];\n        for (int j = 0; j < c; j++) {\n            for (int i = 0; i < r; i++) {\n                cout << mat[i][j] << (i + 1 == r ? "" : " ");\n            }\n            cout << "\\n";\n        }\n    }\n    return 0;\n}\n',
          c: '#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf("%d %d", &r, &c) == 2) {\n        int mat[105][105];\n        for (int i = 0; i < r; i++)\n            for (int j = 0; j < c; j++)\n                scanf("%d", &mat[i][j]);\n        for (int j = 0; j < c; j++) {\n            for (int i = 0; i < r; i++) {\n                printf("%d%s", mat[i][j], (i + 1 == r) ? "" : " ");\n            }\n            printf("\\n");\n        }\n    }\n    return 0;\n}\n',
          java: 'import java.util.Scanner;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int r = sc.nextInt();\n        int c = sc.nextInt();\n        int[][] mat = new int[r][c];\n        for (int i = 0; i < r; i++)\n            for (int j = 0; j < c; j++)\n                mat[i][j] = sc.nextInt();\n        for (int j = 0; j < c; j++) {\n            for (int i = 0; i < r; i++) {\n                System.out.print(mat[i][j] + (i + 1 == r ? "" : " "));\n            }\n            System.out.println();\n        }\n    }\n}\n',
        },
        sample_tests: [
          {
            input: '2 3\n1 2 3\n4 5 6',
            expected_output: '1 4\n2 5\n3 6',
            explanation: 'The 2x3 matrix is transposed into a 3x2 matrix.',
          },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'html-profile-card',
        title: 'Developer Profile Card',
        slug: 'html-profile-card',
        description:
          'Create a semantic HTML developer profile card with an avatar, student name, bio paragraph, skill badges, and a contact button.\n\n### Requirements:\n- An image with an avatar (`<img src="..." alt="...">`)\n- A main heading `<h1>` with the developer name\n- A `<p>` element with a short biography\n- A list `<ul>` with at least 3 skill items `<li>`\n- A `<button>` labeled "Connect" or "View GitHub"',
        input_format: 'No standard input. Structured HTML markup.',
        output_format: 'Rendered DOM containing required tags (img, h1, p, ul, li, button).',
        constraints: 'Valid HTML5 semantic tags.',
        difficulty: 'Easy',
        topic_tags: ['HTML', 'Web Layout'],
        supported_languages: ['html'],
        starter_code: {
          html: '<div class="profile-card">\n  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Avatar" class="avatar">\n  <h1>Jane Doe</h1>\n  <p class="bio">Passionate Full-Stack Developer & Open Source Contributor.</p>\n  <ul class="skills">\n    <li>Python</li>\n    <li>React</li>\n    <li>PostgreSQL</li>\n  </ul>\n  <button class="btn-connect">Connect</button>\n</div>\n',
        },
        sample_tests: [
          {
            input: 'validation',
            expected_output: 'img,h1,p,ul,li,button',
            explanation: 'Checks for presence of img, h1, p, ul, li, and button elements.',
          },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'html-registration-form',
        title: 'Student Course Registration Form',
        slug: 'html-registration-form',
        description:
          'Build an accessible HTML registration form where students can enroll in computer science electives.\n\n### Requirements:\n- A `<form>` element\n- A text input for student name with `<label>`\n- An email input (`type="email"`) with `required` attribute\n- A `<select>` dropdown with at least 3 course `<option>`s\n- A submit `<button type="submit">`',
        input_format: 'No standard input. Structured HTML markup.',
        output_format: 'Rendered form containing form, input, label, select, option, button.',
        constraints: 'Valid HTML5 form elements with appropriate input types.',
        difficulty: 'Medium',
        topic_tags: ['HTML', 'Forms'],
        supported_languages: ['html'],
        starter_code: {
          html: '<form class="registration-form">\n  <h2>Course Enrollment</h2>\n  <label for="name">Full Name</label>\n  <input id="name" type="text" placeholder="John Smith" required>\n\n  <label for="email">College Email</label>\n  <input id="email" type="email" placeholder="john@university.edu" required>\n\n  <label for="course">Select Elective</label>\n  <select id="course">\n    <option value="cs101">Data Structures & Algorithms</option>\n    <option value="cs201">Full-Stack Web Engineering</option>\n    <option value="cs301">Operating Systems & C++</option>\n  </select>\n\n  <button type="submit">Enroll Now</button>\n</form>\n',
        },
        sample_tests: [
          {
            input: 'validation',
            expected_output: 'form,input,label,select,option,button',
            explanation: 'Validates complete form controls and accessibility semantics.',
          },
        ],
        is_published: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    // 4. Hidden Test Cases (Private to backend evaluation!)
    this.data.hidden_test_cases = [
      // two-sum
      { id: 'htc_1_1', problem_id: 'two-sum', input_data: '100 250', expected_output: '350', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_1_2', problem_id: 'two-sum', input_data: '-500 -700', expected_output: '-1200', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_1_3', problem_id: 'two-sum', input_data: '1000000000 -1000000000', expected_output: '0', points: 10, time_limit: 2000, memory_limit: 256 },
      // even-or-odd
      { id: 'htc_2_1', problem_id: 'even-or-odd', input_data: '0', expected_output: 'Even', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_2_2', problem_id: 'even-or-odd', input_data: '-99', expected_output: 'Odd', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_2_3', problem_id: 'even-or-odd', input_data: '1000000002', expected_output: 'Even', points: 10, time_limit: 2000, memory_limit: 256 },
      // palindrome-check
      { id: 'htc_3_1', problem_id: 'palindrome-check', input_data: 'madam', expected_output: 'YES', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_3_2', problem_id: 'palindrome-check', input_data: 'CodeArena', expected_output: 'NO', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_3_3', problem_id: 'palindrome-check', input_data: 'a', expected_output: 'YES', points: 10, time_limit: 2000, memory_limit: 256 },
      // factorial
      { id: 'htc_4_1', problem_id: 'factorial', input_data: '1', expected_output: '1', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_4_2', problem_id: 'factorial', input_data: '6', expected_output: '720', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_4_3', problem_id: 'factorial', input_data: '10', expected_output: '3628800', points: 10, time_limit: 2000, memory_limit: 256 },
      // fibonacci-sequence
      { id: 'htc_5_1', problem_id: 'fibonacci-sequence', input_data: '0', expected_output: '0', points: 15, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_5_2', problem_id: 'fibonacci-sequence', input_data: '1', expected_output: '1', points: 15, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_5_3', problem_id: 'fibonacci-sequence', input_data: '15', expected_output: '610', points: 15, time_limit: 2000, memory_limit: 256 },
      // prime-number-check
      { id: 'htc_6_1', problem_id: 'prime-number-check', input_data: '1', expected_output: 'NOT PRIME', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_6_2', problem_id: 'prime-number-check', input_data: '2', expected_output: 'PRIME', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_6_3', problem_id: 'prime-number-check', input_data: '999983', expected_output: 'PRIME', points: 15, time_limit: 2000, memory_limit: 256 },
      // find-largest-element
      { id: 'htc_7_1', problem_id: 'find-largest-element', input_data: '1\n42', expected_output: '42', points: 10, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_7_2', problem_id: 'find-largest-element', input_data: '6\n-1 -5 -2 -9 -3 -7', expected_output: '-1', points: 10, time_limit: 2000, memory_limit: 256 },
      // sort-array
      { id: 'htc_8_1', problem_id: 'sort-array', input_data: '4\n10 -2 3 0', expected_output: '-2 0 3 10', points: 15, time_limit: 2000, memory_limit: 256 },
      // binary-search
      { id: 'htc_9_1', problem_id: 'binary-search', input_data: '5 1\n1 2 3 4 5', expected_output: '0', points: 15, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_9_2', problem_id: 'binary-search', input_data: '5 5\n1 2 3 4 5', expected_output: '4', points: 15, time_limit: 2000, memory_limit: 256 },
      // matrix-transpose
      { id: 'htc_10_1', problem_id: 'matrix-transpose', input_data: '1 3\n7 8 9', expected_output: '7\n8\n9', points: 15, time_limit: 2000, memory_limit: 256 },
      // html problems
      { id: 'htc_html_1', problem_id: 'html-profile-card', input_data: 'preview', expected_output: 'img,h1,p,ul,li,button', points: 20, time_limit: 2000, memory_limit: 256 },
      { id: 'htc_html_2', problem_id: 'html-registration-form', input_data: 'preview', expected_output: 'form,input,label,select,option,button', points: 25, time_limit: 2000, memory_limit: 256 },
    ];

    // 5. Achievements
    this.data.achievements = [
      { id: 'first_solve', name: 'First Milestone', description: 'Solve your first problem on CodeArena', badge_icon: 'Award', criteria: 'solved_1' },
      { id: 'solved_5', name: 'Code Cadet', description: 'Solve 5 different coding problems', badge_icon: 'Zap', criteria: 'solved_5' },
      { id: 'solved_10', name: 'Algorithm Decathlete', description: 'Complete 10 problems successfully', badge_icon: 'Trophy', criteria: 'solved_10' },
      { id: 'streak_3', name: 'Consistent Coder', description: 'Maintain a 3-day coding streak', badge_icon: 'Flame', criteria: 'streak_3' },
      { id: 'streak_7', name: 'Unstoppable Momentum', description: 'Maintain a 7-day coding streak', badge_icon: 'Flame', criteria: 'streak_7' },
      { id: 'python_explorer', name: 'Pythonista', description: 'Submit an accepted solution in Python', badge_icon: 'Terminal', criteria: 'lang_python' },
      { id: 'cpp_explorer', name: 'C++ Master', description: 'Submit an accepted solution in C++', badge_icon: 'Cpu', criteria: 'lang_cpp' },
      { id: 'c_explorer', name: 'C Systems Pro', description: 'Submit an accepted solution in C', badge_icon: 'Code', criteria: 'lang_c' },
      { id: 'java_explorer', name: 'Java Architect', description: 'Submit an accepted solution in Java', badge_icon: 'Coffee', criteria: 'lang_java' },
      { id: 'web_craftsman', name: 'Web Craftsman', description: 'Complete an interactive HTML layout exercise', badge_icon: 'Globe', criteria: 'lang_html' },
    ];

    // 6. Seed Daily Challenge
    const todayStr = new Date().toISOString().split('T')[0];
    this.data.daily_challenges = [
      {
        id: 'dc_' + todayStr,
        problem_id: 'palindrome-check',
        challenge_date: todayStr,
        points: 50,
      },
    ];

    // 7. Seed sample problem progress & submissions for student accounts
    this.data.submissions = [
      {
        id: 'sub_demo_1',
        user_id: 'usr_alex_02',
        user_name: 'Alex Rivera',
        problem_id: 'two-sum',
        problem_title: 'Add Two Numbers',
        language_id: 'python',
        source_code: 'a, b = map(int, input().split())\nprint(a + b)',
        status: 'Accepted',
        passed_test_cases: 3,
        total_test_cases: 3,
        execution_time: 24,
        memory_used: 10400,
        submitted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'sub_demo_2',
        user_id: 'usr_alex_02',
        user_name: 'Alex Rivera',
        problem_id: 'even-or-odd',
        problem_title: 'Even or Odd Number',
        language_id: 'python',
        source_code: 'n = int(input().strip())\nprint("Even" if n % 2 == 0 else "Odd")',
        status: 'Accepted',
        passed_test_cases: 3,
        total_test_cases: 3,
        execution_time: 22,
        memory_used: 10200,
        submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'sub_demo_3',
        user_id: 'usr_priya_03',
        user_name: 'Priya Sharma',
        problem_id: 'prime-number-check',
        problem_title: 'Prime Number Detection',
        language_id: 'cpp',
        source_code: '// C++ solution\n#include <iostream>\nusing namespace std;\nint main() { return 0; }',
        status: 'Accepted',
        passed_test_cases: 3,
        total_test_cases: 3,
        execution_time: 120,
        memory_used: 12500,
        submitted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'sub_demo_4',
        user_id: 'usr_marcus_04',
        user_name: 'Marcus Chen',
        problem_id: 'sort-array',
        problem_title: 'Sort Numbers in Ascending Order',
        language_id: 'java',
        source_code: '// Java solution',
        status: 'Accepted',
        passed_test_cases: 1,
        total_test_cases: 1,
        execution_time: 310,
        memory_used: 24000,
        submitted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    this.data.problem_progress = [
      {
        id: 'pp_1',
        user_id: 'usr_alex_02',
        problem_id: 'two-sum',
        is_solved: true,
        first_solved_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        last_attempted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        attempts_count: 1,
      },
      {
        id: 'pp_2',
        user_id: 'usr_alex_02',
        problem_id: 'even-or-odd',
        is_solved: true,
        first_solved_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        last_attempted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        attempts_count: 1,
      },
      {
        id: 'pp_3',
        user_id: 'usr_priya_03',
        problem_id: 'two-sum',
        is_solved: true,
        first_solved_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        last_attempted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        attempts_count: 1,
      },
      {
        id: 'pp_4',
        user_id: 'usr_priya_03',
        problem_id: 'prime-number-check',
        is_solved: true,
        first_solved_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        last_attempted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        attempts_count: 1,
      },
      {
        id: 'pp_5',
        user_id: 'usr_marcus_04',
        problem_id: 'sort-array',
        is_solved: true,
        first_solved_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        last_attempted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        attempts_count: 1,
      },
    ];

    this.data.user_achievements = [
      { id: 'ua_1', user_id: 'usr_alex_02', achievement_id: 'first_solve', earned_at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: 'ua_2', user_id: 'usr_alex_02', achievement_id: 'python_explorer', earned_at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: 'ua_3', user_id: 'usr_priya_03', achievement_id: 'first_solve', earned_at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 'ua_4', user_id: 'usr_priya_03', achievement_id: 'cpp_explorer', earned_at: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: 'ua_5', user_id: 'usr_marcus_04', achievement_id: 'first_solve', earned_at: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 'ua_6', user_id: 'usr_marcus_04', achievement_id: 'java_explorer', earned_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    ];

    this.data.bookmarks = [
      { id: 'bm_1', user_id: 'usr_alex_02', problem_id: 'fibonacci-sequence', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 'bm_2', user_id: 'usr_alex_02', problem_id: 'binary-search', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    ];
  }

  // --- Profile methods ---
  public getProfiles(): UserProfile[] {
    return this.data.profiles.map((p) => {
      const { password_hash, ...rest } = p;
      return rest as UserProfile;
    });
  }

  public findProfileByEmail(email: string): UserProfile | undefined {
    return this.data.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public findProfileById(id: string): UserProfile | undefined {
    return this.data.profiles.find((p) => p.id === id);
  }

  public createProfile(profile: UserProfile): UserProfile {
    this.data.profiles.push(profile);
    this.save();
    const { password_hash, ...rest } = profile;
    return rest as UserProfile;
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.data.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.profiles[idx] = { ...this.data.profiles[idx], ...updates };
    this.save();
    const { password_hash, ...rest } = this.data.profiles[idx];
    return rest as UserProfile;
  }

  // --- Languages ---
  public getLanguages(): LanguageTrack[] {
    return this.data.languages;
  }

  public getLanguageBySlug(slug: string): LanguageTrack | undefined {
    return this.data.languages.find((l) => l.slug === slug);
  }

  // --- Problems ---
  public getProblems(filters?: {
    language?: string;
    difficulty?: string;
    topic?: string;
    search?: string;
    includeUnpublished?: boolean;
  }): CodingProblem[] {
    let result = [...this.data.problems];

    if (!filters?.includeUnpublished) {
      result = result.filter((p) => p.is_published);
    }

    if (filters?.difficulty && filters.difficulty !== 'All') {
      result = result.filter((p) => p.difficulty.toLowerCase() === filters.difficulty?.toLowerCase());
    }

    if (filters?.language && filters.language !== 'all') {
      result = result.filter((p) =>
        p.supported_languages.includes(filters.language!.toLowerCase())
      );
    }

    if (filters?.topic && filters.topic !== 'all') {
      result = result.filter((p) =>
        p.topic_tags.some((t) => t.toLowerCase() === filters.topic!.toLowerCase())
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.topic_tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public getProblemById(idOrSlug: string, includeUnpublished = false): CodingProblem | undefined {
    return this.data.problems.find(
      (p) =>
        (p.id === idOrSlug || p.slug === idOrSlug) &&
        (includeUnpublished || p.is_published)
    );
  }

  public createProblem(problem: CodingProblem, hiddenTests?: HiddenTestCase[]): CodingProblem {
    this.data.problems.push(problem);
    if (hiddenTests && hiddenTests.length > 0) {
      this.data.hidden_test_cases.push(...hiddenTests);
    }
    this.save();
    return problem;
  }

  public updateProblem(id: string, updates: Partial<CodingProblem>, hiddenTests?: HiddenTestCase[]): CodingProblem | null {
    const idx = this.data.problems.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.problems[idx] = {
      ...this.data.problems[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (hiddenTests) {
      this.data.hidden_test_cases = this.data.hidden_test_cases.filter((h) => h.problem_id !== id);
      this.data.hidden_test_cases.push(...hiddenTests);
    }

    this.save();
    return this.data.problems[idx];
  }

  public deleteProblem(id: string): boolean {
    const initLen = this.data.problems.length;
    this.data.problems = this.data.problems.filter((p) => p.id !== id);
    this.data.hidden_test_cases = this.data.hidden_test_cases.filter((h) => h.problem_id !== id);
    this.data.problem_progress = this.data.problem_progress.filter((pp) => pp.problem_id !== id);
    this.data.bookmarks = this.data.bookmarks.filter((b) => b.problem_id !== id);
    this.data.daily_challenges = this.data.daily_challenges.filter((dc) => dc.problem_id !== id);
    this.save();
    return this.data.problems.length < initLen;
  }

  // --- Hidden Test Cases (Admin / Internal) ---
  public getHiddenTestCases(problemId: string): HiddenTestCase[] {
    return this.data.hidden_test_cases.filter((h) => h.problem_id === problemId);
  }

  public setHiddenTestCases(problemId: string, testCases: HiddenTestCase[]): void {
    this.data.hidden_test_cases = this.data.hidden_test_cases.filter((h) => h.problem_id !== problemId);
    this.data.hidden_test_cases.push(...testCases);
    this.save();
  }

  // --- Submissions ---
  public getSubmissions(userId?: string, limit = 50): Submission[] {
    let list = [...this.data.submissions];
    if (userId) {
      list = list.filter((s) => s.user_id === userId);
    }
    return list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()).slice(0, limit);
  }

  public addSubmission(submission: Submission): Submission {
    this.data.submissions.unshift(submission);
    this.save();
    return submission;
  }

  // --- Problem Progress ---
  public getProgressForUser(userId: string): ProblemProgress[] {
    return this.data.problem_progress.filter((p) => p.user_id === userId);
  }

  public updateProgress(userId: string, problemId: string, isSolved: boolean): ProblemProgress {
    let progress = this.data.problem_progress.find(
      (p) => p.user_id === userId && p.problem_id === problemId
    );

    const now = new Date().toISOString();

    if (!progress) {
      progress = {
        id: `pp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        problem_id: problemId,
        is_solved: isSolved,
        first_solved_at: isSolved ? now : undefined,
        last_attempted_at: now,
        attempts_count: 1,
      };
      this.data.problem_progress.push(progress);
    } else {
      progress.attempts_count += 1;
      progress.last_attempted_at = now;
      if (isSolved && !progress.is_solved) {
        progress.is_solved = true;
        progress.first_solved_at = now;
      }
    }

    this.checkAndAwardAchievements(userId);
    this.save();
    return progress;
  }

  // --- Bookmarks ---
  public getBookmarks(userId: string): string[] {
    return this.data.bookmarks.filter((b) => b.user_id === userId).map((b) => b.problem_id);
  }

  public toggleBookmark(userId: string, problemId: string): boolean {
    const idx = this.data.bookmarks.findIndex(
      (b) => b.user_id === userId && b.problem_id === problemId
    );
    if (idx >= 0) {
      this.data.bookmarks.splice(idx, 1);
      this.save();
      return false; // unbookmarked
    } else {
      this.data.bookmarks.push({
        id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        problem_id: problemId,
        created_at: new Date().toISOString(),
      });
      this.save();
      return true; // bookmarked
    }
  }

  // --- Daily Challenge ---
  public getDailyChallenge(): DailyChallenge | null {
    const today = new Date().toISOString().split('T')[0];
    let dc = this.data.daily_challenges.find((d) => d.challenge_date === today);
    if (!dc && this.data.problems.length > 0) {
      // Pick a published problem deterministically for today
      const published = this.data.problems.filter((p) => p.is_published);
      const prob = published[today.length % published.length];
      dc = {
        id: `dc_${today}`,
        problem_id: prob.id,
        challenge_date: today,
        points: 50,
      };
      this.data.daily_challenges.push(dc);
      this.save();
    }

    if (dc) {
      const problem = this.getProblemById(dc.problem_id);
      return { ...dc, problem };
    }
    return null;
  }

  // --- Achievements ---
  public getAchievements(): Achievement[] {
    return this.data.achievements;
  }

  public getUserAchievements(userId: string): UserAchievement[] {
    return this.data.user_achievements
      .filter((ua) => ua.user_id === userId)
      .map((ua) => {
        const achievement = this.data.achievements.find((a) => a.id === ua.achievement_id);
        return { ...ua, achievement };
      });
  }

  private checkAndAwardAchievements(userId: string) {
    const solved = this.data.problem_progress.filter((p) => p.user_id === userId && p.is_solved);
    const userSubs = this.data.submissions.filter((s) => s.user_id === userId && s.status === 'Accepted');
    const existing = new Set(
      this.data.user_achievements.filter((ua) => ua.user_id === userId).map((ua) => ua.achievement_id)
    );

    const award = (achId: string) => {
      if (!existing.has(achId)) {
        this.data.user_achievements.push({
          id: `ua_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: userId,
          achievement_id: achId,
          earned_at: new Date().toISOString(),
        });
        existing.add(achId);
      }
    };

    if (solved.length >= 1) award('first_solve');
    if (solved.length >= 5) award('solved_5');
    if (solved.length >= 10) award('solved_10');

    if (userSubs.some((s) => s.language_id === 'python')) award('python_explorer');
    if (userSubs.some((s) => s.language_id === 'cpp')) award('cpp_explorer');
    if (userSubs.some((s) => s.language_id === 'c')) award('c_explorer');
    if (userSubs.some((s) => s.language_id === 'java')) award('java_explorer');
    if (userSubs.some((s) => s.language_id === 'html')) award('web_craftsman');
  }

  // --- Leaderboard ---
  public getLeaderboard(): LeaderboardEntry[] {
    const students = this.data.profiles.filter((p) => p.role === 'student');

    const entries: LeaderboardEntry[] = students.map((s) => {
      const userProgress = this.data.problem_progress.filter((pp) => pp.user_id === s.id && pp.is_solved);
      const solvedCount = userProgress.length;

      // Calculate points based on problem difficulties: Easy=10, Medium=20, Hard=30
      let points = 0;
      for (const p of userProgress) {
        const prob = this.data.problems.find((item) => item.id === p.problem_id);
        if (prob) {
          if (prob.difficulty === 'Easy') points += 10;
          else if (prob.difficulty === 'Medium') points += 20;
          else if (prob.difficulty === 'Hard') points += 35;
        }
      }

      // Check daily challenge completions
      const badgesCount = this.data.user_achievements.filter((ua) => ua.user_id === s.id).length;
      points += badgesCount * 15;

      return {
        rank: 0,
        user_id: s.id,
        display_name: s.full_name,
        college_name: s.college_name,
        problems_solved: solvedCount,
        points,
        current_streak: Math.min(solvedCount * 2 + 1, 14),
        badges_count: badgesCount,
      };
    });

    entries.sort((a, b) => b.points - a.points || b.problems_solved - a.problems_solved);

    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  // --- Platform Stats ---
  public getPlatformStats() {
    return {
      totalProblems: this.data.problems.filter((p) => p.is_published).length,
      totalLanguages: this.data.languages.length,
      totalStudents: this.data.profiles.filter((p) => p.role === 'student').length,
      totalSubmissions: this.data.submissions.length,
      acceptanceRate:
        this.data.submissions.length > 0
          ? Math.round(
              (this.data.submissions.filter((s) => s.status === 'Accepted').length /
                this.data.submissions.length) *
                100
            )
          : 85,
    };
  }
}

export const dbStore = new DatabaseStore();
