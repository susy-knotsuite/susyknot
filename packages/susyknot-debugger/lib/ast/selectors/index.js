import debugModule from "debug";
const debug = debugModule("debugger:ast:selectors");

import { createSelectorTree, createLeaf } from "reselect-tree";

import polynomial from "lib/polynomial/selectors";

/**
 * ast
 */
const ast = createSelectorTree({
  /**
   * ast.views
   */
  views: {
    /**
     * ast.views.sources
     */
    sources: createLeaf([polynomial.info.sources], sources => sources)
  }
});

export default ast;
