// @algorithm.ts/gomoku 4.0.5 (MIT); import points to the vendored queue 4.0.5.
import { PriorityQueue } from './queue.mjs';

var GomokuDirectionType;
(function (GomokuDirectionType) {
    GomokuDirectionType[GomokuDirectionType["LEFT"] = 0] = "LEFT";
    GomokuDirectionType[GomokuDirectionType["TOP_LEFT"] = 2] = "TOP_LEFT";
    GomokuDirectionType[GomokuDirectionType["TOP"] = 4] = "TOP";
    GomokuDirectionType[GomokuDirectionType["TOP_RIGHT"] = 6] = "TOP_RIGHT";
    GomokuDirectionType[GomokuDirectionType["RIGHT"] = 1] = "RIGHT";
    GomokuDirectionType[GomokuDirectionType["BOTTOM_RIGHT"] = 3] = "BOTTOM_RIGHT";
    GomokuDirectionType[GomokuDirectionType["BOTTOM"] = 5] = "BOTTOM";
    GomokuDirectionType[GomokuDirectionType["BOTTOM_LEFT"] = 7] = "BOTTOM_LEFT";
})(GomokuDirectionType || (GomokuDirectionType = {}));
const GomokuDirections = Array.from(Object.entries({
    [GomokuDirectionType.TOP]: [-1, 0],
    [GomokuDirectionType.TOP_RIGHT]: [-1, 1],
    [GomokuDirectionType.RIGHT]: [0, 1],
    [GomokuDirectionType.BOTTOM_RIGHT]: [1, 1],
    [GomokuDirectionType.BOTTOM]: [1, 0],
    [GomokuDirectionType.BOTTOM_LEFT]: [1, -1],
    [GomokuDirectionType.LEFT]: [0, -1],
    [GomokuDirectionType.TOP_LEFT]: [-1, -1],
}).reduce((acc, [key, value]) => {
    const index = Number(key);
    acc[index] = value;
    return acc;
}, []));
const GomokuDirectionTypes = {
    full: [
        GomokuDirectionType.LEFT,
        GomokuDirectionType.TOP_LEFT,
        GomokuDirectionType.TOP,
        GomokuDirectionType.TOP_RIGHT,
        GomokuDirectionType.RIGHT,
        GomokuDirectionType.BOTTOM_RIGHT,
        GomokuDirectionType.BOTTOM,
        GomokuDirectionType.BOTTOM_LEFT,
    ],
    leftHalf: [
        GomokuDirectionType.LEFT,
        GomokuDirectionType.TOP_LEFT,
        GomokuDirectionType.TOP,
        GomokuDirectionType.TOP_RIGHT,
    ],
    rightHalf: [
        GomokuDirectionType.RIGHT,
        GomokuDirectionType.BOTTOM_RIGHT,
        GomokuDirectionType.BOTTOM,
        GomokuDirectionType.BOTTOM_LEFT,
    ],
};
const GomokuDirectionTypeBitset = {
    full: GomokuDirectionTypes.full.reduce((acc, dirType) => acc | (1 << dirType), 0),
    leftHalf: GomokuDirectionTypes.leftHalf.reduce((acc, dirType) => acc | (1 << dirType), 0),
    rightHalf: GomokuDirectionTypes.rightHalf.reduce((acc, dirType) => acc | (1 << dirType), 0),
};

const createHighDimensionArray = (elementProvider, firstDimension, ...dimensions) => {
    const result = new Array(firstDimension);
    if (dimensions.length <= 0) {
        for (let i = 0; i < firstDimension; ++i) {
            result[i] = elementProvider(i);
        }
        return result;
    }
    for (let i = 0; i < firstDimension; ++i) {
        result[i] = createHighDimensionArray(elementProvider, ...dimensions);
    }
    return result;
};

