// Operational Transformation functions
function transform(opA, opB) {
  let opBPrime = [];
  let indexA = 0, indexB = 0;

  while (indexA < opA.length && indexB < opB.length) {
    const actionA = opA[indexA];
    const actionB = opB[indexB];

    if (isRetain(actionA)) {
      if (isInsert(actionB)) {
        opBPrime.push(actionB);
        indexB++;
      } else if (isDelete(actionB)) {
        opBPrime.push(actionB);
        indexB++;
      } else { // Retain B
        indexA++;
        indexB++;
        opBPrime.push({ retain: actionA.retain });
      }
    } else if (isInsert(actionA)) {
      if (isInsert(actionB)) {
        // Tie-break: original author's op (A) comes first
        opBPrime.push({ retain: actionA.insert.length });
        opBPrime.push(actionB);
        indexB++;
      } else {
        // For deletes/retains in B, skip the insertion in A
        indexA++;
      }
    } else if (isDelete(actionA)) {
      indexA++;
    }
  }

  // Add remaining operations from opB
  while (indexB < opB.length) {
    opBPrime.push(opB[indexB++]);
  }

  return opBPrime;
}

function isRetain(op) {
  return op && op.retain !== undefined;
}

function isInsert(op) {
  return op && op.insert !== undefined;
}

function isDelete(op) {
  return op && op.delete !== undefined;
}

function processOperation(currentOps, newOps, revision) {
  // For simplicity, we're using a basic OT algorithm
  // In a production system, you'd need a more robust implementation
  // that handles all edge cases and maintains revision history
  
  // Apply the new operations to the current document state
  const transformedOps = transform(currentOps, newOps);
  return transformedOps;
}

module.exports = {
  transform,
  processOperation
};