# GitHub Project Automation Configuration

This document describes the automation rules for the Global Transparency Dashboard GitHub Project.

## Project Setup

1. **Create GitHub Project Board**: Go to https://github.com/users/Chalebgwa/projects and create a new project
2. **Configure Columns**:
   - 📋 Backlog
   - 🔍 Ready  
   - 🏗️ In Progress
   - 👀 In Review
   - ✅ Done

## Automation Rules

### Moving to "In Progress"
- **Trigger**: Pull request opened that references an issue
- **Action**: Move referenced issue to "In Progress" column

### Moving to "In Review" 
- **Trigger**: Pull request marked as ready for review
- **Action**: Move referenced issue to "In Review" column

### Moving to "Done"
- **Trigger**: Pull request merged
- **Action**: Move referenced issue to "Done" column and close issue

## GitHub Actions Workflow for Project Management

Create `.github/workflows/project-automation.yml`:

```yaml
name: Project Board Automation

on:
  issues:
    types: [opened, closed, reopened]
  pull_request:
    types: [opened, ready_for_review, closed]

jobs:
  project-automation:
    runs-on: ubuntu-latest
    steps:
      - name: Move issue to project board
        uses: alex-page/github-project-automation-plus@v0.8.3
        with:
          project: Global Transparency Dashboard
          column: Backlog
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Labels for Automation

The project uses these labels for automated categorization:

### Phase Labels
- `phase-1`: Discovery & Planning
- `phase-2`: MVP Development  
- `phase-3`: Beta Launch
- `phase-4`: Iteration & Polish

### Component Labels
- `backend`: Backend API work
- `frontend`: Frontend UI work
- `data`: Data ingestion and processing
- `infrastructure`: CI/CD, deployment, DevOps
- `documentation`: Documentation updates
- `testing`: Test-related work

### Priority Labels
- `priority: critical`: Needs immediate attention
- `priority: high`: Important but not urgent
- `priority: medium`: Normal priority
- `priority: low`: Nice to have

## Manual Project Board Management

If automation isn't available, manually move issues:

1. **New Issue Created** → Move to "📋 Backlog"
2. **Issue Assigned/Work Started** → Move to "🔍 Ready" then "🏗️ In Progress"
3. **PR Opened** → Move to "👀 In Review"  
4. **PR Merged** → Move to "✅ Done"

## Project Views

Create filtered views for different perspectives:

1. **By Phase**: Filter by phase-1, phase-2, etc.
2. **By Component**: Filter by backend, frontend, data, etc.
3. **By Priority**: Filter by priority labels
4. **By Assignee**: Filter by team member
5. **Current Sprint**: Issues in "Ready" and "In Progress"

## Integration with Issues

When creating issues:
- Use issue templates for consistency
- Add appropriate labels for automatic filtering
- Reference related issues and PRs
- Update project board manually if automation fails

## Project Metrics

Track these metrics for project health:
- Issues closed per week
- Average time in each column
- Issues by phase completion percentage
- Contributors active per month
- PR review time average