const { full: fullDirectionTypes$1, rightHalf: halfDirectionTypes$2 } = GomokuDirectionTypes;
class GomokuMoverContext {
    MAX_ROW;
    MAX_COL;
    MAX_ADJACENT;
    MAX_DISTANCE_OF_NEIGHBOR;
    TOTAL_PLAYER;
    TOTAL_POS;
    MIDDLE_POS;
    board;
    _idxMap;
    _gomokuDirections;
    _maxMovableMap;
    _dirStartPosMap;
    _dirStartPosSet;
    _dirNeighborSet;
    _neighborPlacedCount;
    _rightHalfDirCountMap;
    _placedCount;
    constructor(props) {
        const { MAX_ROW, MAX_COL, MAX_ADJACENT, MAX_DISTANCE_OF_NEIGHBOR } = props;
        const _MAX_ROW = Math.max(1, MAX_ROW);
        const _MAX_COL = Math.max(1, MAX_COL);
        const _MAX_ADJACENT = Math.max(1, MAX_ADJACENT);
        const _MAX_DISTANCE_OF_NEIGHBOR = Math.max(1, MAX_DISTANCE_OF_NEIGHBOR);
        const _TOTAL_PLAYER = 2;
        const _TOTAL_POS = _MAX_ROW * _MAX_COL;
        this.MAX_ROW = _MAX_ROW;
        this.MAX_COL = _MAX_COL;
        this.MAX_ADJACENT = _MAX_ADJACENT;
        this.MAX_DISTANCE_OF_NEIGHBOR = _MAX_DISTANCE_OF_NEIGHBOR;
        this.TOTAL_PLAYER = _TOTAL_PLAYER;
        this.TOTAL_POS = _TOTAL_POS;
        this.MIDDLE_POS = _TOTAL_POS >> 1;
        this.board = new Array(_TOTAL_POS).fill(-1);
        const _idxMap = new Array(_TOTAL_POS);
        for (let r = 0; r < _MAX_ROW; ++r) {
            for (let c = 0; c < _MAX_COL; ++c) {
                const posId = this.idx(r, c);
                _idxMap[posId] = [r, c];
            }
        }
        const _gomokuDirections = GomokuDirections.map(([dr, dc]) => dr * MAX_ROW + dc);
        const _maxMovableMap = createHighDimensionArray(() => 0, fullDirectionTypes$1.length, _TOTAL_POS);
        const _dirStartPosSet = createHighDimensionArray(() => [], fullDirectionTypes$1.length);
        const _dirStartPosMap = createHighDimensionArray(() => 0, fullDirectionTypes$1.length, _TOTAL_POS);
        this.traverseAllDirections(dirType => {
            const revDirType = dirType ^ 1;
            const [dr, dc] = GomokuDirections[dirType];
            return posId => {
                const [r, c] = _idxMap[posId];
                const r2 = r + dr;
                const c2 = c + dc;
                if (r2 < 0 || r2 >= _MAX_ROW || c2 < 0 || c2 >= _MAX_ROW) {
                    _maxMovableMap[dirType][posId] = 0;
                    _dirStartPosMap[revDirType][posId] = posId;
                    _dirStartPosSet[revDirType].push(posId);
                }
                else {
                    const posId2 = this.idx(r2, c2);
                    _maxMovableMap[dirType][posId] = _maxMovableMap[dirType][posId2] + 1;
                    _dirStartPosMap[revDirType][posId] = _dirStartPosMap[revDirType][posId2];
                }
            };
        });
        const _dirNeighborSet = new Array(_TOTAL_POS);
        for (let posId = 0; posId < _TOTAL_POS; ++posId) {
            const neighbors = [];
            _dirNeighborSet[posId] = neighbors;
            for (const dirType of fullDirectionTypes$1) {
                let posId2 = posId;
                for (let step = 0; step < _MAX_DISTANCE_OF_NEIGHBOR; ++step) {
                    if (1 > _maxMovableMap[dirType][posId2])
                        break;
                    posId2 += _gomokuDirections[dirType];
                    neighbors.push(posId2);
                }
            }
        }
        const _rightHalfDirCountMap = createHighDimensionArray(() => [], fullDirectionTypes$1.length, _TOTAL_POS);
        this._gomokuDirections = _gomokuDirections;
        this._idxMap = _idxMap;
        this._maxMovableMap = _maxMovableMap;
        this._dirStartPosMap = _dirStartPosMap;
        this._dirStartPosSet = _dirStartPosSet;
        this._dirNeighborSet = _dirNeighborSet;
        this._neighborPlacedCount = new Array(_TOTAL_POS).fill(0);
        this._rightHalfDirCountMap = _rightHalfDirCountMap;
        this._placedCount = 0;
    }
    get placedCount() {
        return this._placedCount;
    }
    init(pieces) {
        const board = this.board;
        board.fill(-1);
        this._placedCount = 0;
        const { _neighborPlacedCount } = this;
        _neighborPlacedCount.fill(0);
        for (const piece of pieces) {
            const posId = this.idx(piece.r, piece.c);
            if (board[posId] >= 0)
                continue;
            board[posId] = piece.p;
            this._placedCount += 1;
            for (const neighborId of this.accessibleNeighbors(posId)) {
                _neighborPlacedCount[neighborId] += 1;
            }
        }
        const { _rightHalfDirCountMap } = this;
        for (const dirType of halfDirectionTypes$2) {
            for (const startPosId of this.getStartPosSet(dirType)) {
                const counters = _rightHalfDirCountMap[dirType][startPosId];
                let index = 0;
                const maxSteps = this.maxMovableSteps(startPosId, dirType) + 1;
                for (let i = 0, posId = startPosId, i2, posId2; i < maxSteps; i = i2, posId = posId2) {
                    const playerId = board[posId];
                    for (i2 = i + 1, posId2 = posId; i2 < maxSteps; ++i2) {
                        posId2 = this.fastMoveOneStep(posId2, dirType);
                        if (board[posId2] !== playerId)
                            break;
                    }
                    counters[index++] = { playerId, count: i2 - i };
                }
                counters.length = index;
            }
        }
    }
    forward(posId, playerId) {
        this.board[posId] = playerId;
        this._placedCount += 1;
        for (const neighborId of this.accessibleNeighbors(posId)) {
            this._neighborPlacedCount[neighborId] += 1;
        }
        for (const dirType of halfDirectionTypes$2) {
            this._updateHalfDirCounter(playerId, posId, dirType);
        }
    }
    revert(posId) {
        this.board[posId] = -1;
        this._placedCount -= 1;
        for (const neighborId of this.accessibleNeighbors(posId)) {
            this._neighborPlacedCount[neighborId] -= 1;
        }
        for (const dirType of halfDirectionTypes$2) {
            this._updateHalfDirCounter(-1, posId, dirType);
        }
    }
    idx(r, c) {
        return r * this.MAX_ROW + c;
    }
    revIdx(posId) {
        return this._idxMap[posId];
    }
    isValidPos(r, c) {
        return r >= 0 && r < this.MAX_ROW && c >= 0 && c < this.MAX_COL;
    }
    isValidIdx(posId) {
        return posId >= 0 && posId < this.TOTAL_POS;
    }
    safeMove(posId, dirType, step) {
        return step <= this._maxMovableMap[dirType][posId]
            ? posId + this._gomokuDirections[dirType] * step
            : -1;
    }
    safeMoveOneStep(posId, dirType) {
        return 1 <= this._maxMovableMap[dirType][posId] ? posId + this._gomokuDirections[dirType] : -1;
    }
    fastMove(posId, dirType, step) {
        return posId + this._gomokuDirections[dirType] * step;
    }
    fastMoveOneStep(posId, dirType) {
        return posId + this._gomokuDirections[dirType];
    }
    maxMovableSteps(posId, dirType) {
        return this._maxMovableMap[dirType][posId];
    }
    accessibleNeighbors(posId) {
        return this._dirNeighborSet[posId];
    }
    hasPlacedNeighbors(posId) {
        return this._neighborPlacedCount[posId] > 0;
    }
    couldReachFinalInDirection(playerId, posId, dirType) {
        const { MAX_ADJACENT, board } = this;
        const revDirType = dirType ^ 1;
        const maxMovableSteps0 = this.maxMovableSteps(posId, revDirType);
        const maxMovableSteps2 = this.maxMovableSteps(posId, dirType);
        if (maxMovableSteps0 + maxMovableSteps2 + 1 < MAX_ADJACENT)
            return false;
        let count = 1;
        for (let id = posId, step = 0; step < maxMovableSteps0; ++step) {
            id = this.fastMoveOneStep(id, revDirType);
            if (board[id] !== playerId)
                break;
            count += 1;
        }
        for (let id = posId, step = 0; step < maxMovableSteps2; ++step) {
            id = this.fastMoveOneStep(id, dirType);
            if (board[id] !== playerId)
                break;
            count += 1;
        }
        return count >= MAX_ADJACENT;
    }
    getStartPosId(posId, dirType) {
        return this._dirStartPosMap[dirType][posId];
    }
    getStartPosSet(dirType) {
        return this._dirStartPosSet[dirType];
    }
    getDirCounters(startPosId, dirType) {
        return this._rightHalfDirCountMap[dirType][startPosId];
    }
    traverseAllDirections(handle) {
        const { TOTAL_POS } = this;
        const { leftHalf, rightHalf } = GomokuDirectionTypes;
        for (const dirType of leftHalf) {
            const h = handle(dirType);
            for (let posId = 0; posId < TOTAL_POS; ++posId)
                h(posId);
        }
        for (const dirType of rightHalf) {
            const h = handle(dirType);
            for (let posId = TOTAL_POS - 1; posId >= 0; --posId)
                h(posId);
        }
    }
    _updateHalfDirCounter(playerId, posId, dirType) {
        const revDirType = dirType ^ 1;
        const startPosId = this.getStartPosId(posId, dirType);
        const counters = this._rightHalfDirCountMap[dirType][startPosId];
        let index = 0;
        let remain = this.maxMovableSteps(posId, revDirType) + 1;
        for (; index < counters.length; ++index) {
            const cnt = counters[index].count;
            if (cnt >= remain)
                break;
            remain -= cnt;
        }
        if (remain === 1) {
            if (counters[index].count === 1) {
                const isSameWithLeft = index > 0 && counters[index - 1].playerId === playerId;
                const isSameWithRight = index + 1 < counters.length && counters[index + 1].playerId === playerId;
                if (isSameWithLeft) {
                    if (isSameWithRight) {
                        counters[index - 1].count += 1 + counters[index + 1].count;
                        counters.splice(index, 2);
                    }
                    else {
                        counters[index - 1].count += 1;
                        counters.splice(index, 1);
                    }
                }
                else {
                    if (isSameWithRight) {
                        counters[index + 1].count += 1;
                        counters.splice(index, 1);
                    }
                    else {
                        counters[index].playerId = playerId;
                    }
                }
            }
            else {
                counters[index].count -= 1;
                if (index > 0 && counters[index - 1].playerId === playerId) {
                    counters[index - 1].count += 1;
                }
                else {
                    counters.splice(index, 0, { playerId, count: 1 });
                }
            }
        }
        else if (remain < counters[index].count) {
            const { playerId: hitPlayerId, count: hitCount } = counters[index];
            counters.splice(index, 1, { playerId: hitPlayerId, count: remain - 1 }, { playerId, count: 1 }, { playerId: hitPlayerId, count: hitCount - remain });
        }
        else {
            counters[index].count -= 1;
            if (index + 1 < counters.length && counters[index + 1].playerId === playerId) {
                counters[index + 1].count += 1;
            }
            else {
                counters.splice(index + 1, 0, { playerId, count: 1 });
            }
        }
    }
}

