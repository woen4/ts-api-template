 class LazyCls<T> {
  private value?: T;
  private evaluator: () => T;

  constructor(evaluator: () => T) {
      this.evaluator = evaluator;
  }

 async get(): Promise<T> {
      if (this.value === undefined) {
          this.value =await this.evaluator();  // O cálculo só é executado aqui
      }
      return this.value;
  }
}

export const Lazy = <T>(evaluator: () => T) => new LazyCls(evaluator);