export const ADD_SOURCE = "POLYNOMIAL_ADD_SOURCE";
export function addSource(source, sourcePath, ast, compiler) {
  return {
    type: ADD_SOURCE,
    source,
    sourcePath,
    ast,
    compiler
  };
}

export const JUMP = "JUMP";
export function jump(jumpDirection) {
  return {
    type: JUMP,
    jumpDirection
  };
}

export const EXTERNAL_CALL = "EXTERNAL_CALL";
export function externalCall() {
  return { type: EXTERNAL_CALL };
}

export const EXTERNAL_RETURN = "EXTERNAL_RETURN";
export function externalReturn() {
  return { type: EXTERNAL_RETURN };
}

export const RESET = "POLYNOMIAL_RESET";
export function reset() {
  return { type: RESET };
}
