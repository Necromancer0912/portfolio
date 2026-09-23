/* Everything the page says lives here. Components only lay it out.
   Tone: say what was built and what was learned. Let the work speak. */

export const GITHUB_USER = "Necromancer0912";

export const profile = {
  name: "Sayan Das",
  email: "sayan20012002@gmail.com",
  instituteEmail: "sayan25041@iiitd.ac.in",
  github: `https://github.com/${GITHUB_USER}`,
  resume: "/sayan-das-resume.pdf",
  location: "New Delhi, India",
  eyebrow: "M.Tech CSE student · IIIT Delhi",
  headline: ["Models that listen.", "Packets that arrive."],
  intro:
    "I'm a student who likes both ends of the stack: speech and language models on one side, the network protocols that carry their traffic on the other. Most of what's here started as coursework or a question I couldn't let go of. Currently interning at Foodoscope.",
};

export const nav = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "results", label: "Notes" },
  { id: "papers", label: "Papers" },
  { id: "shell", label: "Shell" },
  { id: "contact", label: "Contact" },
];

export const specs = [
  ["PyTorch", "C++17"],
  ["ns-3", "Kubernetes"],
  ["LangGraph", "Docker"],
];

export const domains = [
  {
    n: "001",
    title: "Speech and language",
    body: "Fine-tuning Whisper for Bengali–English speech, rescoring its guesses with small LLMs, and writing a GPT-style model by hand to understand what the libraries do for me.",
    tags: ["Whisper", "LoRA", "RoPE", "MBR"],
  },
  {
    n: "002",
    title: "Transport and networks",
    body: "Implementing Ultra Ethernet Transport in ns-3 from the spec, and learning — slowly — why reliable delivery at data-centre scale is hard.",
    tags: ["ns-3", "RDMA", "RoCEv2", "C++17"],
  },
  {
    n: "003",
    title: "Retrieval and agents",
    body: "RAG systems that try to answer from sources rather than guess: hybrid search, reranking, caching, and guardrails for the queries that shouldn't run.",
    tags: ["LangGraph", "Qdrant", "Redis", "FastAPI"],
  },
  {
    n: "004",
    title: "Systems and infrastructure",
    body: "Kubernetes networking benchmarks, multithreaded C++, and a couple of programs written without the standard library, mostly to see what breaks.",
    tags: ["Kubernetes", "eBPF", "Threads", "No-std"],
  },
];

export const experience = [
  {
    period: "May 2026 — Now",
    role: "Software Engineering Intern",
    org: "Foodoscope",
    points: [
      "Working with the team on containerised RAG and semantic search pipelines; moving lookups onto local SQLite helped bring response latency down.",
      "Added read-only SQL guardrails so the model can read the database but never change it or return rows it shouldn't.",
      "Built REST APIs for FlavourDB on MongoDB aggregation, mapping molecules to the foods they appear in.",
    ],
  },
  {
    period: "Jan — May 2026",
    role: "Teaching Assistant, Network Security",
    org: "IIIT Delhi",
    points: [],
  },
  {
    period: "Aug — Dec 2025",
    role: "Teaching Assistant, Introduction to Programming",
    org: "IIIT Delhi",
    points: [],
  },
];

export type Diagram = "asr" | "uet" | "gpt" | "rag" | "lung" | "cni" | "cell";

export type Project = {
  n: string;
  title: string;
  period: string;
  guide?: string;
  team?: string;
  repo?: string;
  live?: string;
  metric: { before?: string; after: string; label: string };
  summary: string;
  detail: string[];
  stack: string[];
  diagram: Diagram;
};

