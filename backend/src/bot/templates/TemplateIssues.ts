import { logger } from '#lib/logger';
import { TemplateIssue } from '#types/api/templates';
import { TemplateEnvironments } from '#types/database/columns';


export class TemplateIssues extends Map<TemplateEnvironments, TemplateIssue | null> {
  public serialize(): Record<TemplateEnvironments, TemplateIssue | null> {
    return Object.fromEntries(this.entries()) as Record<TemplateEnvironments, TemplateIssue | null>;
  }

  public getSupportedEnvironments(): TemplateEnvironments[] {
    const environments: TemplateEnvironments[] = [];

    for (const [environment, issue] of this.entries()) {
      if (issue === null) environments.push(environment);
    }

    return environments;
  }

  public hasSyntaxError(): boolean {
    for (const issue of this.values()) {
      if (issue?.type === 'SyntaxError') return true;
    }

    return false;
  }

  public hasSupportedEnvironments(): boolean {
    return this.getSupportedEnvironments().length > 0;
  }

  private static sanitizeErrorMessage(message: string): string {
    return message.replace('<isolated-vm>', 'template');
  }

  public setIssue(environment: TemplateEnvironments, error: unknown): void {
    if (error instanceof SyntaxError) {
      this.set(environment, {
        type: 'SyntaxError',
        message: TemplateIssues.sanitizeErrorMessage(error.message),
      });
    } else if (error instanceof ReferenceError) {
      this.set(environment, {
        type: 'ReferenceError',
        message: TemplateIssues.sanitizeErrorMessage(error.message),
      });
    } else {
      logger.warn('Unknown error type', { label: ['TemplateIssues', 'setIssue'], error });
    }
  }

  public setNull(environment: TemplateEnvironments): void {
    this.set(environment, null);
  }
}
