---
name: Issue Guidelines
about: General issue template with guidelines for bugs, features, and enhancements
title: '[TYPE] [Is it a Bug / Feature request / Enhancement request]'
labels: ''
assignees: ''
---

# 📝 Issue Guidelines

> **Please read this before creating your issue!**

## 🚨 Important Notice

Before submitting your issue, please help us by providing the right information based on what you're reporting:

### 🐞 **For Bug Reports:**
- **REQUIRED**: Provide screenshots or videos showing the bug
- **REQUIRED**: Include detailed steps to reproduce the issue
- **REQUIRED**: Describe what you expected vs what actually happened
- Include your browser and operating system information

### 💡 **For Feature Requests:**
- **REQUIRED**: Explain the problem you're trying to solve
- **REQUIRED**: Provide a detailed implementation plan before raising a PR
- **REQUIRED**: Describe your proposed solution in detail
- Consider alternative approaches and explain why yours is better

### ⚡ **For Enhancements:**
- **REQUIRED**: Explain how current functionality can be improved
- **REQUIRED**: Provide a detailed plan for implementation before raising a PR
- **REQUIRED**: Define clear acceptance criteria
- Consider the impact on existing users

---

## 📋 Issue Template

**Issue Type:** [ ] Bug Report | [ ] Feature Request | [ ] Enhancement

**Title:** Brief description of the issue

**Description:**
<!-- Replace this comment with your detailed description -->

**Steps to Reproduce** *(for bugs only)*:
1. 
2. 
3. 

**Expected Behavior:**
<!-- What should have happened? -->

**Actual Behavior:**
<!-- What actually happened? -->

**Screenshots/Videos:**
<!-- Please drag and drop screenshots or videos here -->

**Environment** *(for bugs only)*:
- OS: 
- Browser: 
- Version: 

**Implementation Plan** *(for features/enhancements)*:
<!-- Provide detailed plan including:
- Technical approach
- Required changes  
- Dependencies
- Timeline estimate -->

**Additional Context:**
<!-- Add any other context about the problem here -->

---

## 🔗 When Creating a PR

**Important:** When you create a Pull Request to fix this issue, include one of these keywords in your PR description to automatically close this issue when the PR is merged:

- `Closes #[issue_number]` (replace [issue_number] with this issue's number)
- `Fixes #[issue_number]`
- `Resolves #[issue_number]`

**Example:** `Closes #123` (if this is issue #123)