const { rightHalf: halfDirectionTypes$1 } = GomokuDirectionTypes;
const { rightHalf: allDirectionTypeBitset$1 } = GomokuDirectionTypeBitset;
class GomokuMoverCounter {
    context;
    _mustWinPosSet;
    _candidateCouldReachFinal;
    constructor(context) {
        this.context = context;
        this._mustWinPosSet = createHighDimensionArray(() => new Set(), context.TOTAL_PLAYER);
        this._candidateCouldReachFinal = createHighDimensionArray(() => 0, context.TOTAL_PLAYER, context.TOTAL_POS);
    }
    init() {
        this._candidateCouldReachFinal.forEach(item => item.fill(0));
        this._mustWinPosSet.forEach(set => set.clear());
        const { context } = this;
        const { TOTAL_POS, board } = context;
        const [ccrf0, ccrf1] = this._candidateCouldReachFinal;
        const [mwps0, mwps1] = this._mustWinPosSet;
        for (let posId = 0; posId < TOTAL_POS; ++posId) {
            if (board[posId] >= 0)
                continue;
            let flag0 = 0;
            let flag1 = 0;
            for (const dirType of halfDirectionTypes$1) {
                const bitFlag = 1 << dirType;
                if (context.couldReachFinalInDirection(0, posId, dirType))
                    flag0 |= bitFlag;
                if (context.couldReachFinalInDirection(1, posId, dirType))
                    flag1 |= bitFlag;
            }
            ccrf0[posId] = flag0;
            ccrf1[posId] = flag1;
            if (flag0 > 0)
                mwps0.add(posId);
            if (flag1 > 0)
                mwps1.add(posId);
        }
    }
    forward(posId) {
        this._updateRelatedCouldReachFinal(posId);
    }
    revert(posId) {
        this._updateRelatedCouldReachFinal(posId);
    }
    mustWinPosSet(playerId) {
        return this._mustWinPosSet[playerId];
    }
    candidateCouldReachFinal(playerId, posId) {
        return this._candidateCouldReachFinal[playerId][posId] > 0;
    }
    _updateRelatedCouldReachFinal(centerPosId) {
        const { context } = this;
        const { board } = context;
        this._updateCouldReachFinal(centerPosId, allDirectionTypeBitset$1);
        for (const dirType of halfDirectionTypes$1) {
            const expiredBitset = 1 << dirType;
            const revDirType = dirType ^ 1;
            const maxMovableSteps0 = context.maxMovableSteps(centerPosId, revDirType);
            for (let posId = centerPosId, step = 0; step < maxMovableSteps0; ++step) {
                posId = context.fastMoveOneStep(posId, revDirType);
                if (board[posId] < 0) {
                    this._updateCouldReachFinal(posId, expiredBitset);
                    break;
                }
            }
            const maxMovableSteps2 = context.maxMovableSteps(centerPosId, dirType);
            for (let posId = centerPosId, step = 0; step < maxMovableSteps2; ++step) {
                posId = context.fastMoveOneStep(posId, dirType);
                if (board[posId] < 0) {
                    this._updateCouldReachFinal(posId, expiredBitset);
                    break;
                }
            }
        }
    }
    _updateCouldReachFinal(posId, expiredBitset) {
        if (expiredBitset > 0) {
            const { context, _mustWinPosSet, _candidateCouldReachFinal } = this;
            const prevFlag0 = _candidateCouldReachFinal[0][posId];
            const prevFlag1 = _candidateCouldReachFinal[1][posId];
            _mustWinPosSet[0].delete(posId);
            _mustWinPosSet[1].delete(posId);
            if (context.board[posId] >= 0) {
                _candidateCouldReachFinal[0][posId] = 0;
                _candidateCouldReachFinal[1][posId] = 0;
                return;
            }
            let nextFlag0 = 0;
            let nextFlag1 = 0;
            for (const dirType of halfDirectionTypes$1) {
                const bitFlag = 1 << dirType;
                if (bitFlag & expiredBitset) {
                    if (context.couldReachFinalInDirection(0, posId, dirType))
                        nextFlag0 |= bitFlag;
                    if (context.couldReachFinalInDirection(1, posId, dirType))
                        nextFlag1 |= bitFlag;
                }
                else {
                    nextFlag0 |= prevFlag0 & bitFlag;
                    nextFlag1 |= prevFlag1 & bitFlag;
                }
            }
            _candidateCouldReachFinal[0][posId] = nextFlag0;
            _candidateCouldReachFinal[1][posId] = nextFlag1;
            if (nextFlag0 > 0)
                _mustWinPosSet[0].add(posId);
            if (nextFlag1 > 0)
                _mustWinPosSet[1].add(posId);
        }
    }
}