export const projects: Project[] = [
  {
    n: "001",
    title: "Code-mixed speech recognition",
    period: "Jan — May 2026",
    guide: "Dr. Md Shad Akhtar",
    team: "2",
    repo: `https://github.com/${GITHUB_USER}/Enhancing-Code-Mixed-Speech-Recognition-using-Whisper-Fine-Tuning-and-LLM-Based-Contextual-Rescoring`,
    metric: { before: "195%", after: "39.6%", label: "Word error rate, zero-shot → after tuning" },
    summary:
      "Reproducing the CLEAR recipe (ICNLSP 2025) on Bengali–English speech, a language pair the paper didn't cover, on a single 8 GB GPU.",
    detail: [
      "Zero-shot Whisper fell into hallucination loops on this data. Ninety minutes of decoder-only fine-tuning brought S-WER to 41.2%; rescoring the n-best list with an LLM brought it to 39.6%.",
      "One lesson: on Bengali, LLM scores only helped when mixed with the ASR score. MBR consensus decoding, with no extra model, recovered about two thirds of the gain.",
      "Along the way, tracked down a transformers 5.x regression where beam search quietly returned the same beam N times, which turns any rescoring into a no-op.",
    ],
    stack: ["PyTorch", "Whisper", "BLOOM", "LoRA"],
    diagram: "asr",
  },
  {
    n: "002",
    title: "Ultra Ethernet Transport in ns-3",
    period: "Jan — Jun 2026",
    guide: "Prof. Rinku Shah",
    team: "3",
    repo: `https://github.com/${GITHUB_USER}/ultra-ethernet-transport-ns3`,
    metric: { before: "8%", after: "100%", label: "Messages completed under 1% packet loss" },
    summary:
      "The SES and PDS sublayers of the Ultra Ethernet spec, built inside ns-3 (SimAI), which has no UET support of its own.",
    detail: [
      "Wire formats, in-band connection setup, SACK bitmaps, NACK handling and RTO-driven retransmission, checked by a deterministic 86-check test suite.",
      "Reproducing IRN (SIGCOMM 2018) was the most instructive part: with go-back-N, 8% of messages completed under 1% loss; with selective retransmission and a reorder buffer, all of them did.",
    ],
    stack: ["C++17", "ns-3", "RDMA", "RoCEv2"],
    diagram: "uet",
  },
  {
    n: "003",
    title: "Mini-GPT for Hindi",
    period: "Feb — Apr 2026",
    guide: "Dr. Md Shad Akhtar",
    team: "2",
    repo: `https://github.com/${GITHUB_USER}/HindiMiniGPT`,
    metric: { after: "−4.3%", label: "Validation perplexity, RoPE + RMSNorm vs vanilla" },
    summary:
      "A decoder-only transformer written from scratch, trained on 33k Hindi documents on one consumer GPU, then turned into a sentiment classifier.",
    detail: [
      "Attention, the causal mask and the positional encodings are written by hand and checked against PyTorch's fused attention before any training.",
      "On 718 movie reviews, a simple classical model beat the from-scratch transformer. The write-up tries to explain why.",
      "Also benchmarked distillation and FP32 / FP16 / INT8 quantization to see what each speed-up actually costs.",
    ],
    stack: ["PyTorch", "SentencePiece", "LoRA", "Quantization"],
    diagram: "gpt",
  },
  {
    n: "004",
    title: "Legal QA with LangGraph agents",
    period: "Mar — Jun 2026",
    team: "2",
    metric: { after: "BM25 + dense", label: "Hybrid retrieval, cross-encoder reranked" },
    summary:
      "A multi-agent RAG system that answers questions about Indian law from source text, streamed to the browser as it's generated.",
    detail: [
      "Keyword and semantic search combined, reranked with a BGE cross-encoder; LangGraph agents keep the conversation state, Redis handles caching and memory.",
      "The LLM runs locally. The frontend is on Vercel and reaches a self-hosted backend through a Tailscale Funnel, behind Nginx, in Docker.",
    ],
    stack: ["LangGraph", "FastAPI", "Qdrant", "Redis"],
    diagram: "rag",
  },
  {
    n: "005",
    title: "LungInsight",
    period: "Jan 2026",
    repo: `https://github.com/${GITHUB_USER}/LungInsight`,
    metric: { after: "16+", label: "Follow-up questions generated per case" },
    summary:
      "A local-first desktop console that runs breath-sound and chest X-ray models, then uses a local LLM to ask follow-up questions and draft a structured report.",
    detail: [
      "Electron and React on top of a Flask API; Ollama for the language model, so nothing leaves the machine.",
      "Reports carry severity, red flags and escalation criteria — meant as a draft for a clinician, not a diagnosis.",
    ],
    stack: ["React", "Electron", "Flask", "Ollama"],
    diagram: "lung",
  },
  {
    n: "006",
    title: "Kubernetes CNI benchmarking",
    period: "Jan — Jun 2026",
    guide: "Prof. Rinku Shah",
    team: "4",
    repo: `https://github.com/${GITHUB_USER}/kubernetes-cni-performance-benchmarking`,
    metric: { after: "~12×", label: "Cilium vs Flannel TCP throughput at 128 MB" },
    summary:
      "Flannel, Calico (VXLAN and BGP) and Cilium measured on a real multi-node cluster across three workload sizes.",
    detail: [
      "Each plugin was torn down fully before the next went in, so no run inherited another's state. Throughput, latency, packet loss, CPU and memory, then a composite score.",
      "The interesting part was that there's no single winner: Cilium led on throughput, but its CPU and memory cost pushed it down the ranking at larger workloads.",
    ],
    stack: ["Kubernetes", "Cilium", "Calico", "iPerf3"],
    diagram: "cni",
  },
  {
    n: "007",
    title: "Cellular network simulator",
    period: "2025 — 2026",
    repo: `https://github.com/${GITHUB_USER}/cellular-network-simulator`,
    metric: { after: "3.26×", label: "Thread-pool speedup, 100k devices, 8 threads" },
    summary:
      "A C++17 simulator for 2G–7G capacity planning with a hand-rolled terminal dashboard. Started as OOPD coursework with a team.",
    detail: [
      "The first benchmark claimed 7.08×. It turned out to be timing threads that were mostly sleeping. The real number was 0.39×, slower than one thread; fixing the pool got it to 3.26×.",
      "Two class hierarchies with real polymorphism, a thread-safe generic container, and a full-screen TUI with seven live tabs, no external library.",
    ],
    stack: ["C++17", "Threads", "TUI", "Make"],
    diagram: "cell",
  },
];

