# Contributing to Chess Review

Thank you for your interest in contributing to Chess Review! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/CHESS-REVIEW.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in README.md

## Code Style

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Use functional components with hooks
- Add types for all function parameters and return values
- Use meaningful variable and function names

### Python
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Add docstrings to functions and classes
- Keep functions focused and single-purpose

### CSS
- Use BEM naming convention where applicable
- Keep styles modular and reusable
- Use CSS variables for theming
- Ensure responsive design

## Testing

### Before Submitting
1. Run linter: `npm run lint`
2. Build the project: `npm run build`
3. Test manually in development mode
4. Ensure no console errors

### Writing Tests
- Add unit tests for complex logic
- Test edge cases and error handling
- Mock external dependencies
- Keep tests focused and readable

## Commit Messages

Follow conventional commits format:
- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update documentation`
- `style: Format code`
- `refactor: Refactor module`
- `test: Add tests`
- `chore: Update dependencies`

## Pull Request Process

1. Update README.md with any new features or changes
2. Ensure all tests pass and linting is clean
3. Update CHANGELOG if applicable
4. Create a PR with a clear description of changes
5. Link any related issues
6. Wait for code review

## Code Review

- Be respectful and constructive
- Explain your suggestions
- Be open to feedback
- Focus on code quality and maintainability

## Feature Development Guidelines

### Adding New Features
1. Discuss major features in an issue first
2. Break large features into smaller PRs
3. Add tests for new functionality
4. Update documentation
5. Consider backward compatibility

### Bug Fixes
1. Create an issue describing the bug
2. Include steps to reproduce
3. Add tests that fail before the fix
4. Verify tests pass after the fix

## Project Structure

- `/src/components` - Reusable React components
- `/src/pages` - Page-level components
- `/src/contexts` - React contexts for state management
- `/backend/app` - FastAPI backend code
- `/backend/app/database.py` - Database models
- `/backend/app/schemas.py` - Pydantic schemas

## Questions?

Feel free to open an issue for questions or discussions!