class GomokuMover {
    rootPlayerId;
    context;
    counter;
    state;
    constructor(props) {
        this.context = props.context;
        this.counter = props.counter;
        this.state = props.state;
        this.rootPlayerId = 0;
    }
    resetRootPlayerId(rootPlayerId) {
        this.rootPlayerId = rootPlayerId & 1;
    }
    init(pieces) {
        this.context.init(pieces);
        this.counter.init(pieces);
        this.state.init(pieces);
    }
    forward(posId, playerId) {
        const { context, counter, state } = this;
        if (context.board[posId] < 0) {
            context.forward(posId, playerId);
            counter.forward(posId, playerId);
            state.forward(posId, playerId);
        }
    }
    revert(posId) {
        const { context, counter, state } = this;
        if (context.board[posId] >= 0) {
            context.revert(posId);
            counter.revert(posId);
            state.revert(posId);
        }
    }
    expand(nextPlayerId, candidates, candidateGrowthFactor, MAX_SIZE) {
        return this.state.expand(nextPlayerId, candidates, candidateGrowthFactor, MAX_SIZE);
    }
    topCandidate(nextPlayerId) {
        return this.state.topCandidate(nextPlayerId);
    }
    score(nextPlayerId) {
        return this.state.score(nextPlayerId ^ 1, this.rootPlayerId);
    }
    isFinal() {
        return this.state.isFinal();
    }
    couldReachFinal(nextPlayerId) {
        return this.counter.mustWinPosSet(nextPlayerId).size > 0;
    }
}

