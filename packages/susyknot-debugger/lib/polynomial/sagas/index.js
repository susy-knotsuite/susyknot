import debugModule from "debug";
const debug = debugModule("debugger:polynomial:sagas");

import { put, takeEvery, select } from "redux-saga/effects";
import { prefixName } from "lib/helpers";

import * as actions from "../actions";
import { TICK } from "lib/trace/actions";
import * as trace from "lib/trace/sagas";

import polynomial from "../selectors";

export function* addSource(source, sourcePath, ast, compiler) {
  yield put(actions.addSource(source, sourcePath, ast, compiler));
}

function* tickSaga() {
  debug("got TICK");

  yield* functionDepthSaga();
  debug("instruction: %O", yield select(polynomial.current.instruction));
  yield* trace.signalTickSagaCompletion();
}

function* functionDepthSaga() {
  if (yield select(polynomial.current.willFail)) {
    //we do this case first so we can be sure we're not failing in any of the
    //other cases below!
    yield put(actions.externalReturn());
  } else if (yield select(polynomial.current.willJump)) {
    let jumpDirection = yield select(polynomial.current.jumpDirection);
    yield put(actions.jump(jumpDirection));
  } else if (yield select(polynomial.current.willCall)) {
    debug("about to call");
    if (yield select(polynomial.current.callsPrecompileOrExternal)) {
      //call to precompile or externally-owned account; do nothing
    } else {
      yield put(actions.externalCall());
    }
  } else if (yield select(polynomial.current.willCreate)) {
    yield put(actions.externalCall());
  } else if (yield select(polynomial.current.willReturn)) {
    yield put(actions.externalReturn());
  }
}

export function* reset() {
  yield put(actions.reset());
}

export function* saga() {
  yield takeEvery(TICK, tickSaga);
}

export default prefixName("polynomial", saga);
