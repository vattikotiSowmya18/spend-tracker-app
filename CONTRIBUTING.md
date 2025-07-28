# Contributing to Spend Tracker

We love your input! We want to make contributing to Spend Tracker as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with GitHub

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [GitHub Flow](https://guides.github.com/introduction/flow/index.html)

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/your-username/spend-tracker/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/your-username/spend-tracker/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

1. Fork and clone the repository
2. Run the setup script: `./setup.sh`
3. Follow the database setup instructions
4. Create your feature branch: `git checkout -b feature/my-new-feature`
5. Make your changes
6. Test your changes thoroughly
7. Commit your changes: `git commit -am 'Add some feature'`
8. Push to the branch: `git push origin feature/my-new-feature`
9. Submit a pull request

## Code Style

### Frontend (React)
- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable names
- Keep components small and focused
- Use CSS modules or styled-components for styling

### Backend (Flask)
- Follow PEP 8 style guide
- Use type hints where appropriate
- Write descriptive function and variable names
- Keep functions small and focused
- Add docstrings to functions and classes

### Database
- Use descriptive table and column names
- Always use proper indexes for performance
- Include foreign key constraints
- Document complex queries

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Test on multiple browsers for frontend changes
- Test API endpoints with different inputs

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Open an issue with the `enhancement` label
3. Describe the feature in detail
4. Explain why it would be useful
5. Consider offering to implement it yourself

## Code Review Process

1. All submissions require review
2. We may ask for changes before merging
3. We'll provide constructive feedback
4. Once approved, we'll merge your PR

## Community

- Be respectful and inclusive
- Help others when you can
- Follow our code of conduct
- Share your experience and knowledge

## Recognition

Contributors will be recognized in our README and release notes.

Thank you for contributing to Spend Tracker! 🎉