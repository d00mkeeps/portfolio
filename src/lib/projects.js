// src/lib/projects.js
// Edit this file to update project info. Each entry maps to /projects/:slug

export const projects = [
  {
    slug: 'clear-box',
    name: 'Clear Box',
    tagline: 'Explainability layer for black-box ML models.',
    what: 'Built to make model decisions auditable for compliance teams. Generates plain-language rationale traces alongside predictions — useful anywhere a human needs to sign off on an automated decision.',
    stack: ['Python', 'FastAPI', 'React', 'SHAP'],
    status: 'shipped',
    link: null,
  },
  {
    slug: 'cognitive-trajectory-visualiser',
    name: 'Cognitive Trajectory Visualiser',
    tagline: 'Maps how reasoning paths evolve across LLM generations.',
    what: 'Research tooling that tracks semantic drift in chain-of-thought outputs over repeated prompting. Useful for teams red-teaming or evaluating model stability under distribution shift.',
    stack: ['Python', 'D3.js', 'OpenAI API', 'UMAP'],
    status: 'shipped',
    link: null,
  },
  {
    slug: 'volc',
    name: 'Volc',
    tagline: 'Lightweight infrastructure for async job pipelines.',
    what: 'Queue-based task runner built for small teams who need reliability without the ops overhead of Celery or Temporal. Persistent, retry-aware, observable out of the box.',
    stack: ['Go', 'Redis', 'Docker', 'React'],
    status: 'shipped',
    link: 'https://volc.uk',
  },
  {
    slug: 'crucible',
    name: 'Crucible',
    tagline: 'Automated stress-testing framework for financial models.',
    what: 'Runs parameterised scenario sweeps against spreadsheet or API-based models — Monte Carlo, historical replay, adversarial edge cases. Outputs structured diff reports for audit trails.',
    stack: ['Python', 'NumPy', 'Pandas', 'FastAPI'],
    status: 'shipped',
    link: null,
  },
  {
    slug: 'transfer-pricing-engine',
    name: 'Transfer Pricing Engine',
    tagline: 'Automated arm\'s-length pricing for intra-group transactions.',
    what: 'Implements OECD TP methods (CUP, TNMM, profit split) against live transaction data. Flags outliers, generates documentation ready for HMRC review, and exports to the standard XML filing format.',
    stack: ['Python', 'PostgreSQL', 'React', 'Docker'],
    status: 'shipped',
    link: null,
  },
]
