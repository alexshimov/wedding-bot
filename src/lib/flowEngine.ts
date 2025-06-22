import { flow, type ChatNode } from "./flow";

export class FlowEngine {
  private current: string;
  constructor(initial: string) {
    this.current = initial;
  }

  node(): ChatNode {
    return flow[this.current];
  }
  id() {
    return this.current;
  }

  /**
   * Move exactly one step ahead.
   * @param input text the guest just sent
   * @param ctx   full guest object (from Google Sheet)
   */
  advance(input: string, ctx: any) {
    const n = this.node();
    this.current = typeof n.next === "function" ? n.next(input, ctx) : n.next;
  }
}