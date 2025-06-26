class MatcherCls<TCondition, TResult = never> {
  private condition: TCondition
  private matches: Array<{
    condition: TCondition
    action: () => unknown
  }> = []

  constructor(condition: TCondition) {
    this.condition = condition
  }

  // Sobrecarga quando o "action" é uma função (sincronous ou async)
  match<NewResult>(
    condition: TCondition,
    action: () => NewResult | Promise<NewResult>,
  ): MatcherCls<TCondition, TResult | NewResult>
  // Sobrecarga quando o "action" é um valor (sincronous ou Promise)
  match<NewResult>(
    condition: TCondition,
    action: NewResult | Promise<NewResult>,
  ): MatcherCls<TCondition, TResult | NewResult>

  // Implementação
  match<NewResult>(
    condition: TCondition,
    action:
      | (() => NewResult | Promise<NewResult>)
      | (NewResult | Promise<NewResult>),
  ): MatcherCls<TCondition, TResult | NewResult> {
    const actionFn = (
      typeof action === 'function'
        ? (action as () => NewResult | Promise<NewResult>)
        : () => action
    ) as () => NewResult | Promise<NewResult>

    this.matches.push({
      condition,
      action: actionFn,
    })

    return this as unknown as MatcherCls<TCondition, TResult | NewResult>
  }

  async evaluate(): Promise<Awaited<TResult> | undefined> {
    const matched = this.matches.find((m) => m.condition === this.condition)
    if (!matched) return undefined
    return (await matched.action()) as Awaited<TResult>
  }
}

export const Matcher = <T, R = never>(condition: T) =>
  new MatcherCls<T, R>(condition)
