# Contributing to QuickReflex

Thank you for your interest in contributing to QuickReflex! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Set up your development environment (see README.md)
5. Create a branch for your changes

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Provide type annotations for function parameters and return values
- Use interfaces for complex object types
- Prefer `type` for union types and primitives

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Use descriptive `data-testid` attributes for testing
- Follow the existing component structure in `/client/src/components`

### Testing
- Write unit tests for utility functions
- Test user interactions with appropriate test IDs
- Validate scientific accuracy of timing calculations
- Test offline functionality

### Code Style
- Use Prettier for code formatting
- Follow ESLint configuration
- Use meaningful variable and function names
- Comment complex scientific calculations

## Scientific Standards

### Timing Precision
- All timing measurements must use `performance.now()` API
- Implement proper calibration for device-specific latencies
- Follow established research protocols for outlier detection

### Data Integrity
- Never use mock or placeholder data in production
- Implement proper validation for all user inputs
- Ensure data export formats meet research standards

### Test Protocols
- Follow published scientific literature for test implementations
- Validate accuracy calculations against established norms
- Document any deviations from standard protocols

## Submitting Changes

### Pull Request Process
1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md with your changes
5. Submit pull request with clear description

### Commit Messages
Use conventional commit format:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `test:` adding or updating tests
- `refactor:` code refactoring without feature changes
- `perf:` performance improvements

Example: `feat: add 4-choice CRT spatial accuracy validation`

### Code Review
- Address all feedback promptly
- Make sure your code follows existing patterns
- Ensure backward compatibility
- Test on multiple devices/browsers if relevant

## Reporting Issues

### Bug Reports
Include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Screenshots if applicable
- Console error messages

### Feature Requests
Include:
- Use case description
- Scientific justification if applicable
- Proposed implementation approach
- Alternative solutions considered

## Research Contributions

### Scientific Validation
- Cite relevant literature for new test protocols
- Provide validation data when possible
- Document any assumptions or limitations
- Consider cross-cultural applicability

### Data Analysis Features
- Implement established statistical methods
- Provide references for calculation methods
- Include confidence intervals where appropriate
- Support multiple export formats for different analysis tools

## Documentation

### Code Documentation
- Document complex algorithms inline
- Provide JSDoc comments for public APIs
- Update README.md for significant changes
- Include examples in documentation

### User Documentation
- Update user guides for new features
- Provide screenshots for UI changes
- Include scientific background where relevant
- Maintain accuracy of calibration instructions

## Community Guidelines

- Be respectful and inclusive
- Help others learn and contribute
- Focus on scientific accuracy and user needs
- Collaborate openly and constructively

## Questions?

- Open a GitHub Discussion for general questions
- Create an Issue for specific bugs or features
- Contact maintainers for research collaboration
- Check existing documentation first

Thank you for contributing to open science and research tools!