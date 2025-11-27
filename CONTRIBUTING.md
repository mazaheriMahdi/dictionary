# Contributing to Dictionary Service

Thank you for your interest in contributing to Dictionary Service! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/dictionary-service.git
   cd dictionary-service
   ```

2. **Set up development environment**
   ```bash
   # Install Go dependencies
   go mod download
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## 📝 Development Guidelines

### Code Style

**Go:**
- Follow [Effective Go](https://golang.org/doc/effective_go) guidelines
- Use `gofmt` to format code
- Run `golint` and fix warnings
- Keep functions small and focused

**JavaScript/React:**
- Follow ESLint rules
- Use functional components with hooks
- Keep components small and reusable
- Use meaningful variable names

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new autocomplete endpoint
fix: resolve CORS issue in production
docs: update API documentation
refactor: improve dictionary loading performance
test: add unit tests for converter
chore: update dependencies
```

### Testing

- Write tests for new features
- Ensure all tests pass before submitting
- Add tests for bug fixes

```bash
# Run Go tests
go test ./...

# Run frontend tests (when available)
cd frontend && npm test
```

### Documentation

- Update README.md for user-facing changes
- Update API.md for API changes
- Add code comments for complex logic
- Update inline documentation

## 🔄 Pull Request Process

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure code quality**
   - All tests pass
   - Code is formatted
   - No linter errors
   - Documentation updated

3. **Create Pull Request**
   - Clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - Add tests if applicable

4. **Respond to feedback**
   - Address review comments
   - Make requested changes
   - Keep discussion constructive

## 🐛 Reporting Bugs

Use the [GitHub issue tracker](https://github.com/yourusername/dictionary-service/issues).

**Include:**
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Go version, etc.)
- Error messages or logs
- Screenshots if applicable

## 💡 Suggesting Features

**Feature requests should include:**
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if you have ideas)
- Any alternatives considered

## 🏗️ Project Structure

```
dictionary-service/
├── cmd/              # Application entry points
├── internal/         # Internal packages (not for external use)
├── frontend/         # React frontend
├── docs/             # Documentation
└── tests/            # Test files
```

## 📋 Checklist for Contributors

Before submitting:

- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] All CI checks pass

## 🎯 Areas for Contribution

- **Performance**: Optimize dictionary loading and lookups
- **Features**: New API endpoints, UI improvements
- **Documentation**: Improve guides, add examples
- **Testing**: Increase test coverage
- **Bug Fixes**: Fix reported issues
- **Examples**: Add usage examples
- **Translations**: Help with internationalization

## 📞 Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/yourusername/dictionary-service/discussions)
- **Bugs**: Create an [Issue](https://github.com/yourusername/dictionary-service/issues)
- **Security**: Email security@example.com (don't use GitHub issues)

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to Dictionary Service! 🎉

