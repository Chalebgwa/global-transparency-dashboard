# Project Management

This document outlines how we manage tasks and track progress for the Global Transparency Dashboard project.

## GitHub Project Board

We use a GitHub Project Board to track all work items through their lifecycle. The project board can be found at: [Global Transparency Dashboard Project](https://github.com/users/Chalebgwa/projects/1)

### Columns

- **📋 Backlog**: New issues that haven't been triaged yet
- **🔍 Ready**: Issues that are ready to be worked on
- **🏗️ In Progress**: Issues currently being worked on
- **👀 In Review**: Issues with open pull requests pending review
- **✅ Done**: Completed issues

### Automation

The project board is configured with automation to:
- Move issues to "In Progress" when a PR is opened that references the issue
- Move issues to "In Review" when a PR is ready for review
- Move issues to "Done" when the PR is merged

## Project Phases

Our development is organized into 4 main phases:

### Phase 1: Discovery & Planning (Weeks 1-4)
- Finalize MVP scope & data sources
- Validate APIs & sample data
- Architecture diagram & sprint plan

### Phase 2: MVP Development (Weeks 5-16)
- Data ingestion scripts (Node.js)
- Firestore schema & automated jobs
- REST API (Swagger)
- Frontend MVP (React)
- Unit tests & accessibility review

### Phase 3: Beta Launch (Weeks 17-20)
- Private beta release to NGOs, researchers
- Collect feedback & bug reports
- v0.1 public release

### Phase 4: Iteration & Polish (Weeks 21-24)
- UX/UI refinements
- Expanded documentation & demos
- Launch blog post & social outreach

## Issue Labels

We use the following labels to categorize issues:

### Type
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `question` - Further information is requested

### Priority
- `priority: critical` - Needs immediate attention
- `priority: high` - Important but not urgent
- `priority: medium` - Normal priority
- `priority: low` - Nice to have

### Component
- `backend` - Backend API related
- `frontend` - Frontend UI related
- `data` - Data ingestion and processing
- `infrastructure` - CI/CD, deployment, DevOps
- `testing` - Test related

### Phase
- `phase-1` - Discovery & Planning
- `phase-2` - MVP Development
- `phase-3` - Beta Launch
- `phase-4` - Iteration & Polish

## Contributing Workflow

1. **Pick an issue** from the "Ready" column
2. **Move to "In Progress"** and assign yourself
3. **Create a branch** with a descriptive name
4. **Work on the issue** following our coding standards
5. **Open a PR** that references the issue (e.g., "Closes #123")
6. **Request review** from maintainers
7. **Address feedback** if needed
8. **Merge** when approved (issue automatically moves to "Done")

## Creating New Issues

When creating new issues, please:

1. Use our issue templates for consistency
2. Add appropriate labels
3. Include detailed acceptance criteria
4. Reference related issues if applicable
5. Assign to the appropriate project phase

## Questions?

If you have questions about our project management process, please:
- Check the [CONTRIBUTING.md](../CONTRIBUTING.md) guide
- Open a discussion in our [Discussions](https://github.com/Chalebgwa/global-transparency-dashboard/discussions) section
- Ask in your pull request or issue comments