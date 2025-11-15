
// A simple diffing utility based on the Longest Common Subsequence algorithm
// This will help generate a visual representation of text changes.

type DiffResult = { value: string; added?: boolean; removed?: boolean };

const diffChars = (oldStr: string, newStr: string): DiffResult[] => {
  const oldArr = (oldStr || '').split('');
  const newArr = (newStr || '').split('');
  const oldLen = oldArr.length;
  const newLen = newArr.length;
  const maxLen = oldLen + newLen;
  const v = { 1: 0 };
  const trace = [];

  for (let d = 0; d <= maxLen; d++) {
    trace.push({ ...v });
    for (let k = -d; k <= d; k += 2) {
      let x;
      if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
        x = v[k + 1];
      } else {
        x = v[k - 1] + 1;
      }
      let y = x - k;
      while (x < oldLen && y < newLen && oldArr[x] === newArr[y]) {
        x++;
        y++;
      }
      v[k] = x;
      if (x >= oldLen && y >= newLen) {
        // Found the end
        const result = [];
        let px = oldLen;
        let py = newLen;
        for (let i = d; i > 0; i--) {
          const pv = trace[i - 1];
          const k = px - py;
          let pvx;
          if (k === -i || (k !== i && pv[k + 1] < pv[k - 1])) {
            pvx = pv[k + 1];
          } else {
            pvx = pv[k - 1] + 1;
          }
          const ppy = pvx - k;
          while (px > pvx && py > ppy) {
            result.unshift({ value: oldArr[px - 1], added: false, removed: false });
            px--;
            py--;
          }
          if (pvx < px) {
            result.unshift({ value: oldArr[px - 1], added: false, removed: true });
            px--;
          } else {
            result.unshift({ value: newArr[py - 1], added: true, removed: false });
            py--;
          }
        }
        return result;
      }
    }
  }
  return [];
};


export const generateDiffHtml = (oldText: string, newText: string, type: 'removal' | 'addition'): string => {
  const diff = diffChars(oldText || '', newText || '');
  let html = '';
  
  diff.forEach(part => {
    const value = (part.value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    if (part.added) {
      if (type === 'addition') {
        html += `<ins class="bg-green-100 text-green-800 rounded px-1 no-underline">${value}</ins>`;
      }
    } else if (part.removed) {
      if (type === 'removal') {
        html += `<del class="bg-red-100 text-red-800 line-through rounded px-1">${value}</del>`;
      }
    } else {
      html += value;
    }
  });

  return html;
};

export const generateCombinedDiffHtml = (oldText: string, newText: string): string => {
  const diff = diffChars(oldText || '', newText || '');
  let html = '';
  
  diff.forEach(part => {
    // Sanitize the text value
    const value = (part.value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    
    if (part.added) {
      // Style for additions
      html += `<ins class="bg-green-100 text-green-800 rounded px-1 no-underline">${value}</ins>`;
    } else if (part.removed) {
      // Style for removals
      html += `<del class="bg-red-100 text-red-800 line-through rounded px-1">${value}</del>`;
    } else {
      // Unchanged text
      html += value;
    }
  });

  return html;
};