export type ArchiveKind = "ml" | "systems" | "web";

/* Everything else on GitHub worth a line. */
export const archive: { name: string; year: string; kind: ArchiveKind; note: string; repo: string; live?: string }[] = [
  { name: "UET Explorer", year: "2026", kind: "web", note: "Interactive visual guide to the Ultra Ethernet Transport stack", repo: "UET-Explorer", live: "https://uetexplorer.vercel.app/" },
  { name: "nostd BibTeX engine", year: "2026", kind: "systems", note: "BibTeX parser with no standard library; assembly syscall wrappers", repo: "nostd-bibtex-engine" },
  { name: "nostd student registry", year: "2026", kind: "systems", note: "Freestanding C++: custom allocator, strings and a trie", repo: "nostd-student-db" },
  { name: "Concurrent academic ERP", year: "2026", kind: "systems", note: "Multithreaded C++17 ERP with parallel merge-sort and templates", repo: "concurrent-academic-erp" },
  { name: "Chanakya AI Discord bot", year: "2025", kind: "ml", note: "Stable Diffusion images and LLaMA 3.1 chat, served through Ollama", repo: "Chanakya-AI-Discord-Bot" },
  { name: "Brain tumour MRI architectures", year: "2025", kind: "ml", note: "Code for the SAETCN and SASNet classification and segmentation models", repo: "SAETCN-and-SASNET-Architectures" },
  { name: "English → Bengali translator", year: "2024", kind: "ml", note: "Seq2seq translation with GloVe embeddings", repo: "English-to-Bengali-Translator-Model-using-Glove-and-Seq2seq" },
  { name: "Toxic comment classification", year: "2024", kind: "ml", note: "CNN with GloVe on the Jigsaw dataset, TensorFlow 2", repo: "jigsaw-toxic-comment-classification-using-CNN-Glove-and-TF2" },
  { name: "Named entity recognition", year: "2024", kind: "ml", note: "Sequence tagging in TensorFlow 2", repo: "Named-Entity-Recognition-NER-using-TensorFlow-2" },
  { name: "POS tagging", year: "2024", kind: "ml", note: "Part-of-speech tagging in TensorFlow 2", repo: "POS-tagging-using-TF2" },
  { name: "TextRank summarisation", year: "2024", kind: "ml", note: "Graph-based extractive summaries", repo: "TextRank-Text-Summarization" },
  { name: "Text summarisation", year: "2024", kind: "ml", note: "Classical ML approach to summaries", repo: "Text-Summarization-Machine-Learning-Approach" },
  { name: "Topic modelling with NMF", year: "2024", kind: "ml", note: "Non-negative matrix factorisation on text", repo: "Topic-Modeling-using-NMF-Non-negative-Matrix-Factorization-" },
  { name: "Latent Dirichlet allocation", year: "2024", kind: "ml", note: "Probabilistic topic modelling", repo: "Latent-Dirichlet-Allocation" },
  { name: "CBOW word vectors", year: "2024", kind: "ml", note: "Continuous bag-of-words in TensorFlow 2", repo: "CBOW-in-TensorFlow-2" },
  { name: "CNN text classification", year: "2024", kind: "ml", note: "Convolutional text classifiers", repo: "CNN-Text-Classification" },
  { name: "Sentiment analysis", year: "2024", kind: "ml", note: "Classical ML sentiment models", repo: "Sentiment-Analysis-Machine-Learning-approach" },
  { name: "Spam detection", year: "2024", kind: "ml", note: "Classical ML spam filter", repo: "Spam-Detection-Machine-Learning-approach" },
  { name: "Markov model classifier", year: "2024", kind: "ml", note: "Author attribution with Markov chains", repo: "Markov-Model-Classifier" },
  { name: "Poetry generator (DL)", year: "2024", kind: "ml", note: "Neural text generation", repo: "Poetry-Generator-using-Deep-Learning-Approach" },
  { name: "Poetry generator (ML)", year: "2024", kind: "ml", note: "Markov text generation", repo: "Poetry-Generator-using-Machine-Learning-Approach" },
  { name: "Article spinner", year: "2024", kind: "ml", note: "Probabilistic paraphrasing", repo: "Article-Spinner-using-Machine-Learning-approach" },
  { name: "Movie recommendation", year: "2024", kind: "ml", note: "Collaborative filtering", repo: "Movie-Recommendation-Using-Machine-Learning-Approach" },
  { name: "BiLSTM image classification", year: "2024", kind: "ml", note: "Treating image rows as sequences", repo: "BiLSTM-Image-Classification" },
  { name: "CIFAR classification", year: "2024", kind: "ml", note: "CNN in PyTorch", repo: "CIFAR-Classification-using-CNN-in-PyTorch" },
  { name: "Fashion-MNIST CNN", year: "2024", kind: "ml", note: "CNN in PyTorch", repo: "CNN-Fashion-MNIST-in-PyTorch" },
  { name: "Moore's law regression", year: "2024", kind: "ml", note: "Linear regression in PyTorch", repo: "Regression-Moore-s-Law-using-PyTorch" },
];

