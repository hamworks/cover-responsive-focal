# Cover Responsive Focal

WordPress plugin for responsive focal points in cover blocks.

## Development Setup

### IDE Configuration (VS Code + Intelephense)

This project follows WordPress development best practices for IDE setup:

#### Recommended Setup

1. **Install Intelephense extension** for VS Code
2. **Install WordPress stubs globally** (recommended approach):
   ```bash
   composer global require php-stubs/wordpress-stubs
   ```
3. **Configure Intelephense** in your global VS Code settings:
   ```json
   {
     "intelephense.stubs": [
       "wordpress",
       "wordpress-globals",
       "Core"
     ]
   }
   ```

#### Alternative: Project-level Setup

If you prefer project-level dependencies:
```bash
composer install  # Installs wordpress-stubs locally
```

#### What This Provides

- ✅ **Type hints** for all WordPress functions
- ✅ **Code completion** for WordPress API
- ✅ **Error detection** for function calls
- ✅ **PHPUnit support** for testing
- ✅ **Cross-project consistency**

> **Note**: The project includes minimal `.vscode/settings.json` for team collaboration, but WordPress stubs should ideally be configured globally in your IDE.

### Testing

```bash
# JavaScript tests
npm test

# PHP tests
composer test

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# ESLint
npm run lint
```