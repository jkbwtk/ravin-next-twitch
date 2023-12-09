import { DefaultStates, StatesObject } from '#bot/TemplateRunner';
import { prisma } from '#database/database';
import { Template } from '@prisma/client';


export class StateMap extends Map<DefaultStates, unknown> {
  public constructor(private template: Template) {
    super();
  }

  public set(key: DefaultStates, value: unknown): this {
    super.set(key, value);
    this.save();

    return this;
  }

  public delete(key: DefaultStates): boolean {
    const result = super.delete(key);
    this.save();

    return result;
  }

  public setStates(states: StatesObject): void {
    this.clear();

    for (const [key, value] of Object.entries(states)) {
      super.set(key as DefaultStates, value);
    }

    this.save();
  }

  private async save(): Promise<void> {
    await prisma.template.saveStates(this.template.id, this.toStatesObject());
  }

  public async load(): Promise<void> {
    const template = await prisma.template.getById(this.template.id);

    if (template !== null) {
      this.setStates(template.states);
    }
  }

  public toStatesObject(): StatesObject {
    return Object.fromEntries(this);
  }
}