/* The notes carousel: things measuring taught me. */
export const results = [
  {
    n: "001",
    tag: "Code-mixed ASR",
    text: "Off the shelf, Whisper scored 195% word error on Bengali–English speech. A little fine-tuning and some rescoring got it to 39.6%. It still has a lot to learn.",
  },
  {
    n: "002",
    tag: "Ultra Ethernet Transport",
    text: "Under 1% packet loss, go-back-N finished 8% of messages. Selective ACKs and a reorder buffer finished all of them. The paper was right; I just had to see it for myself.",
  },
  {
    n: "007",
    tag: "Cellular simulator",
    text: "The benchmark said 7.08×. It was timing sleeping threads. The real number was 0.39×. After fixing the pool: 3.26×. I trust that one more.",
  },
  {
    n: "003",
    tag: "Mini-GPT",
    text: "My from-scratch transformer lost to a classical model on 718 movie reviews. It taught me more than a win would have.",
  },
  {
    n: "006",
    tag: "CNI benchmarking",
    text: "Cilium moved about twelve times more traffic than Flannel, and still didn't top every ranking. Most answers in systems turn out to be 'it depends'.",
  },
];

export const papers = [
  {
    year: "2026",
    authors: "Das, S., Karmakar, P., Das, S., Das, S.",
    title:
      "AI-optimized analysis of hybrid nanoparticles-infused milk flow in a rapidly moving electromagnetic channel with oscillating thermal ramping",
    venue: "Soft Computing · Springer",
  },
  {
    year: "2025",
    authors: "Das, S., Karmakar, P., Das, S., Dinarvand, S.",
    title:
      "AI-led study of dynamic changes in milk containing hybrid nanoparticles in an electromagnetically vibrated channel",
    venue: "Chinese Journal of Physics · Elsevier",
  },
  {
    year: "2025",
    authors: "Das, S., Biswas, A.",
    title:
      "Novel deep learning architectures for classification and segmentation of brain tumors from MRI images",
    venue: "arXiv preprint",
    link: `https://github.com/${GITHUB_USER}/SAETCN-and-SASNET-Architectures`,
  },
];

