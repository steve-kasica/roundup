import { equals } from "../../components/OperationDetail/PackDetail/EffectsDetail/comparisonFunctions";

/**
 * Hash join algorithm for finding matches between two value sets
 */
export function hashJoin(leftValues, rightValues, comparisonFn) {
  // Build hash table for right values (probe side)
  const rightHash = new Map();
  rightValues.forEach((val) => {
    if (!rightHash.has(val)) {
      rightHash.set(val, []);
    }
    rightHash.get(val).push(val);
  });

  const oneToOneMatches = [];
  const oneToManyMatches = [];
  const unmatchedLeft = [];
  const matchedRightValues = new Set();

  // Probe with left values
  leftValues.forEach((leftVal) => {
    const currentMatches = [];

    // For equality joins, direct hash lookup
    if (comparisonFn === equals && rightHash.has(leftVal)) {
      rightHash.get(leftVal).forEach((rightVal) => {
        currentMatches.push([leftVal, rightVal]);
        matchedRightValues.add(rightVal);
      });
    } else {
      // For other comparison functions, check all right values
      for (const [rightVal] of rightHash) {
        if (comparisonFn(leftVal, rightVal)) {
          rightHash.get(rightVal).forEach((rightInstance) => {
            currentMatches.push([leftVal, rightInstance]);
            matchedRightValues.add(rightInstance);
          });
        }
      }
    }

    // Categorize matches by cardinality
    if (currentMatches.length === 0) {
      unmatchedLeft.push(leftVal);
    } else if (currentMatches.length === 1) {
      oneToOneMatches.push(...currentMatches);
    } else {
      oneToManyMatches.push(...currentMatches);
    }
  });

  // Find unmatched right values
  const unmatchedRight = rightValues.filter(
    (val) => !matchedRightValues.has(val)
  );

  return {
    oneToOneMatches,
    oneToManyMatches,
    unmatchedLeft,
    unmatchedRight,
  };
}

/**
 * Sort-merge join algorithm for sorted data
 */
export function sortMergeJoin(leftValues, rightValues, comparisonFn) {
  const sortedLeft = [...leftValues].sort();
  const sortedRight = [...rightValues].sort();

  const oneToOneMatches = [];
  const oneToManyMatches = [];
  const unmatchedLeft = [];
  const unmatchedRight = [];
  const matchedRightValues = new Set();

  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < sortedLeft.length && rightIndex < sortedRight.length) {
    const leftVal = sortedLeft[leftIndex];
    const rightVal = sortedRight[rightIndex];

    if (comparisonFn(leftVal, rightVal)) {
      const currentMatches = [];
      currentMatches.push([leftVal, rightVal]);
      matchedRightValues.add(rightVal);

      // Handle duplicate values on both sides
      let nextLeft = leftIndex + 1;
      let nextRight = rightIndex + 1;

      // Check for more matches with same left value
      while (
        nextRight < sortedRight.length &&
        comparisonFn(leftVal, sortedRight[nextRight])
      ) {
        currentMatches.push([leftVal, sortedRight[nextRight]]);
        matchedRightValues.add(sortedRight[nextRight]);
        nextRight++;
      }

      // Check for more matches with same right value
      while (
        nextLeft < sortedLeft.length &&
        comparisonFn(sortedLeft[nextLeft], rightVal)
      ) {
        currentMatches.push([sortedLeft[nextLeft], rightVal]);
        nextLeft++;
      }

      // Categorize matches by cardinality
      if (currentMatches.length === 1) {
        oneToOneMatches.push(...currentMatches);
      } else {
        oneToManyMatches.push(...currentMatches);
      }

      leftIndex++;
      rightIndex++;
    } else if (leftVal < rightVal) {
      unmatchedLeft.push(leftVal);
      leftIndex++;
    } else {
      unmatchedRight.push(rightVal);
      rightIndex++;
    }
  }

  // Add remaining unmatched values
  while (leftIndex < sortedLeft.length) {
    unmatchedLeft.push(sortedLeft[leftIndex++]);
  }
  while (rightIndex < sortedRight.length) {
    if (!matchedRightValues.has(sortedRight[rightIndex])) {
      unmatchedRight.push(sortedRight[rightIndex]);
    }
    rightIndex++;
  }

  return {
    oneToOneMatches,
    oneToManyMatches,
    unmatchedLeft,
    unmatchedRight,
  };
}

/**
 * Choose optimal join algorithm based on data characteristics
 */
export function chooseJoinAlgorithm(leftSize, rightSize, comparisonFn) {
  const totalSize = leftSize + rightSize;

  if (comparisonFn === equals && Math.min(leftSize, rightSize) < 1000) {
    return "hash"; // Hash join for equality with small datasets
  } else if (totalSize < 10000) {
    return "sortMerge"; // Sort-merge for moderate datasets
  } else {
    return "hash"; // Hash join for large datasets
  }
}
