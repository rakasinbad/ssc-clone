import { HasErrorFieldPipe } from './has-error-field.pipe';

describe('HasErrorFieldPipe', () => {
  it('create an instance', () => {
    const pipe = new HasErrorFieldPipe();
    expect(pipe).toBeTruthy();
  });
});
