import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, HardDrive, Zap, Brain, Network, SortAsc, Database } from "lucide-react";

type Category = "all" | "sorting" | "search" | "graph" | "dynamic" | "crypto" | "ml";

interface Algorithm {
  id: number;
  name: string;
  nameAr: string;
  inventor: string;
  year: string;
  category: Category;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  descriptionAr: string;
  pseudocode: string[];
  useCases: string[];
  useCasesAr: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  color: string;
}

const ALGORITHMS: Algorithm[] = [
  {
    id: 1,
    name: "Binary Search",
    nameAr: "البحث الثنائي",
    inventor: "John Mauchly",
    year: "1946",
    category: "search",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    description: "Efficiently finds a target in a sorted array by repeatedly halving the search space. One of the most fundamental algorithms in computer science.",
    descriptionAr: "يجد الهدف بكفاءة في مصفوفة مرتبة عن طريق تقسيم مساحة البحث إلى نصفين بشكل متكرر. من أهم الخوارزميات الأساسية في علوم الكمبيوتر.",
    pseudocode: ["low = 0, high = n-1", "while low ≤ high:", "  mid = (low + high) / 2", "  if arr[mid] == target → return mid", "  if arr[mid] < target → low = mid+1", "  else → high = mid-1", "return -1"],
    useCases: ["Database indexing", "Dictionary lookups", "Version control bisect", "Range queries"],
    useCasesAr: ["فهرسة قواعد البيانات", "البحث في القواميس", "نظام التحكم في الإصدار", "استعلامات النطاق"],
    difficulty: "beginner",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Quick Sort",
    nameAr: "الترتيب السريع",
    inventor: "Tony Hoare",
    year: "1959",
    category: "sorting",
    timeComplexity: "O(n log n) avg",
    spaceComplexity: "O(log n)",
    description: "A divide-and-conquer sorting algorithm that picks a pivot element and partitions the array around it. Widely considered the fastest practical sort.",
    descriptionAr: "خوارزمية ترتيب تعمل بمبدأ الفصل والحل، تختار عنصرًا محوريًا وتقسّم المصفوفة حوله. تُعدّ من أسرع خوارزميات الترتيب العملية.",
    pseudocode: ["quicksort(arr, low, high):", "  if low < high:", "    pivot = partition(arr, low, high)", "    quicksort(arr, low, pivot-1)", "    quicksort(arr, pivot+1, high)"],
    useCases: ["System sort libraries", "Database query optimization", "File systems", "Numerical computing"],
    useCasesAr: ["مكتبات الترتيب في النظام", "تحسين استعلامات قاعدة البيانات", "أنظمة الملفات", "الحوسبة الرقمية"],
    difficulty: "intermediate",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 3,
    name: "Merge Sort",
    nameAr: "ترتيب الدمج",
    inventor: "John von Neumann",
    year: "1945",
    category: "sorting",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    description: "A stable, divide-and-conquer sort that splits the array in half recursively, then merges sorted halves. Guarantees O(n log n) in all cases.",
    descriptionAr: "خوارزمية ترتيب مستقرة وتعمل بمبدأ التقسيم والحل، تقسّم المصفوفة إلى نصفين وتدمجهما بعد ترتيبهما. تضمن أداء O(n log n) في جميع الحالات.",
    pseudocode: ["mergesort(arr):", "  if len(arr) ≤ 1 → return arr", "  mid = len(arr) / 2", "  L = mergesort(arr[:mid])", "  R = mergesort(arr[mid:])", "  return merge(L, R)"],
    useCases: ["External sorting of large files", "Inversion count problems", "Linked list sorting", "Parallel computation"],
    useCasesAr: ["ترتيب الملفات الكبيرة خارجيًا", "مسائل عد الانعكاسات", "ترتيب القوائم المرتبطة", "الحوسبة المتوازية"],
    difficulty: "intermediate",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    name: "Dijkstra's Algorithm",
    nameAr: "خوارزمية ديكسترا",
    inventor: "Edsger W. Dijkstra",
    year: "1956",
    category: "graph",
    timeComplexity: "O((V+E) log V)",
    spaceComplexity: "O(V)",
    description: "Finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edges. Powers GPS navigation worldwide.",
    descriptionAr: "تجد أقصر مسار من عقدة المصدر إلى جميع العقد الأخرى في رسم بياني مرجّح بحواف غير سالبة. تُشغّل أنظمة الملاحة GPS حول العالم.",
    pseudocode: ["dist[src] = 0, dist[all] = ∞", "priority_queue Q = {(0, src)}", "while Q not empty:", "  u = Q.extract_min()", "  for each neighbor v of u:", "    if dist[u] + w(u,v) < dist[v]:", "      dist[v] = dist[u] + w(u,v)", "      Q.insert(v, dist[v])"],
    useCases: ["GPS navigation", "Network routing (OSPF)", "Social network analysis", "Flight path planning"],
    useCasesAr: ["الملاحة بالـ GPS", "توجيه الشبكات (OSPF)", "تحليل الشبكات الاجتماعية", "تخطيط مسارات الطيران"],
    difficulty: "intermediate",
    color: "from-teal-500 to-green-500",
  },
  {
    id: 5,
    name: "Dynamic Programming",
    nameAr: "البرمجة الديناميكية",
    inventor: "Richard Bellman",
    year: "1953",
    category: "dynamic",
    timeComplexity: "Problem-specific",
    spaceComplexity: "O(n) – O(n²)",
    description: "Solves complex problems by breaking them into overlapping subproblems, storing results to avoid redundant computation (memoization/tabulation).",
    descriptionAr: "تحل المسائل المعقدة بتقسيمها إلى مسائل فرعية متداخلة وتخزين نتائجها لتجنب إعادة الحساب (التذكير/الجدولة).",
    pseudocode: ["# Fibonacci (bottom-up)", "dp[0] = 0, dp[1] = 1", "for i in range(2, n+1):", "  dp[i] = dp[i-1] + dp[i-2]", "return dp[n]"],
    useCases: ["Knapsack problem", "Edit distance / spell-check", "Longest common subsequence", "Stock trading optimization"],
    useCasesAr: ["مسألة حقيبة الظهر", "مسافة التحرير / تدقيق إملائي", "أطول تسلسل مشترك", "تحسين تداول الأسهم"],
    difficulty: "advanced",
    color: "from-violet-500 to-indigo-500",
  },
  {
    id: 6,
    name: "Breadth-First Search",
    nameAr: "البحث بالعرض أولاً",
    inventor: "Konrad Zuse / Edward Moore",
    year: "1945",
    category: "graph",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    description: "Explores a graph level by level, visiting all neighbors before going deeper. Guarantees shortest path in unweighted graphs.",
    descriptionAr: "يستكشف الرسم البياني مستوىً بمستوى، يزور جميع الجيران قبل التعمق أكثر. يضمن أقصر مسار في الرسوم البيانية غير المرجّحة.",
    pseudocode: ["queue = [start], visited = {start}", "while queue:", "  node = queue.dequeue()", "  process(node)", "  for neighbor in adj[node]:", "    if neighbor not in visited:", "      visited.add(neighbor)", "      queue.enqueue(neighbor)"],
    useCases: ["Shortest path (unweighted)", "Web crawlers", "Social network friend suggestions", "Puzzle solving (BFS states)"],
    useCasesAr: ["أقصر مسار (غير مرجّح)", "زواحف الويب", "اقتراح الأصدقاء في الشبكات الاجتماعية", "حل الألغاز"],
    difficulty: "beginner",
    color: "from-sky-500 to-blue-600",
  },
  {
    id: 7,
    name: "A* Search",
    nameAr: "خوارزمية A*",
    inventor: "Peter Hart, Nils Nilsson, Bertram Raphael",
    year: "1968",
    category: "graph",
    timeComplexity: "O(b^d)",
    spaceComplexity: "O(b^d)",
    description: "Best-first search using a heuristic to guide toward the goal. Optimal and complete when the heuristic is admissible. The go-to for game AI pathfinding.",
    descriptionAr: "بحث أفضل أولاً يستخدم إرشادًا توجيهيًا للوصول للهدف. مثالية وكاملة عندما يكون الإرشاد مقبولاً. المعيار الذهبي لإيجاد المسار في ألعاب الفيديو.",
    pseudocode: ["f(n) = g(n) + h(n)", "open = {start}, closed = {}", "while open:", "  n = node with lowest f(n)", "  if n == goal → return path", "  for each neighbor:", "    tentative_g = g(n) + cost(n, neighbor)", "    update if better path found"],
    useCases: ["Game AI pathfinding", "Robot navigation", "Map routing", "Network packet routing"],
    useCasesAr: ["إيجاد المسار في ذكاء الألعاب", "ملاحة الروبوت", "توجيه الخرائط", "توجيه حزم الشبكة"],
    difficulty: "advanced",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 8,
    name: "RSA Encryption",
    nameAr: "تشفير RSA",
    inventor: "Rivest, Shamir & Adleman",
    year: "1977",
    category: "crypto",
    timeComplexity: "O(k² log k)",
    spaceComplexity: "O(k)",
    description: "Public-key cryptosystem based on the difficulty of factoring large integers. Secures most of the internet's encrypted communication today.",
    descriptionAr: "نظام تشفير بالمفتاح العام يعتمد على صعوبة تحليل الأعداد الصحيحة الكبيرة إلى عواملها. يؤمّن معظم الاتصالات المشفرة على الإنترنت اليوم.",
    pseudocode: ["1. Choose primes p, q", "2. n = p × q", "3. φ(n) = (p-1)(q-1)", "4. Choose e: gcd(e, φ(n)) = 1", "5. d = e⁻¹ mod φ(n)", "Public key: (e, n)", "Private key: (d, n)", "Encrypt: c = m^e mod n", "Decrypt: m = c^d mod n"],
    useCases: ["HTTPS / TLS", "SSH authentication", "Digital signatures", "Email encryption (PGP)"],
    useCasesAr: ["HTTPS / TLS", "مصادقة SSH", "التوقيعات الرقمية", "تشفير البريد الإلكتروني (PGP)"],
    difficulty: "advanced",
    color: "from-red-600 to-rose-500",
  },
  {
    id: 9,
    name: "Depth-First Search",
    nameAr: "البحث بالعمق أولاً",
    inventor: "Charles Pierre Trémaux",
    year: "1882",
    category: "graph",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    description: "Explores as far as possible along each branch before backtracking. Fundamental for topological sorting, cycle detection, and maze solving.",
    descriptionAr: "يستكشف أبعد نقطة ممكنة في كل فرع قبل التراجع. أساسي للترتيب الطوبولوجي، واكتشاف الدورات، وحل المتاهات.",
    pseudocode: ["dfs(node, visited):", "  visited.add(node)", "  process(node)", "  for neighbor in adj[node]:", "    if neighbor not in visited:", "      dfs(neighbor, visited)"],
    useCases: ["Topological sorting", "Cycle detection", "Maze generation", "Connected components"],
    useCasesAr: ["الترتيب الطوبولوجي", "اكتشاف الدورات", "توليد المتاهات", "المكونات المترابطة"],
    difficulty: "beginner",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 10,
    name: "Knuth-Morris-Pratt (KMP)",
    nameAr: "خوارزمية KMP",
    inventor: "Knuth, Morris & Pratt",
    year: "1977",
    category: "search",
    timeComplexity: "O(n + m)",
    spaceComplexity: "O(m)",
    description: "Linear-time string pattern matching using a failure function to avoid redundant comparisons. Revolutionized text search algorithms.",
    descriptionAr: "مطابقة نمط النص في زمن خطي باستخدام دالة فشل لتجنب المقارنات المتكررة. أحدثت ثورة في خوارزميات البحث في النصوص.",
    pseudocode: ["# Build failure function", "lps = compute_lps(pattern)", "# Search", "i = j = 0", "while i < len(text):", "  if text[i] == pattern[j]: i++, j++", "  if j == m: match found at i-j", "  elif i < n and text[i] != pattern[j]:", "    if j != 0: j = lps[j-1]", "    else: i++"],
    useCases: ["Text editors (Find & Replace)", "Bioinformatics (DNA search)", "Network intrusion detection", "Search engines"],
    useCasesAr: ["محررات النصوص (بحث واستبدال)", "المعلوماتية الحيوية (بحث الحمض النووي)", "كشف اختراق الشبكات", "محركات البحث"],
    difficulty: "intermediate",
    color: "from-pink-500 to-fuchsia-500",
  },
  {
    id: 11,
    name: "Heap Sort",
    nameAr: "الترتيب بالكومة",
    inventor: "J. W. J. Williams",
    year: "1964",
    category: "sorting",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    description: "Uses a binary heap data structure to sort elements in-place with guaranteed O(n log n) worst case and no extra memory needed.",
    descriptionAr: "يستخدم هيكل بيانات الكومة الثنائية لترتيب العناصر في مكانها مع ضمان O(n log n) في أسوأ الحالات دون الحاجة لذاكرة إضافية.",
    pseudocode: ["# Build max heap", "for i in range(n//2-1, -1, -1):", "  heapify(arr, n, i)", "# Extract elements", "for i in range(n-1, 0, -1):", "  swap(arr[0], arr[i])", "  heapify(arr, i, 0)"],
    useCases: ["In-place memory constrained sorting", "Priority queues", "Operating system scheduling", "Graph algorithms (Prim's, Dijkstra's)"],
    useCasesAr: ["الترتيب في الذاكرة المحدودة", "قوائم الأولوية", "جدولة نظام التشغيل", "خوارزميات الرسوم البيانية"],
    difficulty: "intermediate",
    color: "from-yellow-500 to-amber-600",
  },
  {
    id: 12,
    name: "Floyd-Warshall",
    nameAr: "خوارزمية فلويد-وارشال",
    inventor: "Robert Floyd & Stephen Warshall",
    year: "1962",
    category: "graph",
    timeComplexity: "O(V³)",
    spaceComplexity: "O(V²)",
    description: "Computes shortest paths between all pairs of vertices in a weighted graph, handling negative edge weights (but not negative cycles).",
    descriptionAr: "تحسب أقصر المسارات بين جميع أزواج الرؤوس في رسم بياني مرجّح، وتتعامل مع أوزان الحواف السالبة (لكن ليس الدورات السالبة).",
    pseudocode: ["dist = adjacency matrix", "for k in range(V):", "  for i in range(V):", "    for j in range(V):", "      dist[i][j] = min(dist[i][j],", "        dist[i][k] + dist[k][j])"],
    useCases: ["Network routing tables", "Transitive closure", "Traffic routing", "Social network distance"],
    useCasesAr: ["جداول توجيه الشبكة", "الإغلاق الانتقالي", "توجيه حركة المرور", "مسافة الشبكة الاجتماعية"],
    difficulty: "advanced",
    color: "from-indigo-500 to-blue-700",
  },
  {
    id: 13,
    name: "Bellman-Ford",
    nameAr: "خوارزمية بيلمان-فورد",
    inventor: "Richard Bellman & Lester Ford Jr.",
    year: "1958",
    category: "graph",
    timeComplexity: "O(VE)",
    spaceComplexity: "O(V)",
    description: "Single-source shortest path algorithm that handles negative edge weights and can detect negative cycles — unlike Dijkstra's.",
    descriptionAr: "خوارزمية أقصر مسار من مصدر واحد تتعامل مع أوزان الحواف السالبة ويمكنها اكتشاف الدورات السالبة، على عكس خوارزمية ديكسترا.",
    pseudocode: ["dist[src] = 0, dist[all] = ∞", "for i in range(V-1):", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "# Check for negative cycles", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]: CYCLE!"],
    useCases: ["Currency exchange arbitrage", "Network routing with negative weights", "Distance vector protocols (RIP)", "Financial modeling"],
    useCasesAr: ["مراجحة تحويل العملات", "توجيه الشبكة بأوزان سالبة", "بروتوكولات متجه المسافة (RIP)", "النمذجة المالية"],
    difficulty: "advanced",
    color: "from-rose-500 to-red-700",
  },
  {
    id: 14,
    name: "Fast Fourier Transform",
    nameAr: "تحويل فورييه السريع",
    inventor: "Cooley & Tukey",
    year: "1965",
    category: "dynamic",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    description: "Computes the Discrete Fourier Transform in O(n log n) instead of O(n²). Considered one of the most important algorithms of the 20th century.",
    descriptionAr: "يحسب تحويل فورييه المنفصل في O(n log n) بدلاً من O(n²). يُعدّ من أهم الخوارزميات في القرن العشرين.",
    pseudocode: ["fft(arr):", "  n = len(arr)", "  if n == 1: return arr", "  even = fft(arr[0::2])", "  odd  = fft(arr[1::2])", "  T = [exp(-2πi·k/n) * odd[k] for k]", "  return [even[k]+T[k] for k] +", "         [even[k]-T[k] for k]"],
    useCases: ["Audio/video compression (MP3, JPEG)", "Signal processing", "Polynomial multiplication", "Medical imaging (MRI)"],
    useCasesAr: ["ضغط الصوت/الفيديو (MP3, JPEG)", "معالجة الإشارات", "ضرب كثيرات الحدود", "التصوير الطبي (MRI)"],
    difficulty: "advanced",
    color: "from-cyan-600 to-blue-600",
  },
  {
    id: 15,
    name: "Kruskal's Algorithm",
    nameAr: "خوارزمية كروسكال",
    inventor: "Joseph Kruskal",
    year: "1956",
    category: "graph",
    timeComplexity: "O(E log E)",
    spaceComplexity: "O(V)",
    description: "Finds the Minimum Spanning Tree of a graph by greedily adding the cheapest edges that don't form a cycle (Union-Find data structure).",
    descriptionAr: "تجد شجرة الامتداد الدنيا لرسم بياني بإضافة أرخص الحواف التي لا تشكل دورة (هيكل بيانات الاتحاد والبحث).",
    pseudocode: ["sort edges by weight", "parent = {v: v for v in V}", "for each edge (u, v, w):", "  if find(u) != find(v):", "    MST.add(edge)", "    union(u, v)"],
    useCases: ["Network cable layout", "Water supply networks", "Electric grid optimization", "Cluster analysis"],
    useCasesAr: ["تخطيط كابلات الشبكة", "شبكات إمداد المياه", "تحسين الشبكة الكهربائية", "تحليل المجموعات"],
    difficulty: "intermediate",
    color: "from-green-600 to-emerald-700",
  },
  {
    id: 16,
    name: "PageRank",
    nameAr: "خوارزمية PageRank",
    inventor: "Larry Page & Sergey Brin",
    year: "1996",
    category: "graph",
    timeComplexity: "O(k·(V+E))",
    spaceComplexity: "O(V)",
    description: "Google's original algorithm that ranks web pages by the number and quality of links pointing to them. Modeled as a random walk on a graph.",
    descriptionAr: "الخوارزمية الأصلية لـ Google التي تصنّف صفحات الويب حسب عدد وجودة الروابط المؤدية إليها. تُنمذج كمشي عشوائي على رسم بياني.",
    pseudocode: ["PR(A) = (1-d)/N +", "  d × Σ(PR(Ti)/C(Ti))", "where:", "  d = damping factor (0.85)", "  N = total pages", "  Ti = pages linking to A", "  C(Ti) = outlinks of Ti", "Iterate until convergence"],
    useCases: ["Search engine ranking", "Academic citation analysis", "Social influence measurement", "Recommendation systems"],
    useCasesAr: ["ترتيب محركات البحث", "تحليل الاستشهادات الأكاديمية", "قياس التأثير الاجتماعي", "أنظمة التوصية"],
    difficulty: "advanced",
    color: "from-blue-600 to-violet-600",
  },
  {
    id: 17,
    name: "Backpropagation",
    nameAr: "الانتشار العكسي",
    inventor: "Rumelhart, Hinton & Williams",
    year: "1986",
    category: "ml",
    timeComplexity: "O(w) per sample",
    spaceComplexity: "O(w)",
    description: "The fundamental algorithm powering neural network training. Computes gradients efficiently via the chain rule, enabling deep learning.",
    descriptionAr: "الخوارزمية الأساسية التي تُشغّل تدريب الشبكات العصبية. تحسب التدرجات بكفاءة عبر قاعدة السلسلة، مما يُتيح التعلم العميق.",
    pseudocode: ["# Forward pass", "activations = forward(input)", "loss = compute_loss(activations, y)", "# Backward pass", "dL/dw = chain rule gradients", "for each layer (reverse):", "  gradient = δloss/δweight", "  weight -= lr × gradient"],
    useCases: ["Deep learning (CNNs, RNNs, Transformers)", "Image recognition", "Natural language processing", "AlphaGo / game AI"],
    useCasesAr: ["التعلم العميق (CNNs, RNNs)", "التعرف على الصور", "معالجة اللغة الطبيعية", "AlphaGo / ذكاء الألعاب"],
    difficulty: "advanced",
    color: "from-fuchsia-600 to-purple-700",
  },
  {
    id: 18,
    name: "Huffman Coding",
    nameAr: "ترميز هوفمان",
    inventor: "David A. Huffman",
    year: "1952",
    category: "dynamic",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    description: "Optimal lossless data compression using a variable-length code based on character frequencies. Foundation of ZIP, GZIP, and DEFLATE.",
    descriptionAr: "ضغط بيانات بلا خسارة مثالي يستخدم رمزًا متغير الطول بناءً على تكرارات الأحرف. أساس تنسيقات ZIP وGZIP وDEFLATE.",
    pseudocode: ["freq = count character frequencies", "heap = MinHeap(freq)", "while len(heap) > 1:", "  l = heap.extract_min()", "  r = heap.extract_min()", "  node = Node(l.freq+r.freq)", "  node.left=l, node.right=r", "  heap.insert(node)", "encode: traverse tree (0=left, 1=right)"],
    useCases: ["File compression (ZIP/GZIP)", "JPEG image encoding", "MP3 audio compression", "Data transmission"],
    useCasesAr: ["ضغط الملفات (ZIP/GZIP)", "ترميز صور JPEG", "ضغط الصوت MP3", "نقل البيانات"],
    difficulty: "intermediate",
    color: "from-lime-500 to-green-600",
  },
  {
    id: 19,
    name: "SHA-256",
    nameAr: "خوارزمية SHA-256",
    inventor: "NSA (National Security Agency)",
    year: "2001",
    category: "crypto",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: "A cryptographic hash function producing a 256-bit digest. Secures Bitcoin blockchain transactions and SSL/TLS certificates worldwide.",
    descriptionAr: "دالة تجزئة تشفيرية تنتج ملخصًا بطول 256 بت. تؤمّن معاملات بلوكشين البيتكوين وشهادات SSL/TLS حول العالم.",
    pseudocode: ["# 64 rounds of compression", "for each 512-bit block:", "  expand to 64 32-bit words", "  init a,b,c,d,e,f,g,h from H0..H7", "  for i in range(64):", "    T1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]", "    T2 = Σ0(a) + Maj(a,b,c)", "    shift registers, add T1,T2", "  H0..H7 += a..h"],
    useCases: ["Bitcoin mining", "SSL/TLS certificates", "Password hashing", "Git commit hashes"],
    useCasesAr: ["تعدين البيتكوين", "شهادات SSL/TLS", "تجزئة كلمات المرور", "تجزئات commits في Git"],
    difficulty: "advanced",
    color: "from-slate-600 to-gray-700",
  },
  {
    id: 20,
    name: "K-Means Clustering",
    nameAr: "خوارزمية K-Means",
    inventor: "Stuart Lloyd / E.W. Forgy",
    year: "1957",
    category: "ml",
    timeComplexity: "O(k·n·d·i)",
    spaceComplexity: "O(n+k)",
    description: "Partitions n observations into k clusters by iteratively assigning points to the nearest centroid and recomputing centroids.",
    descriptionAr: "تقسّم n مشاهدة إلى k مجموعة عن طريق تعيين النقاط بشكل متكرر إلى أقرب مركز وإعادة حساب المراكز.",
    pseudocode: ["# Initialize k centroids randomly", "repeat:", "  for each point x:", "    assign x to nearest centroid", "  for each cluster k:", "    centroid[k] = mean of cluster k", "until centroids don't change"],
    useCases: ["Customer segmentation", "Image compression", "Anomaly detection", "Document clustering (NLP)"],
    useCasesAr: ["تقسيم العملاء", "ضغط الصور", "الكشف عن الشذوذ", "تجميع الوثائق (NLP)"],
    difficulty: "intermediate",
    color: "from-orange-500 to-yellow-500",
  },
];