const { full: fullDirectionTypes, rightHalf: halfDirectionTypes } = GomokuDirectionTypes;
const { rightHalf: allDirectionTypeBitset } = GomokuDirectionTypeBitset;
class GomokuMoverState {
    NEXT_MOVER_BUFFER = 4;
    context;
    counter;
    scoreMap;
    _candidateQueues;
    _candidateInqSets;
    _candidateSet;
    _candidateScores;
    _candidateScoreDirMap;
    _candidateScoreExpired;
    _stateScores;
    _stateScoreDirMap;
    _countOfReachFinal;
    _countOfReachFinalDirMap;
    constructor(props) {
        const { context, counter, scoreMap } = props;
        const _candidateQueues = createHighDimensionArray(() => new PriorityQueue({ compare: (x, y) => y.score - x.score }), context.TOTAL_PLAYER);
        const _candidateInqSets = createHighDimensionArray(() => new Set(), context.TOTAL_PLAYER, context.TOTAL_POS);
        const _candidateSet = new Set();
        const _candidateScores = createHighDimensionArray(() => 0, context.TOTAL_PLAYER, context.TOTAL_POS);
        const _candidateScoreDirMap = createHighDimensionArray(() => 0, context.TOTAL_PLAYER, context.TOTAL_POS, fullDirectionTypes.length);
        const _candidateScoreExpired = createHighDimensionArray(() => allDirectionTypeBitset, context.TOTAL_POS);
        const _stateScores = createHighDimensionArray(() => 0, context.TOTAL_PLAYER);
        const _stateScoreDirMap = createHighDimensionArray(() => 0, context.TOTAL_PLAYER, context.TOTAL_POS, fullDirectionTypes.length);
        const _countOfReachFinal = createHighDimensionArray(() => 0, context.TOTAL_PLAYER);
        const _countOfReachFinalDirMap = createHighDimensionArray(() => 0, context.TOTAL_PLAYER, context.TOTAL_POS, fullDirectionTypes.length);
        this.context = context;
        this.counter = counter;
        this.scoreMap = scoreMap;
        this._candidateQueues = _candidateQueues;
        this._candidateInqSets = _candidateInqSets;
        this._candidateSet = _candidateSet;
        this._candidateScores = _candidateScores;
        this._candidateScoreDirMap = _candidateScoreDirMap;
        this._candidateScoreExpired = _candidateScoreExpired;
        this._stateScores = _stateScores;
        this._stateScoreDirMap = _stateScoreDirMap;
        this._countOfReachFinal = _countOfReachFinal;
        this._countOfReachFinalDirMap = _countOfReachFinalDirMap;
    }
    init(pieces) {
        this._candidateQueues.forEach(Q => Q.init());
        this._candidateInqSets.forEach(inqSets => inqSets.forEach(inqSet => inqSet.clear()));
        this._candidateSet.clear();
        this._candidateScoreExpired.fill(allDirectionTypeBitset);
        this._stateScores.fill(0);
        this._countOfReachFinal.fill(0);
        const { context, _stateScores, _stateScoreDirMap, _countOfReachFinal, _countOfReachFinalDirMap, } = this;
        for (const dirType of halfDirectionTypes) {
            for (const startPosId of context.getStartPosSet(dirType)) {
                const { score: score0, countOfReachFinal: countOfReachFinal0 } = this._evaluateScoreInDirection(0, startPosId, dirType);
                const { score: score1, countOfReachFinal: countOfReachFinal1 } = this._evaluateScoreInDirection(1, startPosId, dirType);
                _stateScores[0] += score0;
                _stateScores[1] += score1;
                _stateScoreDirMap[0][startPosId][dirType] = score0;
                _stateScoreDirMap[1][startPosId][dirType] = score1;
                _countOfReachFinal[0] += countOfReachFinal0;
                _countOfReachFinal[1] += countOfReachFinal1;
                _countOfReachFinalDirMap[0][startPosId][dirType] = countOfReachFinal0;
                _countOfReachFinalDirMap[1][startPosId][dirType] = countOfReachFinal1;
            }
        }
        const { _candidateSet } = this;
        for (const piece of pieces) {
            const centerPosId = context.idx(piece.r, piece.c);
            for (const posId of context.accessibleNeighbors(centerPosId)) {
                if (context.board[posId] < 0)
                    _candidateSet.add(posId);
            }
        }
        if (context.board[context.MIDDLE_POS] < 0)
            _candidateSet.add(context.MIDDLE_POS);
        for (const posId of _candidateSet)
            this._reEvaluateAndEnqueueCandidate(posId);
    }
    forward(posId) {
        const { context, _candidateSet } = this;
        _candidateSet.delete(posId);
        for (const posId2 of context.accessibleNeighbors(posId)) {
            if (context.board[posId2] < 0)
                _candidateSet.add(posId2);
        }
        this._updateStateScore(posId);
        this._expireCandidates(posId);
    }
    revert(posId) {
        const { context, _candidateSet } = this;
        if (context.hasPlacedNeighbors(posId))
            _candidateSet.add(posId);
        for (const posId2 of context.accessibleNeighbors(posId)) {
            if (!context.hasPlacedNeighbors(posId2))
                _candidateSet.delete(posId2);
        }
        this._updateStateScore(posId);
        this._expireCandidates(posId);
        if (context.board[context.MIDDLE_POS] < 0 && !_candidateSet.has(context.MIDDLE_POS)) {
            _candidateSet.add(context.MIDDLE_POS);
            this._reEvaluateAndEnqueueCandidate(context.MIDDLE_POS);
        }
    }
    expand(nextPlayerId, candidates, candidateGrowthFactor, MAX_SIZE = this.context.TOTAL_POS) {
        const topCandidate = this.topCandidate(nextPlayerId);
        if (topCandidate === undefined)
            return 0;
        if (topCandidate.score === Number.MAX_VALUE) {
            candidates[0] = topCandidate;
            return 1;
        }
        const topScore = topCandidate.score;
        const { _candidateScoreExpired } = this;
        const Q = this._candidateQueues[nextPlayerId];
        const inqSets = this._candidateInqSets[nextPlayerId];
        const candidateScores = this._candidateScores[nextPlayerId];
        let _size = 0;
        let item;
        for (; _size < MAX_SIZE;) {
            item = Q.dequeue();
            if (item === undefined)
                break;
            if (_candidateScoreExpired[item.posId] === 0 && item.score === candidateScores[item.posId]) {
                if (item.score * candidateGrowthFactor < topScore) {
                    Q.enqueue(item);
                    break;
                }
                candidates[_size++] = item;
            }
            else {
                inqSets[item.posId].delete(item.score);
            }
        }
        if (Q.size > this.context.TOTAL_POS) {
            Q.exclude(item => {
                if (_candidateScoreExpired[item.posId] > 0 || item.score !== candidateScores[item.posId]) {
                    inqSets[item.posId].delete(item.score);
                    return true;
                }
                return false;
            });
        }
        candidates.length = _size;
        Q.enqueues(candidates);
        return _size;
    }
    topCandidate(nextPlayerId) {
        const mustDropPos0 = this.counter.mustWinPosSet(nextPlayerId);
        if (mustDropPos0.size > 0) {
            for (const posId of mustDropPos0)
                return { posId, score: Number.MAX_VALUE };
        }
        const mustDropPos1 = this.counter.mustWinPosSet(nextPlayerId ^ 1);
        if (mustDropPos1.size > 0) {
            for (const posId of mustDropPos1)
                return { posId, score: Number.MAX_VALUE };
        }
        const { _candidateScoreExpired } = this;
        const Q = this._candidateQueues[nextPlayerId];
        const inqSets = this._candidateInqSets[nextPlayerId];
        const candidateScores = this._candidateScores[nextPlayerId];
        let item;
        for (;;) {
            item = Q.dequeue();
            if (item === undefined)
                break;
            inqSets[item.posId].delete(item.score);
            if (_candidateScoreExpired[item.posId] === 0 && item.score === candidateScores[item.posId]) {
                break;
            }
        }
        if (item !== undefined) {
            Q.enqueue(item);
            inqSets[item.posId].add(item.score);
        }
        return item;
    }
    score(currentPlayer, scoreForPlayer) {
        const score0 = this._stateScores[scoreForPlayer];
        const score1 = this._stateScores[scoreForPlayer ^ 1];
        const nextMoverFac = this.NEXT_MOVER_BUFFER;
        return currentPlayer === scoreForPlayer
            ? score0 - score1 * nextMoverFac
            : score0 * nextMoverFac - score1;
    }
    isWin(currentPlayer) {
        return this._countOfReachFinal[currentPlayer] > 0;
    }
    isDraw() {
        return this.context.placedCount === this.context.TOTAL_POS;
    }
    isFinal() {
        const { context, _countOfReachFinal } = this;
        if (context.placedCount === context.TOTAL_POS)
            return true;
        if (_countOfReachFinal[0] > 0 || _countOfReachFinal[1] > 0)
            return true;
        return false;
    }
    _updateStateScore(posId) {
        const { context, _countOfReachFinal, _countOfReachFinalDirMap, _stateScores, _stateScoreDirMap, } = this;
        for (const dirType of halfDirectionTypes) {
            const startPosId = context.getStartPosId(posId, dirType);
            const { score: score0, countOfReachFinal: countOfReachFinal0 } = this._evaluateScoreInDirection(0, startPosId, dirType);
            const { score: score1, countOfReachFinal: countOfReachFinal1 } = this._evaluateScoreInDirection(1, startPosId, dirType);
            _stateScores[0] += score0 - _stateScoreDirMap[0][startPosId][dirType];
            _stateScores[1] += score1 - _stateScoreDirMap[1][startPosId][dirType];
            _stateScoreDirMap[0][startPosId][dirType] = score0;
            _stateScoreDirMap[1][startPosId][dirType] = score1;
            _countOfReachFinal[0] += countOfReachFinal0 - _countOfReachFinalDirMap[0][startPosId][dirType];
            _countOfReachFinal[1] += countOfReachFinal1 - _countOfReachFinalDirMap[1][startPosId][dirType];
            _countOfReachFinalDirMap[0][startPosId][dirType] = countOfReachFinal0;
            _countOfReachFinalDirMap[1][startPosId][dirType] = countOfReachFinal1;
        }
    }
    _expireCandidates(centerPosId) {
        const { context, _candidateSet, _candidateScoreExpired } = this;
        for (const dirType of halfDirectionTypes) {
            const startPosId = context.getStartPosId(centerPosId, dirType);
            const maxSteps = context.maxMovableSteps(startPosId, dirType);
            const bitMark = 1 << dirType;
            for (let posId = startPosId, step = 0;; ++step) {
                _candidateScoreExpired[posId] |= bitMark;
                if (posId !== centerPosId && _candidateSet.has(posId)) {
                    this._reEvaluateAndEnqueueCandidate(posId);
                }
                if (step === maxSteps)
                    break;
                posId = context.fastMoveOneStep(posId, dirType);
            }
        }
        if (_candidateSet.has(centerPosId))
            this._reEvaluateAndEnqueueCandidate(centerPosId);
    }
    _reEvaluateAndEnqueueCandidate(posId) {
        this._reEvaluateCandidate(posId);
        const candidateScore0 = this._candidateScores[0][posId];
        const inq0 = this._candidateInqSets[0][posId];
        if (!inq0.has(candidateScore0)) {
            inq0.add(candidateScore0);
            this._candidateQueues[0].enqueue({ posId, score: candidateScore0 });
        }
        const candidateScore1 = this._candidateScores[1][posId];
        const inq1 = this._candidateInqSets[1][posId];
        if (!inq1.has(candidateScore1)) {
            inq1.add(candidateScore1);
            this._candidateQueues[1].enqueue({ posId, score: candidateScore1 });
        }
    }
    _reEvaluateCandidate(posId) {
        const expiredBitset = this._candidateScoreExpired[posId];
        if (expiredBitset > 0) {
            const { NEXT_MOVER_BUFFER, context, _candidateScoreDirMap, _stateScoreDirMap } = this;
            let prevScore0 = 0;
            let prevScore1 = 0;
            for (const dirType of halfDirectionTypes) {
                const startPosId = context.getStartPosId(posId, dirType);
                prevScore0 += _stateScoreDirMap[0][startPosId][dirType];
                prevScore1 += _stateScoreDirMap[1][startPosId][dirType];
            }
            let score0 = 0;
            this._temporaryForward(posId, 0);
            for (const dirType of halfDirectionTypes) {
                if ((1 << dirType) & expiredBitset) {
                    const startPosId = context.getStartPosId(posId, dirType);
                    const { score } = this._evaluateScoreInDirection(0, startPosId, dirType);
                    _candidateScoreDirMap[0][posId][dirType] = score;
                    score0 += score;
                }
                else
                    score0 += _candidateScoreDirMap[0][posId][dirType];
            }
            this._temporaryRevert(posId);
            let score1 = 0;
            this._temporaryForward(posId, 1);
            for (const dirType of halfDirectionTypes) {
                if ((1 << dirType) & expiredBitset) {
                    const startPosId = context.getStartPosId(posId, dirType);
                    const { score } = this._evaluateScoreInDirection(1, startPosId, dirType);
                    _candidateScoreDirMap[1][posId][dirType] = score;
                    score1 += score;
                }
                else
                    score1 += _candidateScoreDirMap[1][posId][dirType];
            }
            this._temporaryRevert(posId);
            const deltaScore0 = score0 - prevScore0;
            const deltaScore1 = score1 - prevScore1;
            this._candidateScores[0][posId] = deltaScore0 * NEXT_MOVER_BUFFER + deltaScore1;
            this._candidateScores[1][posId] = deltaScore0 + deltaScore1 * NEXT_MOVER_BUFFER;
            this._candidateScoreExpired[posId] = 0;
        }
    }
    _evaluateScoreInDirection(playerId, startPosId, dirType) {
        const { context } = this;
        const { con, gap } = this.scoreMap;
        const { MAX_ADJACENT } = context;
        const THRESHOLD = MAX_ADJACENT - 1;
        const counters = context.getDirCounters(startPosId, dirType);
        const _size = counters.length;
        let score = 0;
        let countOfReachFinal = 0;
        for (let i = 0, j; i < _size; i = j) {
            for (; i < _size; ++i) {
                if (counters[i].playerId === playerId)
                    break;
            }
            if (i === _size)
                break;
            const hasPrefixSpaces = i > 0 && counters[i - 1].playerId < 0;
            let maxPossibleCnt = hasPrefixSpaces ? counters[i - 1].count : 0;
            for (j = i; j < _size; ++j) {
                const pid = counters[j].playerId;
                if (pid >= 0 && pid !== playerId)
                    break;
                maxPossibleCnt += counters[j].count;
            }
            if (maxPossibleCnt >= MAX_ADJACENT) {
                const i0 = hasPrefixSpaces ? i - 1 : i;
                for (let k = i, usedK = -1, leftPossibleCnt = 0; k < j; k += 2) {
                    if (k > i0)
                        leftPossibleCnt += counters[k - 1].count;
                    const isFreeSide0 = k > i0 ? 1 : 0;
                    const cnt1 = counters[k].count;
                    if (cnt1 < THRESHOLD && k + 2 < j && counters[k + 1].count === 1) {
                        if (k + 1 < j)
                            leftPossibleCnt += counters[k + 1].count;
                        const cnt2 = counters[k + 2].count;
                        if (cnt2 < THRESHOLD) {
                            const middleCnt = cnt1 + 1 + cnt2;
                            const rightPossibleCnt = maxPossibleCnt - leftPossibleCnt - middleCnt;
                            const isFreeSide2 = k + 3 < j ? 1 : 0;
                            const normalizedCnt = Math.min(cnt1 + cnt2, THRESHOLD);
                            const baseScore = gap[normalizedCnt][isFreeSide0 + isFreeSide2];
                            if (baseScore > 0)
                                score += baseScore + Math.min(leftPossibleCnt, rightPossibleCnt);
                            usedK = k + 2;
                        }
                    }
                    if (usedK < k) {
                        let normalizedCnt = cnt1;
                        if (cnt1 >= MAX_ADJACENT) {
                            normalizedCnt = MAX_ADJACENT;
                            countOfReachFinal += 1;
                        }
                        const isFreeSide2 = k + 1 < j ? 1 : 0;
                        const rightPossibleCnt = maxPossibleCnt - leftPossibleCnt - cnt1;
                        const baseScore = con[normalizedCnt][isFreeSide0 + isFreeSide2];
                        if (baseScore > 0)
                            score += baseScore + Math.min(leftPossibleCnt, rightPossibleCnt);
                    }
                    leftPossibleCnt += cnt1;
                }
            }
        }
        return { score, countOfReachFinal };
    }
    _temporaryForward(posId, playerId) {
        this.context.forward(posId, playerId);
    }
    _temporaryRevert(posId) {
        this.context.revert(posId);
    }
}

