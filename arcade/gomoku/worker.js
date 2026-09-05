import { GomokuSolution, DeepSearcher } from '/lib/gomoku/gomoku.mjs';

onmessage = ({ data: moves }) => {
  const solution = new GomokuSolution({
    MAX_ROW: 15, MAX_COL: 15,
    // ponytail: bounded casual opponent; deepen search for a future difficulty mode.
    deeperSearcher: mover => new DeepSearcher({ mover, MAX_SEARCH_DEPTH: 2, MIN_PROMOTION_SCORE: 1 })
  });
  solution.init(moves);
  postMessage(solution.minimaxSearch(0));
};
