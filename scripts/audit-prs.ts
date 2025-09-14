import { execSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';

interface Repo {
  owner: string;
  repo: string;
}

interface PRInfo {
  number: number;
  title: string;
  headRefName: string;
  baseRefName: string;
  mergeStateStatus: string;
  mergeable: string;
  isDraft: boolean;
  reviewDecision: string | null;
  latestChecks: { name: string; conclusion: string | null; status: string; url?: string }[] | null;
  url: string;
}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN is required');
  process.exit(1);
}

function getRepo(): Repo {
  const env = process.env.GITHUB_REPOSITORY;
  if (env) {
    const [owner, repo] = env.split('/');
    return { owner, repo };
  }
  const remote = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
  const match = remote.match(/[:/]([^/]+)\/([^/]+)\.git$/);
  if (!match) throw new Error(`Cannot parse repo from URL: ${remote}`);
  return { owner: match[1], repo: match[2] };
}

async function gh(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      ...init.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }
  return res;
}

async function getWorkflowId(repo: Repo, name: string): Promise<number> {
  const data = await (await gh(`https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/workflows`)).json();
  const wf = data.workflows.find((w: any) => w.name === name);
  if (!wf) throw new Error(`Workflow ${name} not found`);
  return wf.id;
}

async function dispatchWorkflow(repo: Repo, id: number) {
  await gh(`https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/workflows/${id}/dispatches`, {
    method: 'POST',
    body: JSON.stringify({ ref: 'main' }),
  });
}

async function waitForRun(repo: Repo, workflowId: number) {
  const timeout = Date.now() + 90_000;
  while (Date.now() < timeout) {
    const data = await (
      await gh(`https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/workflows/${workflowId}/runs?event=workflow_dispatch&branch=main&per_page=1&page=1`)
    ).json();
    const run = data.workflow_runs?.[0];
    if (run && run.status === 'completed') return run;
    await delay(5000);
  }
  throw new Error('Timed out waiting for workflow run');
}

async function getJobs(repo: Repo, runId: number) {
  const data = await (await gh(`https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/runs/${runId}/jobs`)).json();
  return data.jobs as any[];
}

async function getJobLog(repo: Repo, jobId: number): Promise<string> {
  const res = await gh(`https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/jobs/${jobId}/logs`);
  const buf = Buffer.from(await res.arrayBuffer());
  return gunzipSync(buf).toString('utf8');
}

function parsePrs(log: string): PRInfo[] {
  const result: PRInfo[] = [];
  const regex = /### PR #(\d+)\n([\s\S]+?)(?:\n{2,}|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(log)) !== null) {
    const jsonStr = match[2].trim();
    try {
      const pr = JSON.parse(jsonStr) as PRInfo;
      result.push(pr);
    } catch (err) {
      // ignore parse errors
    }
  }
  return result;
}

function summarizeChecks(checks: PRInfo['latestChecks']): string {
  if (!checks || checks.length === 0) return '—';
  const failed = checks.filter((c) => c.conclusion && c.conclusion !== 'SUCCESS');
  const pending = checks.filter((c) => !c.conclusion || c.status !== 'COMPLETED');
  if (failed.length) return 'fail';
  if (pending.length) return 'pending';
  return 'pass';
}

function nextActions(pr: PRInfo): string[] {
  const actions: string[] = [];
  if (pr.mergeable !== 'MERGEABLE') {
    if (pr.mergeStateStatus === 'BEHIND') actions.push('update from base');
    else actions.push('resolve conflicts');
  }
  if (pr.reviewDecision !== 'APPROVED') actions.push('needs review');
  const checks = pr.latestChecks || [];
  const failed = checks.filter((c) => c.conclusion && c.conclusion !== 'SUCCESS');
  const pending = checks.filter((c) => !c.conclusion || c.status !== 'COMPLETED');
  if (failed.length) actions.push(`fix checks: ${failed.map((c) => c.name).join(', ')}`);
  if (pending.length) actions.push(`wait for checks: ${pending.map((c) => c.name).join(', ')}`);
  return actions;
}

function printTable(prs: PRInfo[]) {
  const rows = prs.map((p) => ({
    pr: `#${p.number}`,
    title: p.title,
    branch: `${p.headRefName}→${p.baseRefName}`,
    mergeable: p.mergeable,
    review: p.reviewDecision ?? '—',
    checks: summarizeChecks(p.latestChecks),
    action: nextActions(p).join('; '),
  }));
  console.table(rows);
  console.log('\nBlocking issues & next actions:');
  rows.forEach((r) => {
    if (r.action) console.log(`- ${r.pr}: ${r.action}`);
  });
}

async function main() {
  const repo = getRepo();
  const wfId = await getWorkflowId(repo, 'PR Audit');
  await dispatchWorkflow(repo, wfId);
  const run = await waitForRun(repo, wfId);
  const jobs = await getJobs(repo, run.id);
  const jobStatus = jobs.map((j) => `${j.name}: ${j.conclusion}`).join(', ');
  console.log(`Status: workflow ${run.conclusion}; jobs ${jobStatus}`);
  const log = await getJobLog(repo, jobs[0].id);
  const prs = parsePrs(log);
  printTable(prs);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