class AlphaBetaSearcher {
    MAX_CANDIDATE_COUNT;
    MIN_PROMOTION_SCORE;
    CANDIDATE_GROWTH_FACTOR;
    searchContext;
    deeperSearcher;
    _candidateCache;
    constructor(props) {
        this.MAX_CANDIDATE_COUNT = props.MAX_CANDIDATE_COUNT;
        this.MIN_PROMOTION_SCORE = props.MIN_PROMOTION_SCORE;
        this.CANDIDATE_GROWTH_FACTOR = props.CANDIDATE_GROWTH_FACTOR;
        this.searchContext = props.mover;
        this.deeperSearcher = props.deeperSearcher;
        this._candidateCache = [];
    }
    search(rootPlayerId, alpha, beta) {
        const { searchContext, _candidateCache: candidates } = this;
        const _size = searchContext.expand(rootPlayerId, candidates, this.CANDIDATE_GROWTH_FACTOR, this.MAX_CANDIDATE_COUNT);
        let bestMoveId = candidates[0].posId ?? -1;
        if (_size < 2)
            return bestMoveId;
        const nextPlayerId = rootPlayerId ^ 1;
        const { MIN_PROMOTION_SCORE, deeperSearcher } = this;
        for (let i = 0; i < _size; ++i) {
            const candidate = candidates[i];
            const posId = candidate.posId;
            searchContext.forward(posId, rootPlayerId);
            const gamma = candidate.score < MIN_PROMOTION_SCORE
                ? searchContext.score(nextPlayerId)
                : deeperSearcher.search(nextPlayerId, alpha, beta, 1);
            searchContext.revert(posId);
            if (alpha < gamma) {
                alpha = gamma;
                bestMoveId = posId;
            }
            if (beta <= alpha)
                break;
        }
        return bestMoveId;
    }
}

