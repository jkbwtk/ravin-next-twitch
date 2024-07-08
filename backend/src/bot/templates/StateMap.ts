import { TemplateController } from '#database/controllers/TemplateController';
import { Template } from '#types/api/templates';
import { DefaultStates, StatesObject } from '#types/database/columns';


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
    const newTemplate = await TemplateController.update({
      id: this.template.id,
      states: this.toStatesObject(),
    });

    if (newTemplate !== null) {
      this.template = newTemplate;
    }
  }

  public async load(): Promise<void> {
    const template = await TemplateController.getById(this.template.id);

    if (template !== null) {
      this.setStates(template.states);
    }
  }

  public toStatesObject(): StatesObject {
    return Object.fromEntries(this);
  }
}
