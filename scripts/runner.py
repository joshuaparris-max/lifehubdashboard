#!/usr/bin/env python3
"""Minimal automation runner stub.
Define jobs in scripts/jobs.json and run by name:
  python3 scripts/runner.py run job-name
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JOBS_FILE = Path(__file__).parent / 'jobs.json'

def load_jobs():
    if JOBS_FILE.exists():
        return json.loads(JOBS_FILE.read_text())
    return {}

def run_job(name):
    jobs = load_jobs()
    job = jobs.get(name)
    if not job:
        print('Unknown job', name); return
    cmd = job.get('cmd')
    print('Running:', cmd)
    subprocess.run(cmd, shell=True, check=False)

if __name__ == '__main__':
    if len(sys.argv) < 3 or sys.argv[1] != 'run':
        print('Usage: runner.py run <job-name>')
        sys.exit(1)
    run_job(sys.argv[2])