class DeepSearcher {
    MAX_SEARCH_DEPTH;
    MIN_PROMOTION_SCORE;
    mover;
    constructor(props) {
        this.MAX_SEARCH_DEPTH = props.MAX_SEARCH_DEPTH;
        this.MIN_PROMOTION_SCORE = props.MIN_PROMOTION_SCORE;
        this.mover = props.mover;
    }
    search(curPlayerId, alpha, beta, cur) {
        const { mover, MAX_SEARCH_DEPTH } = this;
        const { rootPlayerId } = mover;
        if (mover.couldReachFinal(curPlayerId)) {
            return curPlayerId === rootPlayerId ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
        }
        if (mover.couldReachFinal(curPlayerId ^ 1)) {
            return curPlayerId === rootPlayerId ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        }
        const candidate = mover.topCandidate(curPlayerId);
        if (candidate === undefined)
            return Number.MAX_VALUE;
        mover.forward(candidate.posId, curPlayerId);
        const gamma = cur >= MAX_SEARCH_DEPTH && candidate.score < this.MIN_PROMOTION_SCORE
            ? mover.score(curPlayerId ^ 1)
            : this.search(curPlayerId ^ 1, alpha, beta, cur + 1);
        mover.revert(candidate.posId);
        return gamma;
    }
}

class NarrowSearcher {
    MAX_SEARCH_DEPTH;
    MAX_CANDIDATE_COUNT;
    MIN_PROMOTION_SCORE;
    CANDIDATE_GROWTH_FACTOR;
    mover;
    deeperSearcher;
    _candidatesListCache;
    constructor(props) {
        this.MAX_SEARCH_DEPTH = props.MAX_SEARCH_DEPTH;
        this.MAX_CANDIDATE_COUNT = props.MAX_CANDIDATE_COUNT;
        this.MIN_PROMOTION_SCORE = props.MIN_PROMOTION_SCORE;
        this.CANDIDATE_GROWTH_FACTOR = props.CANDIDATE_GROWTH_FACTOR;
        this.mover = props.mover;
        this.deeperSearcher = props.deeperSearcher;
        this._candidatesListCache = {};
    }
    search(curPlayerId, alpha, beta, cur) {
        const { mover, MAX_SEARCH_DEPTH } = this;
        const { rootPlayerId } = mover;
        if (mover.couldReachFinal(curPlayerId)) {
            return curPlayerId === rootPlayerId ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
        }
        if (mover.couldReachFinal(curPlayerId ^ 1)) {
            return curPlayerId === rootPlayerId ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        }
        if (cur > MAX_SEARCH_DEPTH)
            return mover.score(curPlayerId);
        const candidates = this._getCandidates(cur);
        const _size = mover.expand(curPlayerId, candidates, this.CANDIDATE_GROWTH_FACTOR, this.MAX_CANDIDATE_COUNT);
        if (_size <= 0)
            return Number.MAX_VALUE;
        const { MIN_PROMOTION_SCORE, deeperSearcher } = this;
        for (let i = 0; i < _size; ++i) {
            const candidate = candidates[i];
            const posId = candidate.posId;
            mover.forward(posId, curPlayerId);
            const gamma = cur >= MAX_SEARCH_DEPTH && candidate.score >= MIN_PROMOTION_SCORE
                ? deeperSearcher.search(curPlayerId ^ 1, alpha, beta, 1)
                : this.search(curPlayerId ^ 1, alpha, beta, cur + 1);
            mover.revert(posId);
            if (curPlayerId === rootPlayerId) {
                if (alpha < gamma)
                    alpha = gamma;
            }
            else {
                if (beta > gamma)
                    beta = gamma;
            }
            if (beta <= alpha)
                break;
        }
        return curPlayerId === rootPlayerId ? alpha : beta;
    }
    _getCandidates(cur) {
        let candidates = this._candidatesListCache[cur];
        if (candidates === undefined) {
            candidates = [];
            this._candidatesListCache[cur] = candidates;
        }
        return candidates;
    }
}

