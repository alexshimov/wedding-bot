/**********************************************************************
 * 100 % spec‑compliant Behaviour‑Tree cursor
 *   – every public call keeps engine.node() = current leaf
 *********************************************************************/

import { tree, flow, BTNode, ChatNode, Condition, Action } from "./flow";

/* ─── helpers ────────────────────────────────────────────────────── */
type Frame = { node: BTNode; index: number; entered: boolean };

const pass = async (conds: Condition[] | undefined, ctx: any) =>
  !conds?.length || (await Promise.all(conds.map(c => c(ctx)))).every(Boolean);

const run = async (acts: Action[] | undefined, ctx: any, txt: string) => {
  if (acts?.length) for (const a of acts) await a(ctx, txt);
};

/* ─── engine ─────────────────────────────────────────────────────── */
export class FlowEngine {
  private stack: Frame[] = [];          // root → … → current leaf

  /* ---------- static factory ------------------------------------- */
  static async resume(leafId: string, ctx: any) {
    const eng = new FlowEngine();
    eng.stack =
      (await eng.path(tree, ctx, leafId)) ||    // try exact same leaf
      (await eng.path(tree, ctx));              // else: first legal leaf

    if (!eng.stack.length) throw new Error("BT: no valid leaf");

    // fire onEnter along the rebuilt path
    for (const f of eng.stack) {
      if (!f.entered) {
        await run(f.node.onEnter, ctx, "");
        f.entered = true;
      }
    }
    return eng;
  }

  /* ---------- public API ----------------------------------------- */
  node(): ChatNode                { return flow[this.leaf().node.id]; }
  id()                            { return  this.leaf().node.id;      }

  /** tick the tree once, optionally feeding user input */
  async advance(userInput: string, ctx: any) {
    /* 0.  if the current path broke → rebuild & exit (no input yet) */
    if (!(await this.pathValid(ctx))) {
      this.stack = (await this.path(tree, ctx))!;
      return;
    }

    const cur = this.leaf().node;                 // leaf before exit
    if (userInput && cur.inquiry) ctx[cur.id] = userInput;

    /* 1. run onExit of the current leaf */
    const leafFrame = this.stack.pop()!;
    if (leafFrame.entered) await run(cur.onExit, ctx, userInput);

    /* 2. bubble results upward until a sibling succeeds             */
    while (this.stack.length) {
      const parent = this.stack[this.stack.length - 1]!;
      const p      = parent.node;

      const nextIdx =
        p.type === "sequence"
          ? parent.index + 1                             // next in order
          : 0;                                           // selector: always restart

      const ok = await this.descendUntilLeaf(
        p, nextIdx, parent, ctx, userInput
      );
      if (ok) return;                                   // found next leaf

      /* parent failed – run its onExit and pop up one level */
      if (parent.entered) await run(p.onExit, ctx, userInput);
      this.stack.pop();
    }

    /* 3. nothing left ⇒ stay on the last processed leaf            */
    this.stack.push(leafFrame);
  }

  /* ---------- private helpers ------------------------------------ */

  /** depth‑first search for first valid leaf starting with child[i] */
  private async descendUntilLeaf(
    parent: BTNode,
    startIdx: number,
    parentFrame: Frame,
    ctx: any,
    txt: string
  ): Promise<boolean> {
    if (parent.type === "leaf") return true;            // shouldn’t happen

    for (let i = startIdx; i < parent.children.length; i++) {
      const child = parent.children[i]!;
      if (!(await pass(child.conditions, ctx))) continue;

      // push child frame & fire onEnter
      const f: Frame = { node: child, index: 0, entered: false };
      this.stack.push(f);
      await run(child.onEnter, ctx, txt);
      f.entered = true;
      parentFrame.index = i;

      if (child.type === "leaf") return true;           // reached leaf

      // recurse into composites
      if (await this.descendUntilLeaf(child, 0, f, ctx, txt)) return true;

      // entire subtree failed – onExit + pop & continue loop
      await run(child.onExit, ctx, txt);
      this.stack.pop();
    }
    return false;                                      // parent fails
  }

  /** DFS helper to build a path root→leaf (optional `wantLeafId`)   */
  private async path(
    node: BTNode,
    ctx: any,
    want = ""
  ): Promise<Frame[] | null> {
    if (!(await pass(node.conditions, ctx))) return null;

    if (node.type === "leaf") {
      if (want && node.id !== want) return null;
      return [{ node, index: 0, entered: false }];
    }

    for (let i = 0; i < node.children.length; i++) {
      const tail = await this.path(node.children[i]!, ctx, want);
      if (tail) return [{ node, index: i, entered: false }, ...tail];
    }
    return null;
  }

  private leaf()            { return this.stack[this.stack.length - 1]!; }
  private async pathValid(ctx: any) {
    for (const f of this.stack)
      if (!(await pass(f.node.conditions, ctx))) return false;
    return true;
  }
}