export const degrees = [
  {
    tag: "M.Tech · CSE",
    score: "7.76",
    scoreNote: "CGPA, through semester 2",
    school: "Indraprastha Institute of Information Technology, Delhi",
    period: "2025 — present",
  },
  {
    tag: "B.Tech · CSE",
    score: "8.83",
    scoreNote: "CGPA",
    school: "Ramkrishna Mahato Government Engineering College",
    period: "2021 — 2025",
  },
];

export const schooling = [
  { board: "WBCHSE", school: "Midnapore Collegiate School", score: "93.4%", year: "2020" },
  { board: "WBBSE", school: "Sarada Vidyamandir, Midnapore", score: "93.14%", year: "2018" },
];

export const skills = {
  languages: ["C", "C++", "Python", "JavaScript", "Java", "SQL"],
  ml: ["PyTorch", "Hugging Face", "scikit-learn", "TensorFlow", "LangGraph"],
  systems: ["Linux", "Docker", "Kubernetes", "ns-3", "HTSIM", "Redis", "Git"],
};

export const faq = [
  {
    q: "What do you work on?",
    a: "Machine learning for speech and language, and the systems underneath it — transport protocols, container networking, serving. I'm still a student, so a lot of it is me learning in public.",
  },
  {
    q: "Research or engineering?",
    a: "I enjoy both. The speech and Mini-GPT work is research-shaped: baselines, ablations, a number at the end. The RAG work is engineering-shaped: latency, guardrails, deployment. Each teaches me something about the other.",
  },
  {
    q: "Have you worked on anything in production?",
    a: "A little. At Foodoscope I work on RAG pipelines and APIs for FlavourDB, and the legal QA system is deployed end to end. Both taught me how much there is beyond the model.",
  },
  {
    q: "Which languages do you write?",
    a: "C and C++17 for systems work, Python for ML, JavaScript for the web, and Java and SQL when needed.",
  },
  {
    q: "Have you taught?",
    a: "I've been a TA at IIIT Delhi twice — Introduction to Programming, then Network Security. Explaining things to students is the fastest way I know to find out what I don't understand.",
  },
  {
    q: "What do you do away from a keyboard?",
    a: "I draw. There's a sketchpad at the bottom of this page if you'd like to leave something.",
  },
];