const createGomokuSearcher = (props) => {
    const { narrowSearcherOptions, deepSearcherOption, searchContext } = props;
    const deepSearcher = new DeepSearcher({ ...deepSearcherOption, mover: searchContext });
    let searcher = deepSearcher;
    for (let i = narrowSearcherOptions.length - 1; i >= 0; --i) {
        const option = narrowSearcherOptions[i];
        const narrowSearcher = new NarrowSearcher({
            ...option,
            mover: searchContext,
            deeperSearcher: searcher,
        });
        searcher = narrowSearcher;
    }
    return searcher;
};
const createDefaultGomokuSearcher = (scoreMap, searchContext, options) => {
    const { MAX_ADJACENT, CANDIDATE_GROWTH_FACTOR } = options;
    const narrowSearcherOptions = [
        {
            MAX_SEARCH_DEPTH: 2,
            MAX_CANDIDATE_COUNT: 8,
            MIN_PROMOTION_SCORE: scoreMap.con[MAX_ADJACENT - 3][2] * 4,
            CANDIDATE_GROWTH_FACTOR,
        },
        {
            MAX_SEARCH_DEPTH: 4,
            MAX_CANDIDATE_COUNT: 4,
            MIN_PROMOTION_SCORE: scoreMap.con[MAX_ADJACENT - 2][1] * 2,
            CANDIDATE_GROWTH_FACTOR,
        },
        {
            MAX_SEARCH_DEPTH: 8,
            MAX_CANDIDATE_COUNT: 2,
            MIN_PROMOTION_SCORE: scoreMap.con[MAX_ADJACENT - 2][2] * 4,
            CANDIDATE_GROWTH_FACTOR,
        },
    ];
    const deepSearcherOption = {
        MAX_SEARCH_DEPTH: 16,
        MIN_PROMOTION_SCORE: scoreMap.con[MAX_ADJACENT - 1][1],
    };
    return createGomokuSearcher({ narrowSearcherOptions, deepSearcherOption, searchContext });
};

const createScoreMap = (MAX_ADJACENT) => {
    const con = new Array(MAX_ADJACENT + 1).fill([]).map(() => [0, 0, 0]);
    const gap = new Array(MAX_ADJACENT + 1).fill([]).map(() => [0, 0, 0]);
    let uintValue = 16;
    const COST_OF_GAP = uintValue * 2;
    for (let cnt = 1; cnt < MAX_ADJACENT; ++cnt, uintValue *= 16) {
        con[cnt] = [0, uintValue, uintValue * 2];
        gap[cnt] = [0, uintValue / 2 - COST_OF_GAP, uintValue - COST_OF_GAP];
    }
    const _v = con[MAX_ADJACENT - 1][1];
    gap[MAX_ADJACENT - 1] = [_v - COST_OF_GAP, _v - COST_OF_GAP / 2, _v - COST_OF_GAP / 4];
    gap[MAX_ADJACENT] = [_v - COST_OF_GAP, _v - COST_OF_GAP / 2, _v - COST_OF_GAP / 4];
    con[MAX_ADJACENT] = [uintValue, uintValue, uintValue];
    return { con, gap };
};

class GomokuSolution {
    CANDIDATE_GROWTH_FACTOR;
    scoreMap;
    mover;
    _moverContext;
    _searcher;
    constructor(props) {
        const { MAX_ROW, MAX_COL, MAX_ADJACENT = 5, MAX_DISTANCE_OF_NEIGHBOR = 2, CANDIDATE_GROWTH_FACTOR = 8, } = props;
        const _moverContext = new GomokuMoverContext({
            MAX_ROW,
            MAX_COL,
            MAX_ADJACENT,
            MAX_DISTANCE_OF_NEIGHBOR,
        });
        const scoreMap = props.scoreMap ?? createScoreMap(_moverContext.MAX_ADJACENT);
        const counter = new GomokuMoverCounter(_moverContext);
        const state = new GomokuMoverState({ context: _moverContext, counter, scoreMap });
        const mover = new GomokuMover({ context: _moverContext, counter, state });
        const _searcher = new AlphaBetaSearcher({
            MAX_CANDIDATE_COUNT: 16,
            MIN_PROMOTION_SCORE: scoreMap.con[MAX_ADJACENT - 3][1],
            CANDIDATE_GROWTH_FACTOR,
            mover,
            deeperSearcher: props.deeperSearcher?.(mover) ??
                createDefaultGomokuSearcher(scoreMap, mover, {
                    MAX_ADJACENT: _moverContext.MAX_ADJACENT,
                    CANDIDATE_GROWTH_FACTOR,
                }),
        });
        this.CANDIDATE_GROWTH_FACTOR = CANDIDATE_GROWTH_FACTOR;
        this.mover = mover;
        this.scoreMap = scoreMap;
        this._moverContext = _moverContext;
        this._searcher = _searcher;
    }
    init(pieces, searcher) {
        this.mover.init(pieces);
        if (searcher != null) {
            this._searcher = searcher;
        }
    }
    forward(r, c, playerId) {
        const { mover, _moverContext } = this;
        if (_moverContext.isValidPos(r, c)) {
            const posId = _moverContext.idx(r, c);
            mover.forward(posId, playerId);
        }
    }
    revert(r, c) {
        const { mover, _moverContext: moverContext } = this;
        if (moverContext.isValidPos(r, c)) {
            const posId = moverContext.idx(r, c);
            mover.revert(posId);
        }
    }
    minimaxSearch(nextPlayerId) {
        if (this.mover.isFinal())
            return [-1, -1];
        const { mover, _moverContext } = this;
        if (_moverContext.placedCount * 2 < _moverContext.MAX_ADJACENT) {
            const _candidates = [];
            const _size = Math.min(8, mover.expand(nextPlayerId, _candidates, 1.5));
            const index = Math.min(_size - 1, Math.round(Math.random() * _size));
            const bestMoveId = _candidates[index].posId;
            const [r, c] = _moverContext.revIdx(bestMoveId);
            return [r, c];
        }
        mover.resetRootPlayerId(nextPlayerId);
        const bestMoveId = this._searcher.search(nextPlayerId, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 1);
        if (bestMoveId < 0) {
            throw new Error('Oops! Something must be wrong, cannot find a valid moving strategy');
        }
        const [r, c] = _moverContext.revIdx(bestMoveId);
        return [r, c];
    }
}

export { AlphaBetaSearcher, DeepSearcher, GomokuDirectionType, GomokuDirectionTypeBitset, GomokuDirectionTypes, GomokuDirections, GomokuMover, GomokuMoverContext, GomokuMoverCounter, GomokuMoverState, GomokuSolution, NarrowSearcher, createDefaultGomokuSearcher, createGomokuSearcher, createHighDimensionArray, createScoreMap };