const CATEGORIES: { value: Category; labelEn: string; labelAr: string; icon: React.ElementType }[] = [
  { value: "all", labelEn: "All Algorithms", labelAr: "جميع الخوارزميات", icon: Brain },
  { value: "sorting", labelEn: "Sorting", labelAr: "الترتيب", icon: SortAsc },
  { value: "search", labelEn: "Search", labelAr: "البحث", icon: Search },
  { value: "graph", labelEn: "Graph", labelAr: "الرسوم البيانية", icon: Network },
  { value: "dynamic", labelEn: "Dynamic / Transform", labelAr: "ديناميكي / تحويل", icon: Zap },
  { value: "crypto", labelEn: "Cryptography", labelAr: "التشفير", icon: HardDrive },
  { value: "ml", labelEn: "Machine Learning", labelAr: "تعلم الآلة", icon: Database },
];

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const DIFFICULTY_LABELS = {
  beginner: { en: "Beginner", ar: "مبتدئ" },
  intermediate: { en: "Intermediate", ar: "متوسط" },
  advanced: { en: "Advanced", ar: "متقدم" },
};

export default function Algorithms() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [selected, setSelected] = useState<Algorithm | null>(null);

  const filtered = ALGORITHMS.filter((a) => {
    const matchCat = category === "all" || a.category === category;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.nameAr.includes(q) ||
      a.inventor.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAr ? "أشهر ٢٠ خوارزمية في العالم" : "World's Top 20 Algorithms"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr
              ? "الخوارزميات الأساسية التي تُشغّل الإنترنت والذكاء الاصطناعي والتشفير"
              : "The fundamental algorithms powering the internet, AI, and cryptography"}
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="ps-9"
              placeholder={isAr ? "ابحث عن خوارزمية..." : "Search algorithms..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as Category)}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <TabsTrigger key={c.value} value={c.value} className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Icon className="w-3.5 h-3.5" />
                  {isAr ? c.labelAr : c.labelEn}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((algo, i) => (
              <motion.div
                key={algo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <Card
                  className="cursor-pointer h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-border/60 overflow-hidden group"
                  onClick={() => setSelected(algo)}
                >
                  {/* Gradient top bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${algo.color}`} />
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base leading-tight">
                          {isAr ? algo.nameAr : algo.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {isAr ? algo.name : algo.nameAr}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${DIFFICULTY_COLORS[algo.difficulty]}`}>
                        {isAr ? DIFFICULTY_LABELS[algo.difficulty].ar : DIFFICULTY_LABELS[algo.difficulty].en}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {isAr ? algo.descriptionAr : algo.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/60 rounded-md p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                          <Clock className="w-3 h-3" />
                          {isAr ? "الزمن" : "Time"}
                        </div>
                        <p className="text-xs font-mono font-semibold truncate">{algo.timeComplexity}</p>
                      </div>
                      <div className="bg-muted/60 rounded-md p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                          <HardDrive className="w-3 h-3" />
                          {isAr ? "الذاكرة" : "Space"}
                        </div>
                        <p className="text-xs font-mono font-semibold truncate">{algo.spaceComplexity}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <span>{algo.inventor.split(" ").slice(-1)[0]}, {algo.year}</span>
                      <Badge variant="outline" className="text-xs py-0">
                        {CATEGORIES.find(c => c.value === algo.category)?.[isAr ? "labelAr" : "labelEn"]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>{isAr ? "لا توجد خوارزميات تطابق بحثك" : "No algorithms match your search"}</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${selected.color} rounded-t-2xl`} />
              <div className="p-6 space-y-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{isAr ? selected.nameAr : selected.name}</h2>
                    <p className="text-sm text-muted-foreground font-mono mt-0.5">{isAr ? selected.name : selected.nameAr}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selected.inventor} · {selected.year}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-xl font-light shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"
                  >
                    ✕
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isAr ? selected.descriptionAr : selected.description}
                </p>

                {/* Complexity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      {isAr ? "تعقيد الزمن" : "Time Complexity"}
                    </div>
                    <p className="font-mono font-bold text-lg">{selected.timeComplexity}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      {isAr ? "تعقيد الذاكرة" : "Space Complexity"}
                    </div>
                    <p className="font-mono font-bold text-lg">{selected.spaceComplexity}</p>
                  </div>
                </div>

                {/* Pseudocode */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    {isAr ? "الكود الوهمي" : "Pseudocode"}
                  </h3>
                  <div className="bg-zinc-950 dark:bg-zinc-900 rounded-xl p-4 font-mono text-xs text-green-400 space-y-0.5 leading-relaxed overflow-x-auto">
                    {selected.pseudocode.map((line, i) => (
                      <div key={i} className="whitespace-pre">{line}</div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary" />
                    {isAr ? "حالات الاستخدام الحقيقية" : "Real-World Use Cases"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(isAr ? selected.useCasesAr : selected.useCases).map((uc, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {uc}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">{isAr ? "المستوى:" : "Difficulty:"}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${DIFFICULTY_COLORS[selected.difficulty]}`}>
                    {isAr ? DIFFICULTY_LABELS[selected.difficulty].ar : DIFFICULTY_LABELS[selected.difficulty].en}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
