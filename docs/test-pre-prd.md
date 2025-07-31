# WordPress Custom Block Testing Strategy Pre-PRD

## 1. Overview

### 1.1 Background
In WordPress custom block development, the tight coupling with WordPress core APIs (such as useSelect) makes applying traditional unit testing approaches challenging. This document defines a practical and efficient testing strategy.

### 1.2 Objectives
- Establish a quality assurance process for custom blocks
- Optimize the balance between test execution cost and coverage
- Build a test architecture with AI utilization in mind

## 2. Current Challenges

### 2.1 Technical Constraints
- Difficulty in isolated block testing due to tight coupling with WordPress core APIs
- High execution cost of E2E tests
- Limitations of unit testing frameworks

### 2.2 Execution Environment Challenges
- E2E test execution time
- Load on CI/CD pipelines
- Barriers to AI automation

## 3. Testing Strategy

### 3.1 Test Pyramid Structure

```
┌─────────────────┐
│   E2E Tests     │ ← 20% (Critical paths only)
├─────────────────┤
│ Integration     │ ← 30% (Save function, attribute parsing)
├─────────────────┤
│   Unit Tests    │ ← 50% (Independent components)
└─────────────────┘
```

### 3.2 Classification by Block Complexity

#### Simple Blocks
- **Primary Testing Method**: E2E tests
- **Target**: Basic display and editing functionality
- **Reference Implementation**: `@wordpress/e2e-tests`

#### Advanced Blocks
- **Primary Testing Method**: Hybrid approach
  - WordPress-independent components: Unit tests
  - Integration features: E2E tests
- **Design Principle**: Strict separation of concerns

## 4. Specific Test Implementation Guidelines

### 4.1 E2E Tests

#### Scope
- Block insertion/deletion
- UI operations (click, input, drag & drop)
- Display verification in editor
- Inter-block interactions

#### Implementation Example
```javascript
// Test for block insertion and basic operations
test('should insert custom block and edit content', async ({ page, editor }) => {
  await editor.insertBlock({ name: 'my-plugin/custom-block' });
  await page.click('[data-type="my-plugin/custom-block"]');
  await page.type('.block-editor-rich-text__editable', 'Test content');
  await expect(page.locator('.wp-block-my-plugin-custom-block')).toContainText('Test content');
});
```

### 4.2 Snapshot Tests (Save Function)

#### Scope
- `save` function output markup
- Attribute persistence
- Backward compatibility assurance

#### Implementation Example
```javascript
describe('Block Save Output', () => {
  it('should generate correct markup', () => {
    const attributes = { content: 'Hello World', alignment: 'center' };
    const output = save({ attributes });
    expect(output).toMatchSnapshot();
  });
});
```

### 4.3 Integration Tests

#### Scope
- Attribute parsing (`<!-- wp:block-name {...} -->`)
- Block transformations
- Data validation

#### Reference Implementation
- [Gutenberg Integration Tests](https://github.com/WordPress/gutenberg/tree/trunk/test/integration)

### 4.4 Unit Tests (Independent Components)

#### Design Guidelines
```javascript
// ❌ WordPress-dependent implementation
const MyBlockEdit = ({ attributes, setAttributes }) => {
  const posts = useSelect(select => select('core').getEntityRecords('postType', 'post'));
  // ...
};

// ✅ Testable implementation
// components/PostList.js - WordPress-independent
export const PostList = ({ posts, onSelectPost }) => {
  // Pure React component
};

// blocks/MyBlock/Edit.js - Uses WordPress APIs
const MyBlockEdit = ({ attributes, setAttributes }) => {
  const posts = useSelect(/*...*/);
  return <PostList posts={posts} onSelectPost={/*...*/} />;
};
```

## 5. Test Execution Strategy

### 5.1 Prioritization

1. **Critical Path E2E**: Main user operation flows
2. **Save Snapshot**: Data integrity assurance
3. **Component Unit**: Business logic verification
4. **Full E2E**: Comprehensive behavior verification

### 5.2 Execution Timing

- **On PR**: Critical Path E2E + Snapshot + Unit
- **Main branch merge**: All tests
- **Pre-release**: Full E2E regression tests

## 6. AI Utilization Considerations

### 6.1 Challenges
- E2E test execution time as bottleneck
- Lack of structured data for test result analysis

### 6.2 Countermeasures
- Build parallel test execution environment
- Output test results in JSON format
- Automate screenshot and video recording

## 7. Implementation Roadmap

### Phase 1 (1-2 weeks)
- [ ] E2E test environment setup
- [ ] Critical path definition and test creation
- [ ] CI/CD pipeline integration

### Phase 2 (2-3 weeks)
- [ ] Snapshot test implementation
- [ ] Refactor existing blocks (improve testability)
- [ ] Add unit tests

### Phase 3 (1 month)
- [ ] Test coverage measurement and improvement
- [ ] Performance optimization
- [ ] Build interface for AI integration

## 8. Success Metrics

- **Test Coverage**: 80%+ (E2E + Unit)
- **E2E Execution Time**: Within 5 minutes (Critical Path)
- **Defect Detection Rate**: 90%+ before release
- **False Positive Rate**: Below 5%

## 9. References

- [WordPress Gutenberg E2E Tests](https://github.com/WordPress/gutenberg/tree/trunk/test/e2e/specs/editor/blocks)
- [Testing React Components in Gutenberg](https://developer.wordpress.org/block-editor/how-to-guides/testing/)
- [Zenn - Discussion on WordPress Block Testing](https://zenn.dev/chiilog/scraps/ee1c5f14e6da3a)

## 10. Next Steps

1. Review and approval of this strategy
2. Test environment technology selection (Playwright vs Puppeteer)
3. Pilot project selection
4. Begin implementation