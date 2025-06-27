/**********************************************************************
 * Behaviour-tree engine (sequence + selector)
 * — guarantees: whenever you call node() the top frame is a LEAF —
 *********************************************************************/

import { tree, flow, BTNode, ChatNode, Condition, Action } from "./flow";

/* helpers ­───────────────────────────────────────────────────────── */
interface Frame {
  node: BTNode;
  index: number;        // active child for composites; 0 for leaves
  entered: boolean;     // have we fired onEnter?
}
const pass = async (cs: Condition[] | undefined, ctx: any) =>
  !cs?.length || (await Promise.all(cs.map((c) => c(ctx)))).every(Boolean);

const run = async (as: Action[] | undefined, ctx: any, txt: string) => {
  if (as?.length) for (const a of as) await a(ctx, txt);
};

/* engine ­────────────────────────────────────────────────────────── */
export class FlowEngine {
  private stack: Frame[] = [];

  /** async factory – reconstruct cursor, re-check conditions */
  static async resume(stateId: string, ctx: any) {
    const eng = new FlowEngine();
    let okPath = await eng.pathToLeaf(tree, ctx, stateId); // exact leaf id
    if (!okPath) okPath = await eng.pathToLeaf(tree, ctx); // first legal leaf
    if (!okPath) throw new Error("BT has no valid leaf");

    eng.stack = okPath;
    for (const f of eng.stack) {
      if (!f.entered) {
        await run(f.node.onEnter, ctx, "");
        f.entered = true;
      }
    }
    return eng;
  }

  /* external API – unchanged ­───────────────────────────────────── */
  node(): ChatNode {
    return flow[this.stack[this.stack.length - 1]!.node.id];
  }
  id() {
    return this.node().id;
  }

  /* advance one leaf ­───────────────────────────────────────────── */
  async advance(userInput: string, ctx: any) {
    const leaf = this.node();
    if (userInput && leaf.inquiry) ctx[leaf.id] = userInput; // save answer

    /* exit current leaf */
    let childSucceeded = true;
    let childFrame = this.stack.pop()!;
    if (childFrame.entered) await run(childFrame.node.onExit, ctx, userInput);

    /* climb until we manage to descend into another leaf */
    while (this.stack.length) {
      const parent = this.stack[this.stack.length - 1]!;
      const p = parent.node;

      /* ── SEQUENCE ─────────────────────────────────────────── */
      if (p.type === "sequence") {
        if (childSucceeded) {
          for (let i = parent.index + 1; i < p.children.length; i++) {
            if (await this.descend(p.children[i]!, i, parent, ctx, userInput))
              return;
          }
        }
        childSucceeded = false; // propagate failure upward
      }

      /* ── SELECTOR ─────────────────────────────────────────── */
      else if (p.type === "selector") {
        if (childSucceeded) {
          // selector keeps using the same successful child
          if (
            await this.descend(p.children[parent.index]!, parent.index, parent, ctx, userInput)
          )
            return;
          childSucceeded = false; // child is no longer valid
        }
        for (let i = parent.index + 1; i < p.children.length; i++) {
          if (await this.descend(p.children[i]!, i, parent, ctx, userInput))
            return;
        }
        childSucceeded = false;
      }

      /* exhaustion: close this composite & pop */
      if (parent.entered) await run(p.onExit, ctx, userInput);
      this.stack.pop();
    }

    if (this.stack.length === 0 && childFrame) {
      this.stack.push(childFrame);           // keep conversation on the last leaf
    }
  }

  /* descend into the first leaf of subtree — return true if success */
  private async descend(
    node: BTNode,
    childIdx: number,
    parentFrame: Frame,
    ctx: any,
    txt: string,
  ): Promise<boolean> {
    /* conditions on the edge into this child */
    if (!(await pass(node.conditions, ctx))) return false;

    /* push the child frame */
    const frame: Frame = { node, index: 0, entered: false };
    this.stack.push(frame);
    await run(node.onEnter, ctx, txt);
    frame.entered = true;
    parentFrame.index = childIdx;

    /* leaf? great – success */
    if (node.type === "leaf") return true;

    /* composite: find first valid grand-child */
    for (let i = 0; i < node.children.length; i++) {
      if (
        await this.descend(node.children[i]!, i, frame, ctx, txt)
      )
        return true;
    }

    /* all grandchildren invalid – composite fails → unwind & pop */
    await run(node.onExit, ctx, txt);
    this.stack.pop();
    return false;
  }

  /* build initial root→leaf stack; return null if no path exists */
  private async pathToLeaf(
    node: BTNode,
    ctx: any,
    want = "",
  ): Promise<Frame[] | null> {
    if (!(await pass(node.conditions, ctx))) return null;

    if (node.type === "leaf") {
      if (want && node.id !== want) return null;
      return [{ node, index: 0, entered: false }];
    }

    for (let i = 0; i < node.children.length; i++) {
      const tail = await this.pathToLeaf(node.children[i]!, ctx, want);
      if (tail) return [{ node, index: i, entered: false }, ...tail];
    }
    return null;
  }
}
